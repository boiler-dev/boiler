import { join } from "path"
import { pathExists } from "fs-extra"
import npm from "../npm"
import installBoiler from "./installBoiler"

export class InitBoiler {
  async run(
    destDir: string,
    ...paths: string[]
  ): Promise<void> {
    if (!paths.length) {
      paths = [destDir]
    }

    for (const relPath of paths) {
      let path: string

      if (await pathExists(relPath)) {
        path = relPath
      } else {
        path = join(destDir, relPath)
      }

      if (await pathExists(path)) {
        await installBoiler.run(
          path,
          "git@github.com:boiler-dev/package-json-boiler.git",
          "git@github.com:boiler-dev/ts-boiler.git"
        )
        await npm.install(destDir, ["boiler-dev"], {
          saveDev: true,
        })
      } else {
        console.error(`⚠️ Path not found: ${path}`)
        process.exit(1)
      }
    }
  }
}

export default new InitBoiler()
