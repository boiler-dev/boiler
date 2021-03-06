import { join } from "path"
import { readJson, pathExists } from "fs-extra"

import npm from "./npm"

export interface BoilerPackageRecord {
  dev: string[]
  prod: string[]
  uninstall: string[]
}

export class BoilerNpm {
  records: Record<string, BoilerPackageRecord> = {}

  load(cwdPath: string): BoilerPackageRecord {
    if (!this.records[cwdPath]) {
      this.records[cwdPath] = {
        dev: [],
        prod: [],
        uninstall: [],
      }
    }
    return this.records[cwdPath]
  }

  async install(cwdPath: string): Promise<void> {
    if (this.records[cwdPath]) {
      const pkgJsonPath = join(cwdPath, "package.json")
      let pkgJson = {}

      if (!(await pathExists(pkgJsonPath))) {
        return
      }

      pkgJson = await readJson(pkgJsonPath)

      let { dev, prod } = this.records[cwdPath]

      dev = dev.filter(
        pkgName =>
          !pkgJson["devDependencies"] ||
          !pkgJson["devDependencies"][pkgName]
      )

      prod = prod.filter(
        pkgName =>
          !pkgJson["dependencies"] ||
          !pkgJson["dependencies"][pkgName]
      )

      await npm.install(cwdPath, dev, {
        saveDev: true,
      })

      await npm.install(cwdPath, prod)
    }
  }

  async uninstall(cwdPath: string): Promise<void> {
    if (this.records[cwdPath]) {
      const pkgJsonPath = join(cwdPath, "package.json")

      if (!(await pathExists(pkgJsonPath))) {
        return
      }

      const { uninstall } = this.records[cwdPath]

      await npm.uninstall(cwdPath, uninstall)
    }
  }
}

export default new BoilerNpm()
