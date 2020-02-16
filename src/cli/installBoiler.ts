import boiler from "../"
import boilerFromArg from "../boilerFromArg"
import addBoiler from "./addBoiler"

export class InstallBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    for (const repo of repos) {
      const setup = await addBoiler.run(destDir, ...repos)
      const name = boilerFromArg(repo)

      await boiler.run(name, destDir, setup)
    }
  }
}

export default new InstallBoiler()
