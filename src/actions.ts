import { extname } from "path"
import deepmerge from "deepmerge"
import {
  ensureFile,
  pathExists,
  readJson,
  writeFile,
  writeJson,
} from "fs-extra"

import { BoilerAction } from "./boilerInstances"
import chmod from "./chmod"
import boilerPackages from "./boilerPackages"

export class Actions {
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

  async write(action: BoilerAction): Promise<void> {
    const { bin, path } = action
    let { source } = action

    await ensureFile(path)

    if (
      extname(path) === ".json" &&
      typeof source !== "string"
    ) {
      source = JSON.stringify(source, null, 2)
    }

    await writeFile(path, source)

    if (bin) {
      await chmod.makeExecutable(path)
    }
  }
}

export default new Actions()
