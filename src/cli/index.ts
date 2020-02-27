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
    await git.appendGitignore(destDir, "/boiler")

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
commit\t [repo|path]...\t Commit and push boilerplate
generate\t repo|path...\t Generate boilerplate
init\t [path]...\t Initialize new project or boiler
status\t [repo|path]...\t Git status of boilerplate
update\t [repo|path]...\t Git pull boilerplate repos
`)
    }

    await ts.addBoilerTsConfig(destDir)
    await ts.addTsConfigRef(destDir)
  }
}

export default new Cli()
