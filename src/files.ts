import { join } from "path"
import { readdir, stat } from "fs-extra"

export class Files {
  async nestedFiles(
    dir: string,
    allFiles = []
  ): Promise<string[]> {
    const [dirs, files] = await this.ls(dir)

    await Promise.all(
      dirs.map(async dirName => {
        await this.nestedFiles(join(dir, dirName), allFiles)
      })
    )

    for (const name of files) {
      allFiles.push(join(dir, name))
    }

    return allFiles
  }

  async ls(path: string): Promise<[string[], string[]]> {
    const names = await readdir(path)

    const dirs = []
    const files = []

    await Promise.all(
      names.map(async name => {
        const isDir = (
          await stat(join(path, name))
        ).isDirectory()

        if (name[0] === ".") {
          // do nothing
        } else if (isDir) {
          dirs.push(name)
        } else {
          files.push(name)
        }
      })
    )

    return [dirs, files]
  }
}

export default new Files()
