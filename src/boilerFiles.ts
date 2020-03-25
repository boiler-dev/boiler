import { basename, join, relative } from "path"

import files from "./files"
import { BoilerRecord } from "./boilerRecords"

export interface BoilerFileRecord {
  sourcePath: string
  name?: string
}

export class BoilerFiles {
  records: Record<string, BoilerFileRecord[]> = {}

  async load(
    cwdPath: string,
    record: BoilerRecord
  ): Promise<BoilerFileRecord[]> {
    const { name } = record
    const id = `${cwdPath}:${name}`

    const boilerPath = join(cwdPath, "boiler", name)

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
