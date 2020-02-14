import { join } from "path"
import {
  ensureDir,
  ensureFile,
  readFile,
  writeFile,
  pathExists,
  readJson,
  writeJson,
} from "fs-extra"

export class InitBoiler {
  async run(destDir: string): Promise<void> {
    const boilerDir = join(destDir, "boiler")

    await ensureDir(boilerDir)

    await Promise.all([
      this.createTsConfig(destDir),
      this.updateGitignore(destDir),
    ])
  }

  async createTsConfig(destDir: string): Promise<void> {
    const tsConfigPath = join(destDir, "tsconfig.json")
    const relBoilerTsConfigPath =
      "./boiler/tsconfig.cjs.json"
    const boilerTsConfigPath = join(
      destDir,
      relBoilerTsConfigPath
    )

    const tsConfigExists = await pathExists(tsConfigPath)
    const boilerTsConfigExists = await pathExists(
      boilerTsConfigPath
    )

    if (tsConfigExists) {
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

    if (tsConfigExists && !boilerTsConfigExists) {
      await writeFile(
        boilerTsConfigPath,
        JSON.stringify(
          {
            compilerOptions: {
              composite: true,
              module: "commonjs",
              outDir: "../dist/boiler",
              rootDir: ".",
              target: "es5",
            },
            extends: "../tsconfig-base.json",
          },
          null,
          2
        )
      )
    }
  }

  async updateGitignore(destDir: string): Promise<void> {
    const gitignorePath = join(destDir, ".gitignore")

    await ensureFile(gitignorePath)
    const gitignore = await readFile(gitignorePath)

    if (!gitignore.toString().match(/^\/boiler\/\*/gm)) {
      await writeFile(
        gitignorePath,
        gitignore + "/boiler/*\n"
      )
    }
  }
}

export default new InitBoiler()
