import { join } from "path"
import boilerFromArg from "../boilerFromArg"
import git from "../git"
import { pathExists } from "fs-extra"

export class AddBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    for (const repo of repos) {
      const name = await boilerFromArg(repo)
      const boilerDir = join(destDir, "boiler")

      if (await pathExists(join(boilerDir, name))) {
        continue
      }

      if (name && repo.match(/\.git$/)) {
        await git.clone(boilerDir, repo)
      } else {
        console.error(`Can't understand ${repo} 😔`)
        process.exit(1)
      }
    }
  }
}

export default new AddBoiler()
