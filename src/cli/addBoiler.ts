import { join } from "path"
import boilerFromArg from "../boilerFromArg"
import git from "../git"

export class AddBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    for (const repo in repos) {
      const name = await boilerFromArg(destDir, repo)
      const boilerDir = join(destDir, "boiler")

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
