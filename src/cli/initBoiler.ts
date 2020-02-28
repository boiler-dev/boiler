import { basename, join } from "path"
import inquirer from "inquirer"
import { pathExists, ensureDir, writeFile } from "fs-extra"

import git from "../git"
import generateBoiler from "./generateBoiler"

export class InitBoiler {
  async run(
    rootDirPath: string,
    ...paths: string[]
  ): Promise<void> {
    if (!paths.length) {
      paths = [rootDirPath]
    }

    for (const relPath of paths) {
      let path = join(rootDirPath, relPath)
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

    const { repo } = await inquirer.prompt([
      {
        type: "input",
        name: "repo",
        message: "git repository url",
      },
    ])

    await writeFile(
      join(path, "boiler.ts"),
      `import {
  InstallBoiler,
  PromptBoiler,
  GenerateBoiler,
  UninstallBoiler,
} from "boiler-dev"

export const install: InstallBoiler = async ({
  files,
  rootDirPath,
}) => {}

export const prompt: PromptBoiler = async ({
  files,
  rootDirPath,
}) => {
  const prompts = []
  return prompts
}

export const generate: GenerateBoiler = async ({
  answers,
  files,
  rootDirPath,
}) => {
  const actions = []
  return actions
}

export const uninstall: UninstallBoiler = async ({
  answers,
  files,
  rootDirPath,
}) => {}
`
    )

    await git.remote(path, repo)
    await git.add(path)
    await git.commit(path, "First commit")
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
