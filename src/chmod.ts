import { spawnTerminal } from "./spawnTerminal"

export class Chmod {
  async makeExecutable(path: string): Promise<void> {
    await spawnTerminal("chmod", { args: ["+x", path] })
  }
}

export default new Chmod()
