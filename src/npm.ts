import {
  spawnTerminal,
  SpawnTerminalOutput,
} from "./spawnTerminal"

export class Npm {
  async install(
    destDir: string,
    pkgNames: string[]
  ): Promise<SpawnTerminalOutput> {
    return await spawnTerminal("npm", {
      args: ["install", "--save-exact", ...pkgNames],
      cwd: destDir,
    })
  }
}

export default new Npm()
