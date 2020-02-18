import { basename, extname, join } from "path"
import deepmerge from "deepmerge"
import inquirer from "inquirer"
import {
  pathExists,
  readFile,
  writeFile,
  ensureFile,
  readJson,
  writeJson,
} from "fs-extra"

import chmod from "./chmod"
import fs from "./fs"
import git from "./git"
import npm from "./npm"
import ts from "./ts"

export interface BoilerInput {
  answers?: Record<string, any>
  destDir: string
  files: {
    name: string
    path: string
    source: string
  }[]
  setup: boolean
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
) => Promise<
  {
    action: string
    bin?: boolean
    dev?: boolean
    path: string
    source: any
  }[]
>

export interface BoilerInstance {
  setupBoiler: SetupBoiler
  teardownBoiler: TeardownBoiler
  promptBoiler: PromptBoiler
  installBoiler: InstallBoiler
}

export class Boiler {
  async run(
    boilerRecord: BoilerRecord,
    boilerName: string,
    destDir: string,
    setup?: boolean
  ): Promise<void> {
    const nullPrompts = {}
    const { answers } = boilerRecord

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

      if (boiler.promptBoiler) {
        let prompts = await boiler.promptBoiler({
          answers,
          destDir,
          files,
          setup,
        })

        for (const prompt of prompts) {
          if (answers[prompt.name] === null) {
            nullPrompts[prompt.name] = null
          }
        }

        prompts = prompts.filter(
          prompt =>
            answers[prompt.name] === undefined ||
            answers[prompt.name] === null
        )

        const newAnswers = await inquirer.prompt(prompts)

        Object.assign(answers, newAnswers)
      }

      if (boiler.installBoiler) {
        const actions = await boiler.installBoiler({
          answers,
          destDir,
          files,
          setup,
        })

        for (const record of actions) {
          if (!record) {
            continue
          }

          const { action, bin, dev, path } = record
          let { source } = record

          if (action === "write") {
            await ensureFile(path)

            if (
              extname(path) === ".json" &&
              typeof source !== "string"
            ) {
              source = JSON.stringify(source, null, 2)
            }

            await writeFile(path, source)

            if (bin) {
              await chmod.makeExecutable(path)
            }
          }

          if (action === "merge") {
            let json = {}

            if (await pathExists(path)) {
              json = await readJson(path)
            }

            await writeJson(path, deepmerge(json, source), {
              spaces: 2,
            })
          }

          if (action === "npmInstall") {
            await npm.install(destDir, source, {
              saveDev: dev,
            })
          }
        }
      }

      Object.assign(answers, nullPrompts)
    }
  }
}

export default new Boiler()
export { chmod, fs, git, npm, ts }
