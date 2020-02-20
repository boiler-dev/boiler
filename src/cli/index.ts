import addBoiler from "./addBoiler"
import commitBoiler from "./commitBoiler"
import initBoiler from "./initBoiler"
import installBoiler from "./installBoiler"
import statusBoiler from "./statusBoiler"
import updateBoiler from "./updateBoiler"

import git from "../git"
import ts from "../ts"

export class Cli {
  async run([cmd, ...args]: string[]): Promise<void> {
    const destDir = process.cwd()
    await git.appendGitignore(destDir, "/boiler")

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
    } else if (cmd === "update") {
      await updateBoiler.run(destDir, ...args)
    } else {
      // eslint-disable-next-line no-console
      console.log(`
add\t repo|path...\t Add boilerplate without install
commit\t [repo|path]...\t Commit and push boilerplate
init\t [path]...\t Initialize new projects
install\t repo|path...\t Add and install boilerplate
status\t [repo|path]...\t Git status of boilerplate
update\t [repo|path]...\t Git pull boilerplate repos
`)
    }

    await ts.addBoilerTsConfig(destDir)
    await ts.addTsConfigRef(destDir)
  }
}

export default new Cli()
