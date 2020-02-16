import { join } from "path"
import { ensureFile, readFile, writeFile } from "fs-extra"

export class InitBoiler {
  async run(destDir: string): Promise<void> {
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
