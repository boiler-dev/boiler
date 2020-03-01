import boiler from "./"
import git from "./git"
import ts from "./ts"
import boilerRecords from "./boilerRecords"

export class Cli {
  async run([cmd, ...args]: string[]): Promise<void> {
    const cwdPath = process.cwd()

    await boilerRecords.load(cwdPath)

    if (cmd) {
      cmd = cmd[0]
    }

    if (cmd === "g") {
      await git.appendGitignore(cwdPath, "/boiler")
    }

    if (cmd === "c") {
      await boiler.commit(cwdPath, ...args)
    } else if (cmd === "g") {
      await boiler.generate(cwdPath, ...args)
    } else if (cmd === "n") {
      await boiler.new(cwdPath, ...args)
    } else if (cmd === "i") {
      await boiler.install(cwdPath, ...args)
    } else if (cmd === "s") {
      await boiler.status(cwdPath, ...args)
    } else {
      // eslint-disable-next-line no-console
      console.log(`
boiler new       [path]...       New TypeScript or boilerplate project
boiler install   [repo|path]...  Install or update boilerplate
boiler generate  [repo|path]...  Generate from boilerplate
boiler commit    [repo|path]...  Commit and push boilerplate
boiler status    [repo|path]...  Status of boilerplate

Quickstart (new project, new boilerplate):

  boiler new my-project
  cd my project
  boiler new boiler/my-boiler
  boiler generate boiler/my-boiler
`)
    }

    if (cmd === "generate") {
      await ts.addBoilerTsConfig(cwdPath)
      await ts.addTsConfigRef(cwdPath)
    }
  }
}

export default new Cli()
