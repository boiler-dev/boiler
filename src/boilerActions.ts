import { join } from "path"

import { Boiler } from "."
import actions from "./actions"
import boilerAnswers from "./boilerAnswers"
import { BoilerFileRecord } from "./boilerFiles"
import boilerInstances, {
  ActionBoiler,
  BoilerInput,
} from "./boilerInstances"
import { BoilerRecord } from "./boilerRecords"

export interface BoilerAction {
  action: string

  bin?: boolean
  dev?: boolean
  modify?: Function
  path?: string
  source?: any
  sourcePath?: string
  uninstall?: boolean
}

export interface BoilerActionWrite
  extends BoilerFileRecord {
  path: string
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
      const id = `${cwdPath}:${record.id}`

      const instance = await boilerInstances.load(
        cwdPath,
        record
      )

      let callbackFn: ActionBoiler

      if (!instance || !instance[callback]) {
        if (callback === "absorb") {
          callbackFn = this.defaultAbsorbCallback
        } else {
          continue
        }
      } else {
        callbackFn = instance[callback]
      }

      this.records[id] = await callbackFn({
        cwdPath,
        allAnswers: boilerAnswers.allAnswers(cwdPath),
        writes: [],
        ...record,
      })

      await actions.run(
        cwdPath,
        boiler,
        record,
        this.records[id]
      )
    }
  }

  async defaultAbsorbCallback({
    writes,
  }: BoilerInput): Promise<BoilerAction[]> {
    return writes.map(({ path, sourcePath }) => ({
      action: "write",
      sourcePath: path,
      path: sourcePath,
    }))
  }

  writes(
    cwdPath: string,
    record: BoilerRecord
  ): BoilerActionWrite[] {
    const writes: BoilerActionWrite[] = []

    for (const id in this.records) {
      if (id === `${cwdPath}:${record.id}`) {
        for (const { action, path, sourcePath } of this
          .records[id]) {
          if (action === "write" && sourcePath) {
            writes.push({
              path,
              sourcePath: join(
                "boiler",
                record.name,
                sourcePath
              ),
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
