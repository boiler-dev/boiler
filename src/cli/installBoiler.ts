import { join } from "path"
import boiler from "../"
import boilerFromArg from "../boilerFromArg"
import addBoiler from "./addBoiler"

export class InstallBoiler {
  async run(
    destDir: string,
    ...repos: string[]
  ): Promise<void> {
    for (const repo of repos) {
      await addBoiler.run(destDir, ...repos)

      const name = await boilerFromArg(destDir, repo)
      await boiler.run(
        join(destDir, "boiler", name),
        destDir
      )
    }
  }
}

export default new InstallBoiler()
