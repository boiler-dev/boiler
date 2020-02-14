import addBoiler from "./addBoiler"
import boilerStatus from "./boilerStatus"
import commitBoiler from "./commitBoiler"
import initBoiler from "./initBoiler"
import installBoiler from "./installBoiler"

export class Cli {
  async run([cmd, ...args]: string[]): Promise<void> {
    const destDir = process.cwd()

    if (["add", "init", "install"].includes(cmd)) {
      await initBoiler.run(destDir)
    }

    if (cmd === "add") {
      await addBoiler.run(destDir, ...args)
    } else if (cmd === "commit") {
      await commitBoiler.run(destDir, ...args)
    } else if (cmd === "install") {
      await installBoiler.run(destDir, ...args)
    } else if (cmd === "status") {
      await boilerStatus.run(destDir)
    }
  }
}

export default new Cli()
