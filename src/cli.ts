import boiler from "./"
import git from "./git"
import ts from "./ts"
import boilerRecords from "./boilerRecords"

export class Cli {
  async run([cmd, ...args]: string[]): Promise<void> {
    const cwdPath = process.cwd()

    await boilerRecords.load(cwdPath)

    if (cmd === "generate") {
      await git.appendGitignore(cwdPath, "/boiler")
    }

    if (cmd === "commit") {
      await boiler.commit(cwdPath, ...args)
    } else if (cmd === "generate") {
      await boiler.generate(cwdPath, ...args)
    } else if (cmd === "init") {
      await boiler.init(cwdPath, ...args)
    } else if (cmd === "install") {
      await boiler.install(cwdPath, ...args)
    } else if (cmd === "status") {
      await boiler.status(cwdPath, ...args)
    } else {
      // eslint-disable-next-line no-console
      console.log(`
boiler commit    [repo|path]...  Commit and push boilerplate
boiler generate  repo|path...    Generate boilerplate
boiler init      [path]...       Initialize new project or boiler
boiler install   [repo|path]...  Install or update boilerplate repos
boiler status    [repo|path]...  Git status of boilerplate
`)
    }

    if (cmd === "generate") {
      await ts.addBoilerTsConfig(cwdPath)
      await ts.addTsConfigRef(cwdPath)
    }
  }
}

export default new Cli()
