import { join } from "path"
import { pathExists, readJson, writeJson } from "fs-extra"

import boilerFiles, {
  BoilerFileRecord,
} from "./boilerFiles"

import boilerPaths, {
  BoilerPathRecord,
} from "./boilerPaths"

import boilerInstances, {
  BoilerInstance,
} from "./boilerInstances"
import git from "./git"

export interface BoilerRecord {
  repo: string

  answers?: Record<string, any>
  files?: BoilerFileRecord[]
  instance?: BoilerInstance
  name?: string
  paths?: BoilerPathRecord
  version?: string
}

export class BoilerRecords {
  records: Record<string, BoilerRecord[]> = {}

  async load(cwdPath: string): Promise<BoilerRecord[]> {
    const jsonPath = join(cwdPath, ".boiler.json")

    if (await pathExists(jsonPath)) {
      const records = await readJson(jsonPath)

      this.fillBasic(...records)
      this.append(cwdPath, ...records)
    }

    return this.records[cwdPath]
  }

  append(
    cwdPath: string,
    ...records: BoilerRecord[]
  ): void {
    this.records[cwdPath] = this.records[cwdPath] || []
    this.records[cwdPath] = this.records[cwdPath].concat(
      records
    )
  }

  async fill(
    cwdPath: string,
    ...records: BoilerRecord[]
  ): Promise<BoilerRecord[]> {
    this.fillBasic(...records)

    return await Promise.all(
      records.map(async record => {
        const { files, instance, paths, version } = record

        if (!paths) {
          record.paths = await boilerPaths.load(
            cwdPath,
            record.name
          )
        }

        if (!record.paths.boilerDirExists) {
          return
        }

        if (!files) {
          record.files = await boilerFiles.load(
            cwdPath,
            record.name
          )
        }

        if (!version) {
          record.version = await git.commitHash(
            join(cwdPath, "boiler", record.name)
          )
        }

        if (!instance) {
          record.instance = await boilerInstances.load(
            cwdPath,
            record
          )
        }

        return record
      })
    )
  }

  fillBasic(...records: BoilerRecord[]): BoilerRecord[] {
    return records.map(record => {
      const { answers, name, repo } = record

      if (!answers) {
        record.answers = {}
      }

      if (!name) {
        record.name = this.extractName(repo)
      }

      return record
    })
  }

  async find(
    cwdPath: string,
    ...args: string[]
  ): Promise<[BoilerRecord[], BoilerRecord[]]> {
    let records = []

    for (const arg of args) {
      const name = this.extractName(arg)

      records = records.concat(
        this.records[cwdPath].filter(
          record => record.name === name
        )
      )
    }

    const newRecords = this.records[cwdPath].filter(
      record => !records[cwdPath].includes(record)
    )

    return [
      await this.fill(cwdPath, ...records),
      await this.fill(cwdPath, ...newRecords),
    ]
  }

  async findUnique(
    cwdPath: string,
    ...args: string[]
  ): Promise<[BoilerRecord[], BoilerRecord[]]> {
    const [records, newRecords] = await this.find(
      cwdPath,
      ...args
    )
    return [
      this.uniqueRecords(records),
      this.uniqueRecords(newRecords),
    ]
  }

  reset(cwdPath, ...records: BoilerRecord[]): void {
    for (const record of records) {
      const { name } = record
      const id = `${cwdPath}:${name}`

      delete boilerInstances.records[id]
      delete record.instance

      delete boilerFiles.records[id]
      delete record.files

      delete boilerPaths.records[id]
      delete record.paths

      delete record.version
    }
  }

  async save(cwdPath: string): Promise<void> {
    const jsonPath = join(cwdPath, ".boiler.json")

    await writeJson(jsonPath, this.records[cwdPath], {
      spaces: 2,
    })
  }

  extractName(nameOrPathOrRepo: string): string {
    const nameMatch = nameOrPathOrRepo.match(
      /([^\/.]+)\.*[git/]*$/
    )

    if (!nameMatch) {
      console.error(
        "Argument `${repo}` should be a name, path, or repository."
      )
      process.exit(1)
    }

    return nameMatch[1]
  }

  uniqueRecords(records: BoilerRecord[]): BoilerRecord[] {
    const found = {}

    return records.filter(({ name }) => {
      if (!found[name]) {
        return (found[name] = true)
      }
    })
  }
}

export default new BoilerRecords()
