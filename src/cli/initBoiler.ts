import npm from "../npm"
import installBoiler from "./installBoiler"

export class InitBoiler {
  async run(destDir: string): Promise<void> {
    await installBoiler.run(
      destDir,
      "git@github.com:boiler-dev/package-json-boiler.git",
      "git@github.com:boiler-dev/ts-boiler.git"
    )
    await npm.install(destDir, ["boiler-dev"], {
      saveDev: true,
    })
  }
}

export default new InitBoiler()
