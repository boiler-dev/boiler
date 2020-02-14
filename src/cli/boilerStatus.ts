import { join } from "path"
import listBoilers from "../listBoilers"
import git from "../git"

export class BoilerStatus {
  async run(destDir: string): Promise<void> {
    const boilers = await listBoilers(destDir)

    for (const boiler of boilers) {
      const boilerDir = join(destDir, boiler)
      const { out } = await git.status(boilerDir)

      // eslint-disable-next-line no-console
      console.log(`\n⚙️  ${boiler} status:\n\n` + out)
    }
  }
}

export default new BoilerStatus()
