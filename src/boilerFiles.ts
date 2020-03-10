import { basename, join } from "path"
import { readFile } from "fs-extra"

import files from "./files"

export interface BoilerFileRecord {
  path: string
  name?: string
  source?: string
}

export class BoilerFiles {
  records: Record<string, BoilerFileRecord[]> = {}

  async load(
    cwdPath: string,
    boilerName: string
  ): Promise<BoilerFileRecord[]> {
    const id = `${cwdPath}:${boilerName}`

    if (this.records[id]) {
      return this.records[id]
    }

    const boilerPath = join(cwdPath, "boiler", boilerName)

    this.records[id] = await Promise.all(
      (await files.nestedFiles(boilerPath)).map(
        async path => {
          return {
            name: basename(path),
            path,
            source: (await readFile(path)).toString(),
          }
        }
      )
    )

    return this.records[id]
  }
}

export default new BoilerFiles()
