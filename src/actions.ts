import { extname } from "path"
import deepmerge from "deepmerge"
import {
  ensureFile,
  pathExists,
  readJson,
  writeFile,
  writeJson,
} from "fs-extra"

import { BoilerAction } from "."
import chmod from "./chmod"

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
