import { join } from "path"
import { pathExists, readJson, writeJson } from "fs-extra"
import boiler from "../"
import boilerFromArg from "../boilerFromArg"
import addBoiler from "./addBoiler"

export class InstallBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    for (const repo of repos) {
      const setup = await addBoiler.run(destDir, ...repos)

      const name = await boilerFromArg(repo)
      await boiler.run(name, destDir, setup)
    }
  }

  async addTsConfigRef(
    destDir: string,
    name: string
  ): Promise<void> {
    const tsConfigPath = join(destDir, "tsconfig.json")
    const relTsConfigPath = `./boiler/${name}/tsconfig.json`
    const relBoilerTsConfigPath = `./boiler/${name}/tsconfig.boiler.json`

    const tsConfigExists = await pathExists(tsConfigPath)
    const relTsConfigExists = await pathExists(
      relTsConfigPath
    )
    const relBoilerTsConfigExists = await pathExists(
      relBoilerTsConfigPath
    )

    if (!tsConfigExists || !relTsConfigExists) {
      return
    }

    if (!relBoilerTsConfigExists) {
      await writeJson(relBoilerTsConfigPath, {
        compilerOptions: {
          composite: true,
          outDir: "../dist/boiler",
          target: "es5",
        },
        extends: "./tsconfig.json",
      })
    }

    const tsConfig = await readJson(tsConfigPath)

    if (tsConfig.references) {
      const found = tsConfig.references.find(
        ref => ref.path === relBoilerTsConfigPath
      )

      if (!found) {
        tsConfig.references.push({
          path: relBoilerTsConfigPath,
        })
        await writeJson(tsConfigPath, tsConfig, {
          spaces: 2,
        })
      }
    }
  }
}

export default new InstallBoiler()
