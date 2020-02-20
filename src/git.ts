import { join } from "path"
import { ensureFile, readFile, writeFile } from "fs-extra"

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

  async appendGitignore(
    destDir: string,
    line: string
  ): Promise<void> {
    const gitignorePath = join(destDir, ".gitignore")

    await ensureFile(gitignorePath)
    const gitignore = await readFile(gitignorePath)

    if (
      !gitignore
        .toString()
        .match(new RegExp("^" + line, "gm"))
    ) {
      await writeFile(
        gitignorePath,
        gitignore + line + "\n"
      )
    }
  }

  async checkout(
    path: string,
    sha: string
  ): Promise<SpawnTerminalOutput> {
    return await spawnTerminal("git", {
      args: ["checkout", sha],
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

  async commitHash(path: string): Promise<string> {
    const { out } = await spawnTerminal("git", {
      args: [
        "log",
        "--pretty=format:'%h'",
        "--no-color",
        "-n",
        "1",
      ],
      cwd: path,
    })
    return out.match(/[a-z0-9]{7}/)[0]
  }

  async fetch(path: string): Promise<SpawnTerminalOutput> {
    return await spawnTerminal("git", {
      args: ["fetch"],
      cwd: path,
    })
  }

  async init(path: string): Promise<SpawnTerminalOutput> {
    return await spawnTerminal("git", {
      args: ["init", "."],
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
      args: ["status", "-s"],
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
