import boiler, { BoilerRecord } from "../"

import addBoiler from "./addBoiler"

export class GenerateBoiler {
  async run(
    rootDirPath: string,
    ...args: string[]
  ): Promise<void> {
    const boilers = await boiler.load(rootDirPath)

    if (args.length) {
      const boilerMatches = await boiler.argsToRecords(
        rootDirPath,
        args,
        true
      )

      if (boilerMatches.length) {
        await this.generate(rootDirPath, boilerMatches)
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
    for (const { repo, version } of boilers) {
      await addBoiler.repo(rootDirPath, repo, version)
    }

    for (const record of boilers) {
      await boiler.prompt(rootDirPath, record)
    }

    for (const record of boilers) {
      const { repo } = record
      const boilerName = boiler.boilerName(repo)

      await boiler.generate(rootDirPath, boilerName)

      await boiler.addRecord(
        rootDirPath,
        boilerName,
        record
      )
    }
  }
}

export default new GenerateBoiler()
