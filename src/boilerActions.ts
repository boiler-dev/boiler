import { relative } from "path"

import { Boiler } from "."
import actions from "./actions"
import boilerAnswers from "./boilerAnswers"
import boilerInstances from "./boilerInstances"
import { BoilerRecord } from "./boilerRecords"

export interface BoilerAction {
  action: string
  bin?: boolean
  dev?: boolean
  path?: string
  source: any
}

export class BoilerActions {
  records: Record<string, BoilerAction[]> = {}

  async load(
    cwdPath: string,
    boiler: Boiler,
    callback: string,
    ...records: BoilerRecord[]
  ): Promise<void> {
    for (const record of records) {
      const { name } = record
      const id = `${cwdPath}:${name}`

      const instance = await boilerInstances.load(
        cwdPath,
        record
      )

      if (!instance || !instance[callback]) {
        continue
      }

      this.records[id] = await instance[callback]({
        cwdPath,
        allAnswers: boilerAnswers.allAnswers(cwdPath),
        ...record,
      })

      await actions.run(cwdPath, boiler, this.records[id])
    }
  }

  writes(cwdPath: string, name: string): string[] {
    const writes = []

    for (const id in this.records) {
      if (id === `${cwdPath}:${name}`) {
        for (const { action, path, source } of this.records[
          id
        ]) {
          if (action === "write") {
            writes.push({
              path: relative(cwdPath, path),
              source: relative(cwdPath, source),
            })
          }
        }
      }
    }

    if (writes.length) {
      return writes
    }
  }
}

export default new BoilerActions()
