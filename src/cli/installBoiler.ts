import { join } from "path"
import { pathExists, readJson } from "fs-extra"

import boiler, { BoilerRecord } from "../"
import addBoiler from "./addBoiler"

export class InstallBoiler {
  async run(
    rootDirPath: string,
    ...args: string[]
  ): Promise<void> {
    const boilerJson = join(rootDirPath, ".boiler.json")
    let boilers = []

    if (await pathExists(boilerJson)) {
      boilers = await readJson(boilerJson)
    }

    if (args.length) {
      const boilerMatches = await boiler.argsToRecords(
        rootDirPath,
        args
      )

      if (boilerMatches.length) {
        await this.install(rootDirPath, boilerMatches)
      }
    } else {
      await this.install(rootDirPath, boilers)
    }
  }

  async install(
    destDir: string,
    boilers: BoilerRecord[]
  ): Promise<void> {
    for (const { repo, version } of boilers) {
      await addBoiler.repo(destDir, repo, version)
    }

    for (const record of boilers) {
      await boiler.prompt(destDir, record)
    }

    for (const record of boilers) {
      const { repo } = record
      const name = boiler.boilerName(repo)

      await boiler.install(destDir, name)
      await boiler.generate(destDir, name)
    }
  }
}

export default new InstallBoiler()
