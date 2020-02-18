import { join } from "path"
import { pathExists, readJson, writeJson } from "fs-extra"

import boiler, {
  BoilerRecord,
  BoilerInstance,
  BoilerFile,
} from "../"
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
      const boilerNames = repos.map(repo =>
        boilerFromArg(repo)
      )

      const boilerMatches = boilers.filter(boiler =>
        boilerNames.includes(boiler.repo)
      )

      if (boilerMatches.length) {
        await this.install(destDir, boilerMatches)
      } else {
        await this.install(
          destDir,
          repos.map(repo => {
            return { answers: {}, repo }
          }),
          true
        )
      }
    } else {
      await this.install(destDir, boilers)
    }

    await writeJson(boilerJson, boilers, { spaces: 2 })
  }

  async install(
    destDir: string,
    boilers: BoilerRecord[],
    setup?: boolean
  ): Promise<void> {
    const boilerInputs: Record<
      string,
      {
        boiler: BoilerInstance
        boilerName: string
        files: BoilerFile[]
      }
    > = {}

    if (setup) {
      for (const { repo } of boilers) {
        await addBoiler.run(destDir, repo)
      }
    }

    for (const record of boilers) {
      const { repo } = record
      const name = boilerFromArg(repo)

      boilerInputs[repo] = await boiler.setup(
        name,
        destDir,
        setup
      )
    }

    for (const record of boilers) {
      const { repo } = record
      const input = boilerInputs[repo]

      await boiler.prompt(
        input.boiler,
        record,
        input.boilerName,
        destDir,
        input.files,
        setup
      )
    }

    for (const record of boilers) {
      const { repo } = record
      const input = boilerInputs[repo]

      await boiler.install(
        input.boiler,
        record,
        input.boilerName,
        destDir,
        input.files,
        setup
      )
    }

    for (const record of boilers) {
      boiler.cleanup(record)
    }

    if (setup) {
      for (const record of boilers) {
        boilers.push(record)
      }
    }
  }
}

export default new InstallBoiler()
