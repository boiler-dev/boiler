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
    if (!actions) {
      return
    }

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
        await this.merge(cwdPath, record)
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
    const { uninstall } = action

    if (uninstall) {
      await boiler.uninstall(cwdPath, ...action.source)
    } else {
      await boiler.generate(cwdPath, ...action.source)
    }
  }

  async merge(
    cwdPath: string,
    action: BoilerAction
  ): Promise<void> {
    const { source } = action
    let { path } = action
    let json = {}

    path = join(cwdPath, path)

    if (await pathExists(path)) {
      json = await readJson(path)
    }

    await writeJson(path, deepmerge(json, source), {
      spaces: 2,
    })
  }

  npmInstall(
    cwdPath: string,
    { dev, source, uninstall }: BoilerAction
  ): void {
    const stage = dev ? "dev" : "prod"
    const key = uninstall ? "uninstall" : stage
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

    let { path, source, sourcePath } = action

    if (!source) {
      const tmpSourcePath = join(
        cwdPath,
        "boiler",
        name,
        sourcePath
      )

      if (await pathExists(tmpSourcePath)) {
        sourcePath = tmpSourcePath
      } else {
        sourcePath = join(cwdPath, sourcePath)
      }

      source = (await readFile(sourcePath)).toString()
    }

    path = join(cwdPath, path)

    await ensureFile(path)

    if (modify) {
      source = await modify(source)
    }

    if (typeof source !== "string") {
      source = JSON.stringify(source, null, 2)
    }

    await writeFile(path, source)

    if (bin) {
      await chmod.makeExecutable(path)
    }
  }
}

export default new Actions()
