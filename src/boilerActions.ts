import { join } from "path"

import { Boiler } from "."
import actions from "./actions"
import boilerAnswers from "./boilerAnswers"
import boilerInstances, {
  ActionBoiler,
  BoilerInput,
} from "./boilerInstances"
import { BoilerRecord } from "./boilerRecords"
import { BoilerFileRecord } from "./boilerFiles"

export interface BoilerAction {
  action: string

  bin?: boolean
  dev?: boolean
  modify?: Function
  path?: string
  source?: any
  sourcePath?: string
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
      const { name } = record
      const id = `${cwdPath}:${name}`

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
    name: string
  ): BoilerActionWrite[] {
    const writes: BoilerActionWrite[] = []

    for (const id in this.records) {
      if (id === `${cwdPath}:${name}`) {
        for (const { action, path, sourcePath } of this
          .records[id]) {
          if (action === "write" && sourcePath) {
            writes.push({
              path,
              sourcePath: join("boiler", name, sourcePath),
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
