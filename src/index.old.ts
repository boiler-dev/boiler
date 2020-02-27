import { basename, join } from "path"
import inquirer from "inquirer"
import { pathExists, readFile } from "fs-extra"

import actions from "./actions"
import boilerFromArg from "./boilerFromArg"
import chmod from "./chmod"
import fs from "./fs"
import git from "./git"
import npm from "./npm"
import ts from "./ts"

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
  destDir: string
  files: BoilerFile[]
}

export interface BoilerPaths {
  dirPath: string
  distDirPath: string
  distJsPath: string
  distJsExists: boolean
  jsPath: string
  jsExists: boolean
  tsExists: boolean
  tsPath: string
}

export interface BoilerRecord {
  answers: Record<string, any>
  repo: string
  version?: string
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
  install: InstallBoiler
  prompt: PromptBoiler
  generate: GenerateBoiler
  uninstall: UninstallBoiler
}

export class Boiler {
  answers: Record<string, Record<string, any>>
  files: Record<string, BoilerFile[]>
  paths: Record<string, BoilerPaths>

  async install(
    destDir: string,
    boilerName: string
  ): Promise<void> {
    const {
      dirPath,
      distJsExists,
      jsExists,
      tsExists,
      distJsPath,
      jsPath,
      tsPath,
    } = await this.buildPaths(destDir, boilerName)

    if (!jsExists && !distJsExists && tsExists) {
      await ts.transpile(tsPath, distJsPath)
    }

    if (jsExists || tsExists) {
      const boiler = (await import(
        jsExists ? jsPath : distJsPath
      )) as BoilerInstance

      const files = await Promise.all(
        (await fs.nestedFiles(dirPath)).map(async path => {
          return {
            name: basename(path),
            path,
            source: (await readFile(path)).toString(),
          }
        })
      )

      if (setup && boiler.install) {
        await boiler.install({
          destDir,
          files,
        })
      }
    }
  }

  async importBoiler(
    destDir: string,
    boilerName: string
  ): Promise<BoilerInstance> {
    const {
      distJsExists,
      jsExists,
      tsExists,
      distJsPath,
      jsPath,
      tsPath,
    } = await this.buildPaths(destDir, boilerName)

    if (!jsExists && !distJsExists && tsExists) {
      await ts.transpile(tsPath, distJsPath)
    }

    if (jsExists || tsExists) {
      return (await import(
        jsExists ? jsPath : distJsPath
      )) as BoilerInstance
    }
  }

  async buildFiles(
    dirPath: string,
    boilerName: string
  ): Promise<BoilerFile[]> {
    if (!this.files[boilerName]) {
      this.files[boilerName] = await Promise.all(
        (await fs.nestedFiles(dirPath)).map(async path => {
          return {
            name: basename(path),
            path,
            source: (await readFile(path)).toString(),
          }
        })
      )
    }
    return this.files[boilerName]
  }

  async prompt(
    destDir: string,
    boilerRecord: BoilerRecord
  ): Promise<void> {
    const { answers, repo } = boilerRecord
    const boilerName = boilerFromArg(repo)

    const {
      dirPath,
      jsExists,
      tsExists,
    } = await this.buildPaths(destDir, boilerName)

    const boiler = await this.importBoiler(
      destDir,
      boilerName
    )

    const files = await this.buildFiles(dirPath, boilerName)

    if (boiler.prompt && (jsExists || tsExists)) {
      let prompts = await boiler.prompt({
        answers,
        destDir,
        files,
      })

      prompts = prompts.filter(
        prompt =>
          answers[prompt.name] === undefined ||
          answers[prompt.name] === null
      )

      const newAnswers = await inquirer.prompt(prompts)

      Object.assign(answers, newAnswers)
    }

    this.answers[boilerName] = answers
  }

  async generate(
    destDir: string,
    boilerName: string
  ): Promise<{ dev: string[]; prod: string[] }> {
    const answers = this.answers[boilerName]
    const npmModules = { dev: [], prod: [] }

    const {
      dirPath,
      jsExists,
      tsExists,
    } = await this.buildPaths(destDir, boilerName)

    const boiler = await this.importBoiler(
      destDir,
      boilerName
    )

    const files = await this.buildFiles(dirPath, boilerName)

    if (boiler.generate && (jsExists || tsExists)) {
      const boilerActions = await boiler.generate({
        answers,
        destDir,
        files,
      })

      for (const record of boilerActions) {
        if (!record) {
          continue
        }

        const { action, dev } = record
        const { source } = record

        if (action === "write") {
          await actions.write(record)
        }

        if (action === "merge") {
          await actions.merge(record)
        }

        if (action === "npmInstall") {
          const key = dev ? "dev" : "prod"
          npmModules[key] = npmModules[key].concat(source)
        }
      }

      return npmModules
    }
  }

  cleanup(boilerRecord: BoilerRecord): void {
    const { answers } = boilerRecord
    const nullPrompts = {}

    for (const answer in answers) {
      if (answers[answer] === null) {
        nullPrompts[prompt.name] = null
      }
    }

    Object.assign(answers, nullPrompts)
  }

  async buildPaths(
    destDir: string,
    boilerName: string
  ): Promise<BoilerPaths> {
    if (this.paths[boilerName]) {
      return this.paths[boilerName]
    }

    const dirPath = join(destDir, "boiler", boilerName)
    const distDirPath = join(
      destDir,
      "dist/boiler",
      boilerName
    )

    const jsPath = join(dirPath, "boiler.js")
    const tsPath = join(dirPath, "boiler.ts")
    const distJsPath = join(distDirPath, "boiler.js")

    const [
      jsExists,
      tsExists,
      distJsExists,
    ] = await Promise.all([
      pathExists(jsPath),
      pathExists(tsPath),
      pathExists(distJsPath),
    ])

    return {
      dirPath,
      distDirPath,
      distJsPath,
      distJsExists,
      jsPath,
      jsExists,
      tsExists,
      tsPath,
    }
  }
}

export default new Boiler()
export { chmod, fs, git, npm, ts }
