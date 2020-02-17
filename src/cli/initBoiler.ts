import { basename, join } from "path"
import { pathExists, ensureDir, writeFile } from "fs-extra"

import git from "../git"
import npm from "../npm"
import installBoiler from "./installBoiler"
import setupBoiler from "./setupBoiler"

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
        await setupBoiler.run(destDir)
        await this.initBoiler(path)
        return
      }

      if (!(await pathExists(path))) {
        path = relPath
      }

      if (await pathExists(path)) {
        await this.initProject(destDir, path)
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
import { SetupBoiler, PromptBoiler, InstallBoiler, TeardownBoiler } from "boiler-dev"

export const setupBoiler: SetupBoiler = async ({ destDir, files }) => {}

export const promptBoiler: PromptBoiler = async ({ destDir, files }) => {
  return []
}

export const installBoiler: InstallBoiler = async ({ answers, destDir, files }) => {
  return []
}

export const teardownBoiler: TeardownBoiler = async ({ answers, destDir, files }) => {}
`
    )
  }

  async initProject(
    destDir: string,
    path: string
  ): Promise<void> {
    await installBoiler.run(
      path,
      "git@github.com:boiler-dev/package-json-boiler.git",
      "git@github.com:boiler-dev/ts-boiler.git"
    )
    await npm.install(destDir, ["boiler-dev"], {
      saveDev: true,
    })
  }
}

export default new InitBoiler()
