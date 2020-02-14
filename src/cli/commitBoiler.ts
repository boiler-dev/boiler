import { join } from "path"
import { pathExists } from "fs-extra"
import initBoiler from "./initBoiler"
import listBoilers from "./listBoilers"
import { spawnTerminal } from "../spawnTerminal"

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
            await this.gitAdd(boilerDir)
            await this.gitCommit(boilerDir, message)
            await this.gitPush(boilerDir)
          } else {
            console.error(`Couldn't find ${boilerDir}`)
          }
        }
      )
    )
  }

  async gitAdd(path: string): Promise<void> {
    await spawnTerminal("git", {
      args: ["add", "."],
      cwd: path,
    })
  }

  async gitCommit(
    path: string,
    message: string
  ): Promise<void> {
    await spawnTerminal("git", {
      args: ["commit", "-a", "-m", message],
      cwd: path,
    })
  }

  async gitPush(path: string): Promise<void> {
    await spawnTerminal("git", {
      args: ["push", "origin", "HEAD"],
      cwd: path,
    })
  }

  async gitStatus(path: string): Promise<void> {
    await spawnTerminal("git", {
      args: ["status"],
      cwd: path,
    })
  }
}

export default new CommitBoiler()
