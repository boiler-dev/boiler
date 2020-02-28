import { join } from "path"

import boiler, { BoilerRecord } from "../"
import git from "../git"

export class GenerateBoiler {
  async run(
    rootDirPath: string,
    ...args: string[]
  ): Promise<void> {
    const boilers = await boiler.load(rootDirPath)

    if (args.length) {
      const records = await boiler.findRecords(
        rootDirPath,
        ...args
      )
      const newRecords = []

      await Promise.all(
        records.map(async record => {
          const { repo, version } = record

          if (version) {
            const instance = await boiler.loadInstance(
              rootDirPath,
              boiler.boilerName(repo)
            )

            if (instance && instance.regenerate) {
              newRecords.push({ answers: {}, repo })
            }
          }
        })
      )

      if (records.length) {
        await this.generate(
          rootDirPath,
          records.concat(newRecords)
        )
      }
    } else {
      await this.generate(rootDirPath, boilers)
    }

    await boiler.npmInstall(rootDirPath)
    await boiler.writeRecords(rootDirPath)
  }

  async generate(
    rootDirPath: string,
    boilers: BoilerRecord[]
  ): Promise<void> {
    for (const record of boilers) {
      const { repo, version } = record
      const boilerName = boiler.boilerName(repo)

      await boiler.install(rootDirPath, repo, version)

      if (!version) {
        await boiler.updateVersion(rootDirPath, boilerName)
        boiler.records[rootDirPath].push(record)
      }
    }

    for (const record of boilers) {
      await boiler.prompt(rootDirPath, record)
    }

    for (const record of boilers) {
      const { repo } = record
      const boilerName = boiler.boilerName(repo)

      await boiler.generate(rootDirPath, boilerName)
    }
  }
}

export default new GenerateBoiler()
