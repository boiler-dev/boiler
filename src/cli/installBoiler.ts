import { join } from "path"
import boiler from "../"
import boilerFromArg from "./boilerFromArg"
import addBoiler from "./addBoiler"
import { spawnTerminal } from "../spawnTerminal"

export class InstallBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    await Promise.all(
      repos.map(
        async (repo): Promise<void> => {
          await addBoiler.run(destDir, ...repos)

          const name = await boilerFromArg(destDir, repo)
          await boiler.run(
            join(destDir, "boiler", name),
            destDir
          )
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

export default new InstallBoiler()
