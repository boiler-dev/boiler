import {
  spawnTerminal,
  SpawnTerminalOutput,
} from "./spawnTerminal"

export class Npm {
  async install(
    destDir: string,
    pkgNames: string[],
    { saveDev }: { saveDev?: boolean } = {}
  ): Promise<SpawnTerminalOutput> {
    const extra = saveDev ? ["--save-dev"] : []
    const response = await spawnTerminal("npm", {
      args: [
        "install",
        "--save-exact",
        ...extra,
        ...pkgNames,
      ],
      cwd: destDir,
    })

    const { code, out } = response

    if (code === 0) {
      // eslint-disable-next-line no-console
      console.log("✅ Installed npm modules:", pkgNames)
    } else {
      console.error(
        "🚨 Failed to install npm modules:",
        pkgNames
      )
      console.error(out)
    }

    return response
  }
}

export default new Npm()
