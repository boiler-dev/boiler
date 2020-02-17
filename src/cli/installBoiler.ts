import { join } from "path"
import { pathExists, readJson } from "fs-extra"

import boiler from "../"
import boilerFromArg from "../boilerFromArg"
import addBoiler from "./addBoiler"

export class InstallBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    const boilerJson = join(destDir, ".boiler.json")
    let boilers = []

    if (await pathExists(boilerJson)) {
      boilers = await readJson(boilerJson)
    }

    if (repos.length) {
      for (const repo of repos) {
        await this.install(
          destDir,
          repo,
          boilers.filter(
            boiler =>
              boilerFromArg(boiler.repo) ===
              boilerFromArg(repo)
          )[0]?.answers
        )
      }
    } else {
      for (const boiler of boilers) {
        await this.install(
          destDir,
          boiler.repo,
          boiler.answers
        )
      }
    }
  }

  async install(
    destDir: string,
    repo: string,
    answers: Record<string, any> = {}
  ): Promise<void> {
    const setup = await addBoiler.run(destDir, repo)
    const name = boilerFromArg(repo)
    await boiler.run(name, destDir, answers, repo, setup)
  }
}

export default new InstallBoiler()
