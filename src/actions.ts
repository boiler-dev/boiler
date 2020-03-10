import { join } from "path"
import deepmerge from "deepmerge"
import {
  ensureFile,
  pathExists,
  readFile,
  readJson,
  writeFile,
  writeJson,
} from "fs-extra"

import { Boiler } from "."
import { BoilerAction } from "./boilerActions"
import boilerPackages from "./boilerPackages"
import { BoilerRecord } from "./boilerRecords"
import chmod from "./chmod"

export class Actions {
  async run(
    cwdPath: string,
    boiler: Boiler,
    boilerRecord: BoilerRecord,
    actions: BoilerAction[]
  ): Promise<void> {
    for (const record of actions) {
      if (!record) {
        continue
      }

      const { action } = record

      if (action === "generate") {
        await this.generate(cwdPath, boiler, record)
      }

      if (action === "write") {
        await this.write(cwdPath, boilerRecord, record)
      }

      if (action === "merge") {
        await this.merge(record)
      }

      if (action === "npmInstall") {
        this.npmInstall(cwdPath, record)
      }
    }
  }

  async generate(
    cwdPath: string,
    boiler: Boiler,
    action: BoilerAction
  ): Promise<void> {
    await boiler.generate(cwdPath, ...action.source)
  }

  async merge(action: BoilerAction): Promise<void> {
    const { path, source } = action
    let json = {}

    if (await pathExists(path)) {
      json = await readJson(path)
    }

    await writeJson(path, deepmerge(json, source), {
      spaces: 2,
    })
  }

  npmInstall(
    cwdPath: string,
    { dev, source }: BoilerAction
  ): void {
    const key = dev ? "dev" : "prod"
    const packages = boilerPackages.load(cwdPath)

    packages[key] = packages[key].concat(source)
  }

  async write(
    cwdPath: string,
    boilerRecord: BoilerRecord,
    action: BoilerAction
  ): Promise<void> {
    const { name } = boilerRecord
    const { bin, modify } = action
    let { path, source } = action

    source = join(cwdPath, "boiler", name, source)
    path = join(cwdPath, path)

    let src = (await readFile(source)).toString()
    await ensureFile(path)

    if (modify) {
      src = await modify(src)
    }

    if (typeof src !== "string") {
      src = JSON.stringify(src, null, 2)
    }

    await writeFile(path, src)

    if (bin) {
      await chmod.makeExecutable(path)
    }
  }
}

export default new Actions()
