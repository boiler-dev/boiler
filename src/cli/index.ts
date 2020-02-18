import addBoiler from "./addBoiler"
import commitBoiler from "./commitBoiler"
import initBoiler from "./initBoiler"
import installBoiler from "./installBoiler"
import statusBoiler from "./statusBoiler"

import git from "../git"
import ts from "../ts"

export class Cli {
  async run([cmd, ...args]: string[]): Promise<void> {
    const destDir = process.cwd()
    const setup = ["add", "commit", "install"].includes(cmd)

    if (setup) {
      await git.appendGitignore(destDir, "/boiler")
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

    if (setup) {
      await ts.addBoilerTsConfig(destDir)
      await ts.addTsConfigRef(destDir)
    }
  }
}

export default new Cli()
