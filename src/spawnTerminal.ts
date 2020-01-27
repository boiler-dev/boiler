import { spawn } from "node-pty"

export interface SpawnTerminalArg {
  args?: string[]
  command: string
  cwd?: string
  env?: Record<string, string>
}

export interface SpawnTerminalReturn {
  code: number
  out: string
  signal: number
}

export default async function(
  arg: SpawnTerminalArg
): Promise<SpawnTerminalReturn> {
  const cols = process.stdout.columns
  const rows = process.stdout.rows

  const { args = [] } = arg
  arg.args = Array.isArray(args) ? args : [args]

  const { command, cwd, env } = arg

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
