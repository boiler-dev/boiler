import { join } from "path"
import { pathExists, readJson, writeJson } from "fs-extra"

import boiler, { BoilerRecord } from "../"
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
        const boilerMatches = boilers.filter(
          boiler =>
            boilerFromArg(boiler.repo) ===
            boilerFromArg(repo)
        )

        for (const boiler of boilerMatches) {
          await this.install(destDir, boiler)
        }

        if (!boilerMatches.length) {
          const answers = {}

          await addBoiler.run(destDir, repo)
          await this.install(
            destDir,
            {
              answers,
              repo,
            },
            true
          )

          boilers.push({ answers, repo })
        }
      }
    } else {
      for (const boiler of boilers) {
        await this.install(destDir, boiler)
      }
    }

    await writeJson(boilerJson, boilers)
  }

  async install(
    destDir: string,
    boilerRecord: BoilerRecord,
    setup?: boolean
  ): Promise<void> {
    const { repo } = boilerRecord
    const name = boilerFromArg(repo)

    await boiler.run(boilerRecord, name, destDir, setup)
  }
}

export default new InstallBoiler()
