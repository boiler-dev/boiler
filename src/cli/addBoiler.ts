import { join } from "path"
import boilerFromArg from "./boilerFromArg"
import { spawnTerminal } from "../spawnTerminal"

export class AddBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    await Promise.all(
      repos.map(
        async (repo): Promise<void> => {
          const name = await boilerFromArg(destDir, repo)
          if (name && repo.match(/\.git$/)) {
            await this.gitClone(
              join(destDir, "boiler"),
              repo
            )
          } else {
            console.error(`Can't understand ${repo} 😔`)
            process.exit(1)
          }
        }
      )
    )
  }

  async gitClone(
    path: string,
    repo: string
  ): Promise<void> {
    await spawnTerminal("git", {
      args: ["clone", repo],
      cwd: path,
    })
  }
}

export default new AddBoiler()
