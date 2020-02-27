import { join } from "path"
import { pathExists } from "fs-extra"

import boiler from "../"
import fs from "../fs"
import git from "../git"

export class CommitBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    const message = repos.pop()

    if (!repos.length) {
      ;[repos] = await fs.ls(join(destDir, "boiler"))
    }

    await Promise.all(
      repos.map(
        async (repo): Promise<void> => {
          const name = boiler.boilerName(repo)
          const boilerDir = join(destDir, "boiler", name)

          if (await pathExists(join(boilerDir, ".git"))) {
            await git.add(boilerDir)
            await git.commit(boilerDir, message)
            await git.push(boilerDir)
          } else {
            console.error(`⚠️ Can't find ${boilerDir}`)
          }
        }
      )
    )
  }
}

export default new CommitBoiler()
