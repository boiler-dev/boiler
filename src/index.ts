import { basename, join } from "path"
import {
  readJson,
  pathExists,
  readFile,
  writeJson,
} from "fs-extra"
import inquirer from "inquirer"

import actions from "./actions"
import chmod from "./chmod"
import fs from "./fs"
import git from "./git"
import npm from "./npm"
import ts from "./ts"

export interface BoilerRecord {
  answers: Record<string, any>
  repo: string
  version?: string
}

export interface BoilerPaths {
  rootDirPath: string
  distDirPath: string

  boilerJsExists: boolean
  boilerJsPath: string

  boilerTsExists: boolean
  boilerTsPath: string

  distJsExists: boolean
  distJsPath: string
}

export interface BoilerAction {
  action: string
  bin?: boolean
  dev?: boolean
  path: string
  source: any
}

export interface BoilerFile {
  name: string
  path: string
  source: string
}

export interface BoilerInput {
  answers?: Record<string, any>
  files: BoilerFile[]
  rootDirPath: string
}

export type InstallBoiler = (
  input: BoilerInput
) => Promise<void>

export type UninstallBoiler = (
  input: BoilerInput
) => Promise<void>

export type PromptBoiler = (
  input: BoilerInput
) => Promise<
  {
    type: string
    name: string
    default: any
    message: string
    choices?: Record<string, any>[]
  }[]
>

export type GenerateBoiler = (
  input: BoilerInput
) => Promise<BoilerAction[]>

export interface BoilerInstance {
  regenerate: boolean
  install: InstallBoiler
  prompt: PromptBoiler
  generate: GenerateBoiler
  uninstall: UninstallBoiler
}

export interface BoilerNpmModules {
  dev: string[]
  prod: string[]
}

export class Boiler {
  files: Record<string, BoilerFile[]> = {}
  instances: Record<string, BoilerInstance> = {}
  npmModules: Record<string, BoilerNpmModules> = {}
  paths: Record<string, BoilerPaths> = {}
  records: Record<string, BoilerRecord[]> = {}

  async generate(
    rootDirPath: string,
    boilerName: string
  ): Promise<void> {
    const { answers } = this.records[rootDirPath].find(
      ({ repo }) => {
        return this.boilerName(repo) === boilerName
      }
    )

    const {
      boilerJsExists,
      boilerTsExists,
    } = await this.loadPaths(rootDirPath, boilerName)

    const boiler = await this.loadInstance(
      rootDirPath,
      boilerName
    )

    const files = await this.loadFiles(
      rootDirPath,
      boilerName
    )

    if (
      boiler.generate &&
      (boilerJsExists || boilerTsExists)
    ) {
      const boilerActions = await boiler.generate({
        answers,
        rootDirPath,
        files,
      })

      for (const record of boilerActions) {
        if (!record) {
          continue
        }

        const { action } = record

        if (action === "write") {
          await actions.write(record)
        }

        if (action === "merge") {
          await actions.merge(record)
        }

        if (action === "npmInstall") {
          actions.npmInstall(
            rootDirPath,
            this.npmModules,
            record
          )
        }
      }
    }
  }

  async install(
    rootDirPath: string,
    boilerName: string
  ): Promise<void> {
    const boiler = await this.loadInstance(
      rootDirPath,
      boilerName
    )

    if (boiler) {
      const files = await this.loadFiles(
        rootDirPath,
        boilerName
      )

      if (boiler.install) {
        await boiler.install({
          rootDirPath,
          files,
        })
      }
    }
  }

  async prompt(
    rootDirPath: string,
    boilerRecord: BoilerRecord
  ): Promise<void> {
    const { answers, repo } = boilerRecord
    const boilerName = this.boilerName(repo)

    const {
      boilerJsExists,
      boilerTsExists,
    } = await this.loadPaths(rootDirPath, boilerName)

    const boiler = await this.loadInstance(
      rootDirPath,
      boilerName
    )

    const files = await this.loadFiles(
      rootDirPath,
      boilerName
    )

    if (
      boiler.prompt &&
      (boilerJsExists || boilerTsExists)
    ) {
      let prompts = await boiler.prompt({
        answers,
        files,
        rootDirPath,
      })

      prompts = prompts.filter(
        prompt =>
          answers[prompt.name] === undefined ||
          answers[prompt.name] === null
      )

      const newAnswers = await inquirer.prompt(prompts)

      Object.assign(answers, newAnswers)
    }
  }

  async load(rootDirPath: string): Promise<BoilerRecord[]> {
    const jsonPath = join(rootDirPath, ".boiler.json")

    if (await pathExists(jsonPath)) {
      this.records[rootDirPath] = await readJson(jsonPath)
      return this.records[rootDirPath]
    }
  }

