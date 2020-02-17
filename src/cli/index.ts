import addBoiler from "./addBoiler"
import commitBoiler from "./commitBoiler"
import initBoiler from "./initBoiler"
import installBoiler from "./installBoiler"
import setupBoiler from "./setupBoiler"
import statusBoiler from "./statusBoiler"

export class Cli {
  async run([cmd, ...args]: string[]): Promise<void> {
    const destDir = process.cwd()
    const setupCommands = ["add", "commit", "install"]

    if (setupCommands.includes(cmd)) {
      await setupBoiler.run(destDir)
    }

    if (cmd === "add") {
      await addBoiler.run(destDir, ...args)
    } else if (cmd === "commit") {
      await commitBoiler.run(destDir, ...args)
    } else if (cmd === "init") {
      await initBoiler.run(destDir, ...args)
    } else if (cmd === "install") {
      await installBoiler.run(destDir, ...args)
    } else if (cmd === "status") {
      await statusBoiler.run(destDir, ...args)
    } else {
      // eslint-disable-next-line no-console
      console.log(`
add\trepo|path...\tAdd boilers without install
commit\t[repo|path]...\tCommit and push boilers
init\t[path]...\tInitialize new projects
install\trepo|path...\tInstall boilers
status\t[repo|path]...\tGit status of boilers
`)
    }
  }
}

export default new Cli()
