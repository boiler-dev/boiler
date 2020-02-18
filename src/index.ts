import { basename, join } from "path"
import inquirer from "inquirer"
import { pathExists, readFile } from "fs-extra"

import actions from "./actions"
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
  setup: boolean
}

export interface BoilerPaths {
  boilerDir: string
  boilerDistDir: string
  boilerDistJs: string
  boilerDistJsExists: boolean
  boilerJs: string
  boilerJsExists: boolean
  boilerTsExists: boolean
  boilerTs: string
}

export interface BoilerRecord {
  answers: Record<string, any>
  repo: string
}

export type SetupBoiler = (
  input: BoilerInput
) => Promise<void>

export type TeardownBoiler = (
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

export type InstallBoiler = (
  input: BoilerInput
) => Promise<BoilerAction[]>

export interface BoilerInstance {
  setupBoiler: SetupBoiler
  teardownBoiler: TeardownBoiler
  promptBoiler: PromptBoiler
  installBoiler: InstallBoiler
}

export class Boiler {
  async setup(
    boilerName: string,
    destDir: string,
    setup?: boolean
  ): Promise<{
    boiler: BoilerInstance
    boilerName: string
    files: BoilerFile[]
  }> {
    const {
      boilerDir,
      boilerDistJs,
      boilerDistJsExists,
      boilerJs,
      boilerJsExists,
      boilerTsExists,
      boilerTs,
    } = await this.paths(destDir, boilerName)

    if (
      !boilerJsExists &&
      !boilerDistJsExists &&
      boilerTsExists
    ) {
      await ts.transpile(boilerTs, boilerDistJs)
    }

    if (boilerJsExists || boilerTsExists) {
      const boiler = (await import(
        boilerJsExists ? boilerJs : boilerDistJs
      )) as BoilerInstance

      const files = await Promise.all(
        (await fs.nestedFiles(boilerDir)).map(
          async path => {
            return {
              name: basename(path),
              path,
              source: (await readFile(path)).toString(),
            }
          }
        )
      )

      if (setup && boiler.setupBoiler) {
        await boiler.setupBoiler({ destDir, files, setup })
      }

      return { boiler, boilerName, files }
    }
  }

  async prompt(
    boiler: BoilerInstance,
    boilerRecord: BoilerRecord,
    boilerName: string,
    destDir: string,
    files: BoilerFile[],
    setup?: boolean
  ): Promise<void> {
    const { answers } = boilerRecord

    const {
      boilerJsExists,
      boilerTsExists,
    } = await this.paths(destDir, boilerName)

    if (
      boiler.promptBoiler &&
      (boilerJsExists || boilerTsExists)
    ) {
      let prompts = await boiler.promptBoiler({
        answers,
        destDir,
        files,
        setup,
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

  async install(
    boiler: BoilerInstance,
    boilerRecord: BoilerRecord,
    boilerName: string,
    destDir: string,
    files: BoilerFile[],
    setup?: boolean
  ): Promise<void> {
    const { answers } = boilerRecord

    const {
      boilerJsExists,
      boilerTsExists,
    } = await this.paths(destDir, boilerName)

    if (
      boiler.installBoiler &&
      (boilerJsExists || boilerTsExists)
    ) {
      const installActions = await boiler.installBoiler({
        answers,
        destDir,
        files,
        setup,
      })

      for (const record of installActions) {
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
          await npm.install(destDir, source, {
            saveDev: dev,
          })
        }
      }
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

  async paths(
    destDir: string,
    boilerName: string
  ): Promise<BoilerPaths> {
    const boilerDir = join(destDir, "boiler", boilerName)
    const boilerDistDir = join(
      destDir,
      "dist/boiler",
      boilerName
    )

    const boilerJs = join(boilerDir, "boiler.js")
    const boilerTs = join(boilerDir, "boiler.ts")
    const boilerDistJs = join(boilerDistDir, "boiler.js")

    const [
      boilerJsExists,
      boilerTsExists,
      boilerDistJsExists,
    ] = await Promise.all([
      pathExists(boilerJs),
      pathExists(boilerTs),
      pathExists(boilerDistJs),
    ])

    return {
      boilerDir,
      boilerDistDir,
      boilerDistJs,
      boilerDistJsExists,
      boilerJs,
      boilerJsExists,
      boilerTsExists,
      boilerTs,
    }
  }
}

export default new Boiler()
export { chmod, fs, git, npm, ts }
