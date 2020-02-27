import commitBoiler from "./commitBoiler"
import generateBoiler from "./generateBoiler"
import initBoiler from "./initBoiler"
import statusBoiler from "./statusBoiler"
import updateBoiler from "./updateBoiler"

import git from "../git"
import ts from "../ts"

export class Cli {
  async run([cmd, ...args]: string[]): Promise<void> {
    const destDir = process.cwd()

    if (cmd === "generate") {
      await git.appendGitignore(destDir, "/boiler")
    }

    if (cmd === "commit") {
      await commitBoiler.run(destDir, ...args)
    } else if (cmd === "generate") {
      await generateBoiler.run(destDir, ...args)
    } else if (cmd === "init") {
      await initBoiler.run(destDir, ...args)
    } else if (cmd === "status") {
      await statusBoiler.run(destDir, ...args)
    } else if (cmd === "update") {
      await updateBoiler.run(destDir, ...args)
    } else {
      // eslint-disable-next-line no-console
      console.log(`
boiler commit    [repo|path]...  Commit and push boilerplate
boiler generate  repo|path...    Generate boilerplate
boiler init      [path]...       Initialize new project or boiler
boiler status    [repo|path]...  Git status of boilerplate
boiler update    [repo|path]...  Git pull boilerplate repos
`)
    }

    if (cmd === "generate") {
      await ts.addBoilerTsConfig(destDir)
      await ts.addTsConfigRef(destDir)
    }
  }
}

export default new Cli()
