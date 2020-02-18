import { join } from "path"
import boilerFromArg from "../boilerFromArg"
import git from "../git"
import { pathExists, ensureDir } from "fs-extra"

export class AddBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    for (const repo of repos) {
      const name = boilerFromArg(repo)
      const boilerDir = join(destDir, "boiler")

      if (await pathExists(join(boilerDir, name))) {
        continue
      }

      if (name && repo.match(/\.git$/)) {
        await ensureDir(boilerDir)

        const { code, out } = await git.clone(
          boilerDir,
          repo
        )

        if (code !== 0) {
          console.error("⚠️  Git clone failed:\n\n", out)
          process.exit(1)
        }
      } else {
        console.error(`Can't understand ${repo} 😔`)
        process.exit(1)
      }
    }
  }
}

export default new AddBoiler()
