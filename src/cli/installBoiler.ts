import { join } from "path"
import deepmerge from "deepmerge"
import { pathExists, readJson, writeJson } from "fs-extra"

import boiler, {
  BoilerRecord,
  BoilerInstance,
  BoilerFile,
} from "../"
import boilerFromArg from "../boilerFromArg"
import git from "../git"
import npm from "../npm"

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
        const fakeBoilers = repos.map(repo => {
          return { answers: {}, repo }
        })

        await this.install(destDir, fakeBoilers, true)

        await Promise.all(
          fakeBoilers.map(async (boiler, i) => {
            if (boiler.repo.match(/\.git$/)) {
              const version = await git.commitHash(
                join(destDir, "boiler", name)
              )
              boilers.push({ ...boiler, version })
            }
          })
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

    for (const { repo, version } of boilers) {
      await addBoiler.repo(destDir, repo, version)
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

    let npmModules = { dev: [], prod: [] }

    for (const record of boilers) {
      const { repo } = record
      const input = boilerInputs[repo]

      const newNpmModules = await boiler.install(
        input.boiler,
        record,
        input.boilerName,
        destDir,
        input.files,
        setup
      )

      npmModules = deepmerge(npmModules, newNpmModules)
    }

    await npm.install(destDir, npmModules.dev, {
      saveDev: true,
    })

    await npm.install(destDir, npmModules.prod)

    for (const record of boilers) {
      boiler.cleanup(record)
    }
  }
}

export default new InstallBoiler()
