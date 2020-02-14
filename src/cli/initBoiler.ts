import { join } from "path"
import {
  ensureDir,
  ensureFile,
  readFile,
  writeFile,
} from "fs-extra"

export class InitBoiler {
  async run(destDir: string): Promise<void> {
    const boilerDir = join(destDir, "boiler")

    await Promise.all([
      ensureDir(boilerDir),
      this.updateGitignore(destDir),
    ])
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
