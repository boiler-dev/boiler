import { pathExists } from "fs-extra"
import { join } from "path"

export interface BoilerPathRecord {
  cwdPath: string

  boilerDirExists: boolean
  boilerJsExists: boolean
  boilerTsExists: boolean

  boilerDirPath: string
  boilerJsPath: string
  boilerTsPath: string

  distJsExists: boolean

  distDirPath: string
  distJsPath: string
}

export class BoilerPaths {
  records: Record<string, BoilerPathRecord> = {}

  async load(
    cwdPath: string,
    boilerName: string
  ): Promise<BoilerPathRecord> {
    const id = `${cwdPath}:${boilerName}`

    if (this.records[id]) {
      return this.records[id]
    }

    const [boilerDirPath, distDirPath] = [
      join(cwdPath, "boiler", boilerName),
      join(cwdPath, "dist/boiler", boilerName),
    ]

    const [boilerJsPath, boilerTsPath, distJsPath] = [
      join(boilerDirPath, "boiler.js"),
      join(boilerDirPath, "boiler.ts"),
      join(distDirPath, "boiler.js"),
    ]

    const [
      boilerDirExists,
      boilerJsExists,
      boilerTsExists,
      distJsExists,
    ] = await Promise.all([
      pathExists(boilerDirPath),
      pathExists(boilerJsPath),
      pathExists(boilerTsPath),
      pathExists(distJsPath),
    ])

    this.records[id] = {
      cwdPath,
      boilerDirExists,
      boilerDirPath,
      boilerJsPath,
      boilerJsExists,
      boilerTsExists,
      boilerTsPath,
      distDirPath,
      distJsPath,
      distJsExists,
    }

    return this.records[id]
  }
}

export default new BoilerPaths()
