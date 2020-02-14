import { join } from "path"
import listBoilers from "./listBoilers"
import { spawnTerminal } from "../spawnTerminal"

export class BoilerStatus {
  async run(destDir: string): Promise<void> {
    const boilers = await listBoilers(destDir)

    for (const boiler of boilers) {
      const boilerDir = join(destDir, boiler)
      const { out } = await this.gitStatus(boilerDir)

      // eslint-disable-next-line no-console
      console.log(`\n⚙️  ${boiler} status:\n\n` + out)
    }
  }

  async gitStatus(
    path: string
  ): Promise<{
    code: number
    out: string
    signal: number
  }> {
    return await spawnTerminal("git", {
      args: ["status"],
      cwd: path,
    })
  }
}

export default new BoilerStatus()