  async loadInstance(
    rootDirPath: string,
    boilerName: string
  ): Promise<BoilerInstance> {
    if (this.instances[boilerName]) {
      return this.instances[boilerName]
    }

    const {
      distJsExists,
      distJsPath,
      boilerJsExists,
      boilerJsPath,
      boilerTsExists,
      boilerTsPath,
    } = await this.loadPaths(rootDirPath, boilerName)

    if (
      !boilerJsExists &&
      !distJsExists &&
      boilerTsExists
    ) {
      await ts.transpile(boilerTsPath, distJsPath)
    }

    if (boilerJsExists || boilerTsExists) {
      this.instances[boilerName] = (await import(
        boilerJsExists ? boilerJsPath : distJsPath
      )) as BoilerInstance
    }

    return this.instances[boilerName]
  }

  async loadFiles(
    rootDirPath: string,
    boilerName: string
  ): Promise<BoilerFile[]> {
    if (this.files[boilerName]) {
      return this.files[boilerName]
    }

    const boilerPath = join(
      rootDirPath,
      "boiler",
      boilerName
    )

    this.files[boilerName] = await Promise.all(
      (await fs.nestedFiles(boilerPath)).map(async path => {
        return {
          name: basename(path),
          path,
          source: (await readFile(path)).toString(),
        }
      })
    )

    return this.files[boilerName]
  }

  async loadPaths(
    rootDirPath: string,
    boilerName: string
  ): Promise<BoilerPaths> {
    if (this.paths[boilerName]) {
      return this.paths[boilerName]
    }

    const [dirPath, distDirPath] = [
      join(rootDirPath, "boiler", boilerName),
      join(rootDirPath, "dist/boiler", boilerName),
    ]

    const [boilerJsPath, boilerTsPath, distJsPath] = [
      join(dirPath, "boiler.js"),
      join(dirPath, "boiler.ts"),
      join(distDirPath, "boiler.js"),
    ]

    const [
      boilerJsExists,
      boilerTsExists,
      distJsExists,
    ] = await Promise.all([
      pathExists(boilerJsPath),
      pathExists(boilerTsPath),
      pathExists(distJsPath),
    ])

    this.paths[boilerName] = {
      rootDirPath,
      distDirPath,
      distJsPath,
      distJsExists,
      boilerJsPath,
      boilerJsExists,
      boilerTsExists,
      boilerTsPath,
    }

    return this.paths[boilerName]
  }

  async addRecord(
    rootDirPath: string,
    boilerName: string,
    record: BoilerRecord
  ): Promise<void> {
    const { version } = record

    if (!version) {
      const version = await git.commitHash(
        join(rootDirPath, "boiler", boilerName)
      )

      this.records[rootDirPath].push({ ...record, version })
    }
  }

  boilerName(repo: string): string {
    const nameMatch = repo.match(/([^\/.]+)\.*[git/]*$/)

    if (!nameMatch) {
      console.error(
        "Argument should be a git repository or `boiler/[name]`."
      )
      process.exit(1)
    }

    const [, name] = nameMatch

    return name
  }

  async argsToRecords(
    rootDirPath: string,
    args: string[],
    regenerate?: boolean
  ): Promise<BoilerRecord[]> {
    const repos = this.records[rootDirPath].map(
      ({ repo }) => repo
    )

    const boilerNames = repos.map(this.boilerName)

    return Promise.all(
      args.map(async arg => {
        let index = repos.indexOf(arg)

        if (index === -1) {
          index = boilerNames.indexOf(this.boilerName(arg))
        }

        if (index > -1 && regenerate) {
          const instance = await this.loadInstance(
            rootDirPath,
            arg
          )

          if (instance && instance.regenerate) {
            return { answers: {}, repo: repos[index] }
          } else {
            return this.records[rootDirPath][index]
          }
        } else if (index > -1) {
          return this.records[rootDirPath][index]
        } else if (arg.match(/\.git$/)) {
          return { answers: {}, repo: arg }
        } else {
          console.error(`Can't understand ${arg} 😔`)
          process.exit(1)
        }
      })
    )
  }

  async npmInstall(rootDirPath: string): Promise<void> {
    await npm.install(
      rootDirPath,
      this.npmModules[rootDirPath].dev,
      {
        saveDev: true,
      }
    )

    await npm.install(
      rootDirPath,
      this.npmModules[rootDirPath].prod
    )
  }

  async writeRecords(rootDirPath: string): Promise<void> {
    const jsonPath = join(rootDirPath, ".boiler.json")

    await writeJson(jsonPath, this.records[rootDirPath], {
      spaces: 2,
    })
  }
}

export default new Boiler()
export { actions, chmod, fs, git, npm, ts }
