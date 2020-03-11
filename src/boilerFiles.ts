import { basename, join, relative } from "path"

import files from "./files"

export interface BoilerFileRecord {
  sourcePath: string
  name?: string
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
            sourcePath: relative(boilerPath, path),
          }
        }
      )
    )

    return this.records[id].filter(
      ({ sourcePath }) =>
        sourcePath !== "boiler.ts" &&
        sourcePath !== "boiler.js"
    )
  }
}

export default new BoilerFiles()
