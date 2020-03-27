import boiler from "./"
import boilerPackages from "./boilerPackages"
import git from "./git"
import ts from "./ts"

export class Cli {
  async run([cmd, ...args]: string[]): Promise<void> {
    const cwdPath = process.cwd()

    if (cmd[0] !== "n") {
      await boilerPackages.load(cwdPath)
    }

    if (cmd[0] === "g") {
      await git.appendGitignore(cwdPath, "/boiler")
    }

    if (cmd[0] === "a") {
      await boiler.absorb(cwdPath, ...args)
    } else if (cmd[0] === "c") {
      await boiler.commit(cwdPath, ...args)
    } else if (cmd[0] === "g") {
      await boiler.generate(cwdPath, ...args)
    } else if (cmd[0] === "i") {
      await boiler.install(cwdPath, ...args)
    } else if (cmd[0] === "n") {
      await boiler.new(cwdPath, ...args)
    } else if (cmd[0] === "p") {
      await boiler.push(cwdPath, ...args)
    } else if (cmd[0] === "s") {
      await boiler.status(cwdPath, ...args)
    } else if (cmd.slice(0, 2) === "un") {
      await boiler.uninstall(cwdPath, ...args)
    } else if (cmd.slice(0, 2) === "up") {
      await boiler.update(cwdPath, ...args)
    } else {
      // eslint-disable-next-line no-console
      console.log(`
boiler new       [path]...       New TypeScript or generator project
boiler generate  [repo|path]...  Run generator
boiler install   [repo|path]...  Install generator
boiler update    [repo|path]...  Update generator
boiler commit    [repo|path]...  Commit and push generator
boiler push      [repo|path]...  Push generator
boiler status    [repo|path]...  Status of generator repo
boiler uninstall [repo|path]...  Uninstall generator repo

Quickstart (new project + new boilerplate):

  boiler new my-project
  cd my project
  boiler new boiler/my-generator
  boiler generate boiler/my-generator
`)
    }

    if (cmd === "generate") {
      await ts.addBoilerTsConfig(cwdPath)
      await ts.addTsConfigRef(cwdPath)
    }
  }
}

export default new Cli()
