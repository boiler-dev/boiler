import { join } from "path"

import boilerFromArg from "../boilerFromArg"
import fs from "../fs"
import git from "../git"

export class UpdateBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    if (!repos.length) {
      ;[repos] = await fs.ls(join(destDir, "boiler"))
    }

    for (const repo of repos) {
      const name = boilerFromArg(repo)
      const boilerDir = join(destDir, "boiler", name)

      await git.pull(boilerDir)
    }
  }
}

export default new UpdateBoiler()
