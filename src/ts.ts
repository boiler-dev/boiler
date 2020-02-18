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
  boilerTsConfigExists: boolean
  boilerTsConfigPath: string
  boilerTsConfigRelPath: string
  tsConfigExists: boolean
  tsConfigPath: string
}

export class Ts {
  async addBoilerTsConfig(destDir: string): Promise<void> {
    const {
      boilerTsConfigPath,
      boilerTsConfigExists,
      tsConfigExists,
    } = await this.paths(destDir)

    if (!tsConfigExists) {
      return
    }

    if (!boilerTsConfigExists) {
      await ensureFile(boilerTsConfigPath)
      await writeJson(
        boilerTsConfigPath,
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
      boilerTsConfigRelPath,
      tsConfigExists,
      tsConfigPath,
    } = await this.paths(destDir)

    if (!tsConfigExists) {
      return
    }

    const tsConfig = await readJson(tsConfigPath)

    if (tsConfig.references) {
      const found = tsConfig.references.find(
        ref => ref.path === boilerTsConfigRelPath
      )

      if (!found) {
        tsConfig.references.push({
          path: boilerTsConfigRelPath,
        })
        await writeJson(tsConfigPath, tsConfig, {
          spaces: 2,
        })
      }
    }
  }

  async paths(destDir: string): Promise<TsPaths> {
    const tsConfigPath = join(destDir, "tsconfig.json")
    const boilerTsConfigRelPath = "./boiler/tsconfig.json"
    const boilerTsConfigPath = join(
      destDir,
      boilerTsConfigRelPath
    )

    const tsConfigExists = await pathExists(tsConfigPath)
    const boilerTsConfigExists = await pathExists(
      boilerTsConfigPath
    )

    return {
      tsConfigExists,
      tsConfigPath,
      boilerTsConfigExists,
      boilerTsConfigPath,
      boilerTsConfigRelPath,
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
