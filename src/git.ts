import { spawnTerminal } from "./spawnTerminal"

class Git {
  async add(path: string): Promise<void> {
    await spawnTerminal("git", {
      args: ["add", "."],
      cwd: path,
    })
  }

  async clone(path: string, repo: string): Promise<void> {
    await spawnTerminal("git", {
      args: ["clone", repo],
      cwd: path,
    })
  }

  async commit(
    path: string,
    message: string
  ): Promise<void> {
    await spawnTerminal("git", {
      args: ["commit", "-a", "-m", message],
      cwd: path,
    })
  }

  async push(path: string): Promise<void> {
    await spawnTerminal("git", {
      args: ["push", "origin", "HEAD"],
      cwd: path,
    })
  }

  async status(
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

export default new Git()
