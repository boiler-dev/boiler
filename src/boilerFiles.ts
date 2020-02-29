import { basename, join } from "path"
import { readFile } from "fs-extra"

import fs from "./fs"

export interface BoilerFileRecord {
  name: string
  path: string
  source: string
}

export class BoilerFiles {
  records: Record<string, BoilerFileRecord[]>

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
      (await fs.nestedFiles(boilerPath)).map(async path => {
        return {
          name: basename(path),
          path,
          source: (await readFile(path)).toString(),
        }
      })
    )

    return this.records[id]
  }
}

export default new BoilerFiles()
