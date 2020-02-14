import { join } from "path"
import { pathExists } from "fs-extra"
import initBoiler from "./initBoiler"
import listBoilers from "../listBoilers"
import git from "../git"

export class CommitBoiler {
  async run(
    destDir: string,
    ...boilers: string[]
  ): Promise<void> {
    const message = boilers.pop()
    await initBoiler.run(destDir)

    if (!boilers.length) {
      boilers = await listBoilers(destDir)
    }

    await Promise.all(
      boilers.map(
        async (boiler): Promise<void> => {
          const boilerDir = join(destDir, boiler)
          if (await pathExists(join(boilerDir, ".git"))) {
            await git.add(boilerDir)
            await git.commit(boilerDir, message)
            await git.push(boilerDir)
          } else {
            console.error(`Couldn't find ${boilerDir}`)
          }
        }
      )
    )
  }
}

export default new CommitBoiler()
