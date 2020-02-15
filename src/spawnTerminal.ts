import { spawn } from "node-pty"

export interface SpawnTerminalOutput {
  code: number
  out: string
  signal: number
}

export type SpawnTerminal = (
  command: string,
  options?: {
    args?: string[]
    cwd?: string
    env?: Record<string, string>
  }
) => Promise<SpawnTerminalOutput>

export const spawnTerminal: SpawnTerminal = async function(
  command,
  options = {}
) {
  const cols = process.stdout.columns
  const rows = process.stdout.rows

  const { args = [], cwd, env } = options

  const pty = spawn(command, args, {
    cols,
    cwd,
    env,
    name: "xterm-color",
    rows,
  })

  let out = ""

  pty.on("data", (data): void => {
    out += data
  })

  return new Promise((resolve): void => {
    pty.on("exit", (code, signal): void =>
      resolve({ code, out, signal })
    )
  })
}
