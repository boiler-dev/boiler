import { join } from "path"
import {
  ensureFile,
  pathExists,
  readFile,
  readJson,
  writeFile,
  writeJson,
} from "fs-extra"
import { transpileModule } from "typescript"

export interface TsPaths {
  tsConfigPath: string
  relTsConfigPath: string

  tsConfigExists: boolean
  relTsConfigExists: boolean
}

export class Ts {
  async addBoilerTsConfig(destDir: string): Promise<void> {
    const {
      relTsConfigPath,
      tsConfigExists,
      relTsConfigExists,
    } = await this.paths(destDir)

    if (!tsConfigExists) {
      return
    }

    if (!relTsConfigExists) {
      await ensureFile(relTsConfigPath)
      await writeJson(
        relTsConfigPath,
        {
          compilerOptions: {
            composite: true,
            outDir: "../dist/boiler",
            target: "es5",
          },
          extends: "../tsconfig.base.json",
        },
        { spaces: 2 }
      )
    }
  }

  async addTsConfigRef(destDir: string): Promise<void> {
    const {
      tsConfigPath,
      relTsConfigPath,
      tsConfigExists,
    } = await this.paths(destDir)

    if (!tsConfigExists) {
      return
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

  async paths(destDir: string): Promise<TsPaths> {
    const tsConfigPath = join(destDir, "tsconfig.json")
    const relTsConfigPath = join(
      destDir,
      "boiler/tsconfig.json"
    )

    const tsConfigExists = await pathExists(tsConfigPath)
    const relTsConfigExists = await pathExists(
      relTsConfigPath
    )

    return {
      tsConfigPath,
      tsConfigExists,
      relTsConfigPath,
      relTsConfigExists,
    }
  }

  async transpile(
    boilerTs: string,
    boilerDistJs: string
  ): Promise<void> {
    const ts = await readFile(boilerTs)
    const code = transpileModule(ts.toString(), {})

    await ensureFile(boilerDistJs)
    await writeFile(boilerDistJs, code.outputText)
  }
}

export default new Ts()
