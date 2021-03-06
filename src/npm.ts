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
    if (!pkgNames.length) {
      return
    }

    // eslint-disable-next-line no-console
    console.log(
      `⚙️  Installing ${
        saveDev ? "dev" : "prod"
      } npm modules:\n  ` + pkgNames.sort().join("\n  ")
    )

    const extra = saveDev ? ["--save-dev"] : ["--save-prod"]
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
      console.log("✅ Npm modules installed.")
    } else {
      console.error(
        "🚨 Failed to install npm modules:",
        pkgNames
      )
      console.error(out)
    }

    return response
  }

  async uninstall(
    destDir: string,
    pkgNames: string[]
  ): Promise<SpawnTerminalOutput> {
    if (!pkgNames.length) {
      return
    }

    // eslint-disable-next-line no-console
    console.log(
      "⚙️  Uninstalling npm modules:\n  " +
        pkgNames.sort().join("\n  ")
    )

    const response = await spawnTerminal("npm", {
      args: ["uninstall", ...pkgNames],
      cwd: destDir,
    })

    const { code, out } = response

    if (code === 0) {
      // eslint-disable-next-line no-console
      console.log("✅ Npm modules uninstalled.")
    } else {
      console.error(
        "🚨 Failed to uninstall npm modules:",
        pkgNames
      )
      console.error(out)
    }

    return response
  }
}

export default new Npm()
