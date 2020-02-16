import { join } from "path"
import {
  ensureFile,
  pathExists,
  readFile,
  readJson,
  writeFile,
  writeJson,
} from "fs-extra"

export class SetupBoiler {
  async run(destDir: string): Promise<void> {
    const gitignorePath = join(destDir, ".gitignore")

    await ensureFile(gitignorePath)
    const gitignore = await readFile(gitignorePath)

    if (!gitignore.toString().match(/^\/boiler/gm)) {
      await writeFile(
        gitignorePath,
        gitignore + "/boiler\n"
      )
    }

    await this.addTsConfigRef(destDir)
  }

  async addTsConfigRef(destDir: string): Promise<void> {
    const tsConfigPath = join(destDir, "tsconfig.json")
    const relTsConfigPath = "./boiler/tsconfig.json"

    const tsConfigExists = await pathExists(tsConfigPath)
    const relTsConfigExists = await pathExists(
      relTsConfigPath
    )

    if (!tsConfigExists || !relTsConfigExists) {
      return
    }

    if (!relTsConfigExists) {
      await writeJson(relTsConfigPath, {
        compilerOptions: {
          composite: true,
          outDir: "../dist/boiler",
          target: "es5",
        },
        extends: "../tsconfig.base.json",
      })
    }

    const tsConfig = await readJson(tsConfigPath)

    if (tsConfig.references) {
      const found = tsConfig.references.find(
        ref => ref.path === relTsConfigPath
      )

      if (!found) {
        tsConfig.references.push({
          path: relTsConfigPath,
        })
        await writeJson(tsConfigPath, tsConfig, {
          spaces: 2,
        })
      }
    }
  }
}

export default new SetupBoiler()
