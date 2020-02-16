import {
  spawnTerminal,
  SpawnTerminalOutput,
} from "./spawnTerminal"

class Git {
  async add(path: string): Promise<SpawnTerminalOutput> {
    return await spawnTerminal("git", {
      args: ["add", "."],
      cwd: path,
    })
  }

  async clone(
    path: string,
    repo: string
  ): Promise<SpawnTerminalOutput> {
    return await spawnTerminal("git", {
      args: ["clone", repo],
      cwd: path,
    })
  }

  async commit(
    path: string,
    message: string
  ): Promise<SpawnTerminalOutput> {
    return await spawnTerminal("git", {
      args: ["commit", "-a", "-m", message],
      cwd: path,
    })
  }

  async push(path: string): Promise<SpawnTerminalOutput> {
    return await spawnTerminal("git", {
      args: ["push", "origin", "HEAD"],
      cwd: path,
    })
  }

  async status(path: string): Promise<SpawnTerminalOutput> {
    return await spawnTerminal("git", {
      args: ["status"],
      cwd: path,
    })
  }

  async userEmail(): Promise<string> {
    const { out } = await spawnTerminal("git", {
      args: ["config", "user.email"],
    })
    return out.trim()
  }

  async userName(): Promise<string> {
    const { out } = await spawnTerminal("git", {
      args: ["config", "user.name"],
    })
    return out.trim()
  }
}

export default new Git()
