import { basename, join } from "path"
import { pathExists, ensureDir, writeFile } from "fs-extra"

import git from "../git"
import generateBoiler from "./generateBoiler"

export class InitBoiler {
  async run(
    destDir: string,
    ...paths: string[]
  ): Promise<void> {
    if (!paths.length) {
      paths = [destDir]
    }

    for (const relPath of paths) {
      let path = join(destDir, relPath)
      const parentDir = join(path, "../")

      const isBoiler =
        basename(parentDir) === "boiler" &&
        (await pathExists(parentDir))

      if (isBoiler) {
        await this.initBoiler(path)
        return
      }

      if (!(await pathExists(path))) {
        path = relPath
      }

      if (await pathExists(path)) {
        await this.initProject(path)
      } else {
        console.error(`⚠️ Path not found: ${path}`)
        process.exit(1)
      }
    }
  }

  async initBoiler(path: string): Promise<void> {
    await ensureDir(path)
    await git.init(path)
    await writeFile(
      join(path, "boiler.ts"),
      `
import {
  SetupBoiler,
  PromptBoiler,
  InstallBoiler,
  TeardownBoiler,
} from "boiler-dev"

export const setupBoiler: SetupBoiler = async ({
  destDir,
  files,
}) => {}

export const promptBoiler: PromptBoiler = async ({
  destDir,
  files,
}) => {
  const prompts = []
  return prompts
}

export const installBoiler: InstallBoiler = async ({
  answers,
  destDir,
  files,
}) => {
  const actions = []
  return actions
}

export const teardownBoiler: TeardownBoiler = async ({
  answers,
  destDir,
  files,
}) => {}
`
    )
  }

  async initProject(path: string): Promise<void> {
    await generateBoiler.run(
      path,
      "git@github.com:boiler-dev/package-json-boiler.git",
      "git@github.com:boiler-dev/ts-boiler.git",
      "git@github.com:boiler-dev/eslint-prettier-ts-boiler.git",
      "git@github.com:boiler-dev/release-boiler.git",
      "git@github.com:boiler-dev/mocha-boiler.git",
      "git@github.com:boiler-dev/vscode-watch-boiler.git"
    )
  }
}

export default new InitBoiler()
