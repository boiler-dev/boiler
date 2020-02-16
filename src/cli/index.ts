import addBoiler from "./addBoiler"
import boilerStatus from "./boilerStatus"
import commitBoiler from "./commitBoiler"
import initBoiler from "./initBoiler"
import installBoiler from "./installBoiler"
import setupBoiler from "./setupBoiler"

export class Cli {
  async run([cmd, ...args]: string[]): Promise<void> {
    const destDir = process.cwd()
    const setupCommands = [
      "add",
      "commit",
      "install",
      "setup",
    ]

    if (setupCommands.includes(cmd)) {
      await setupBoiler.run(destDir)
    }

    if (cmd === "add") {
      await addBoiler.run(destDir, ...args)
    } else if (cmd === "commit") {
      await commitBoiler.run(destDir, ...args)
    } else if (cmd === "init") {
      await initBoiler.run(destDir)
    } else if (cmd === "install") {
      await installBoiler.run(destDir, ...args)
    } else if (cmd === "status") {
      await boilerStatus.run(destDir)
    }
  }
}

export default new Cli()
