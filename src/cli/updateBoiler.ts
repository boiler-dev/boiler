import { join } from "path"

import boiler from "../"
import fs from "../fs"
import git from "../git"

export class UpdateBoiler {
  async run(
    rootDirPath: string,
    ...repos: string[]
  ): Promise<void> {
    if (!repos.length) {
      ;[repos] = await fs.ls(join(rootDirPath, "boiler"))
    }

    for (const repo of repos) {
      const boilerName = boiler.boilerName(repo)
      const boilerDir = join(
        rootDirPath,
        "boiler",
        boilerName
      )

      await git.pull(boilerDir)
      await boiler.updateVersion(rootDirPath, boilerName)
    }
  }
}

export default new UpdateBoiler()
