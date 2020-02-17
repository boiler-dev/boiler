import { basename, extname, join } from "path"
import inquirer from "inquirer"
import {
  pathExists,
  readFile,
  writeFile,
  ensureFile,
  readJson,
  writeJson,
} from "fs-extra"

import fs from "./fs"
import git from "./git"
import npm from "./npm"

export interface BoilerInput {
  answers?: Record<string, any>
  destDir: string
  files: {
    name: string
    path: string
    source: string
  }[]
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
  { path: string; source: string; action: string }[]
>

export interface BoilerInstance {
  setupBoiler: SetupBoiler
  teardownBoiler: TeardownBoiler
  promptBoiler: PromptBoiler
  installBoiler: InstallBoiler
}

export class Boiler {
  async run(
    boilerName: string,
    destDir: string,
    setup?: boolean
  ): Promise<void> {
    const boilerDir = join(destDir, "boiler", boilerName)
    const boilerDistDir = join(
      destDir,
      "dist/boiler",
      boilerName
    )

    const boilerJs = join(boilerDir, "boiler.js")
    const boilerJsExists = await pathExists(boilerJs)

    const boilerDistJs = join(boilerDistDir, "boiler.js")
    const boilerDistJsExists = await pathExists(
      boilerDistJs
    )

    if (boilerJsExists || boilerDistJsExists) {
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
        await boiler.setupBoiler({ destDir, files })
      }

      let answers = {}

      if (boiler.promptBoiler) {
        const prompts = await boiler.promptBoiler({
          destDir,
          files,
        })
        answers = await inquirer.prompt(prompts)
      }

      if (boiler.installBoiler) {
        const actions = await boiler.installBoiler({
          answers,
          destDir,
          files,
        })

        for (const record of actions) {
          if (!record) {
            continue
          }

          const { action, path } = record
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
          }

          if (action === "merge") {
            let json = {}

            if (await pathExists(path)) {
              json = await readJson(path)
            }

            await writeJson(
              path,
              Object.assign(json, source),
              { spaces: 2 }
            )
          }
        }
      }
    }
  }
}

export default new Boiler()
export { fs, git, npm }
