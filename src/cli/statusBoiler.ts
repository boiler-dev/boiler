import { join } from "path"

import boiler from "../"
import fs from "../fs"
import git from "../git"

export class StatusBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    let dirty = false

    if (!repos.length) {
      ;[repos] = await fs.ls(join(destDir, "boiler"))
    }

    for (const repo of repos) {
      const name = boiler.boilerName(repo)
      const boilerDir = join(destDir, "boiler", name)
      const { out } = await git.status(boilerDir)

      dirty = dirty || !!out

      // eslint-disable-next-line no-console
      console.log(
        (out ? "🚨 dirty\t" : "✨ clean\t") +
          ` ${name}` +
          (out ? `\n${out}` : "")
      )
    }

    if (dirty) {
      process.exit(1)
    }
  }
}

export default new StatusBoiler()
