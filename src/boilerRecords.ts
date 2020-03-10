import { join } from "path"
import { pathExists, readJson, writeJson } from "fs-extra"

import boilerAnswers from "./boilerAnswers"

import boilerFiles, {
  BoilerFileRecord,
} from "./boilerFiles"

import boilerPaths, {
  BoilerPathRecord,
} from "./boilerPaths"

import boilerInstances from "./boilerInstances"

import git from "./git"
import boilerActions from "./boilerActions"

export interface BoilerRecord {
  repo: string

  answers?: Record<string, any>
  files?: BoilerFileRecord[]
  name?: string
  paths?: BoilerPathRecord
  writes?: BoilerFileRecord[]
  version?: string
}

export interface BoilerRecordResult {
  allRecords: BoilerRecord[]
  newRecords: BoilerRecord[]
  records: BoilerRecord[]
}

export class BoilerRecords {
  records: Record<string, BoilerRecord[]> = {}

  async load(cwdPath: string): Promise<BoilerRecord[]> {
    const jsonPath = join(cwdPath, ".boiler.json")

    if (await pathExists(jsonPath)) {
      const records = await readJson(jsonPath)

      this.fillBasic(cwdPath, ...records)
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
    this.fillBasic(cwdPath, ...records)

    return await Promise.all(
      records.map(async record => {
        const { files, paths, version } = record

        if (!paths) {
          record.paths = await boilerPaths.load(
            cwdPath,
            record.name
          )
        }

        if (!record.paths.boilerDirExists) {
          return record
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

        return record
      })
    )
  }

  fillBasic(
    cwdPath: string,
    ...records: BoilerRecord[]
  ): BoilerRecord[] {
    return records.map(record => {
      const { answers, name, repo } = record

      if (!name) {
        record.name = this.extractName(repo)
      }

      record.answers = boilerAnswers.load(
        cwdPath,
        record.name,
        answers
      )

      return record
    })
  }

  async find(
    cwdPath: string,
    ...args: string[]
  ): Promise<BoilerRecordResult> {
    let records = []
    let newRecords = []

    this.records[cwdPath] = this.records[cwdPath] || []

    if (!args.length) {
      records = this.records[cwdPath]
    }

    for (const arg of args) {
      const name = this.extractName(arg)

      records = records.concat(
        this.records[cwdPath].filter(
          record => record.name === name
        )
      )
    }

    const names = records.map(({ name }) => name)

    for (const arg of args) {
      const name = this.extractName(arg)

      if (names.includes(name)) {
        continue
      }

      let repo: string

      if (arg.match(/\.git$/)) {
        repo = arg
      }

      newRecords = newRecords.concat({ name, repo })
    }

    const allRecords = records.concat(newRecords)
    await this.fill(cwdPath, ...allRecords)

    return { allRecords, newRecords, records }
  }

  async findUnique(
    cwdPath: string,
    ...args: string[]
  ): Promise<BoilerRecordResult> {
    const { records, newRecords } = await this.find(
      cwdPath,
      ...args
    )
    return {
      records: this.uniqueRecords(records),
      newRecords: this.uniqueRecords(newRecords),
      allRecords: this.uniqueRecords(
        records.concat(newRecords)
      ),
    }
  }

  remove(
    cwdPath: string,
    ...records: BoilerRecord[]
  ): void {
    this.records[cwdPath] = this.records[cwdPath].filter(
      record => !records.includes(record)
    )
  }

  reset(cwdPath: string, ...records: BoilerRecord[]): void {
    for (const record of records) {
      const { name } = record
      const id = `${cwdPath}:${name}`

      delete boilerInstances.records[id]

      delete boilerFiles.records[id]
      delete record.files

      delete boilerPaths.records[id]
      delete record.paths

      delete record.version
    }
  }

  async save(cwdPath: string): Promise<void> {
    const jsonPath = join(cwdPath, ".boiler.json")

    const records = this.records[cwdPath].map(
      ({ answers, name, repo, version, writes }) => ({
        answers,
        repo,
        writes:
          boilerActions.writes(cwdPath, name) || writes,
        version,
      })
    )

    await writeJson(jsonPath, records, {
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
