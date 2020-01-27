import {
  pathExists,
  pathExistsSync,
  readFile,
  readJson,
  writeFile,
} from "fs-extra"
import { join } from "path"
import pino from "pino"
import { dir } from "tmp-promise"
import { transpileModule } from "typescript"

import spawnTerminal from "./spawnTerminal"

export const REPO_REGEX = /((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)(\/)?/
export const JSON_REGEX = /\s*{/

export class BoilerDev {
  data = {}
  dir: string = process.cwd()
  log = pino()
  repos: string[] = []

  constructor(args = []) {
    for (const arg of args) {
      if (arg.match(JSON_REGEX)) {
        Object.assign(this.data, JSON.parse(arg))
      } else if (arg.match(REPO_REGEX)) {
        this.repos.push(arg)
      } else if (pathExistsSync(arg)) {
        this.dir = arg
      } else {
        this.log.error(
          `Invalid argument: ${JSON.stringify(arg)}`
        )
      }
    }
  }

  async boiler(): Promise<void> {
    try {
      this.initFromPkgJson()

      const promises = []

      for (let repo of this.repos) {
        let branch = "master"

        if (repo.includes("#")) {
          ;[repo, branch] = repo.split("#")
        }

        promises.push(async () => {
          const { path } = await dir()

          const [boilerJsPath] = await Promise.all([
            this.transpileBoilerJs(path),
            this.gitCloneToTmp(branch, path, repo),
          ])

          const {
            defaults,
            ignore,
            process,
            prompts,
          } = await import(boilerJsPath)
        })
      }

      await Promise.all(promises)
    } catch (e) {
      this.log.error(e)
    }
  }

  async initFromPkgJson(): Promise<void> {
    const pkgJsonPath = join(this.dir, "package.json")

    if (await pathExists(pkgJsonPath)) {
      const pkgJson = await readJson(pkgJsonPath)

      if (pkgJson.boiler) {
        this.data = pkgJson.boiler.data
        this.repos = pkgJson.boiler.repos.concat(this.repos)
      }
    }
  }

  async gitCloneToTmp(
    branch: string,
    path: string,
    repo: string
  ): Promise<void> {
    await spawnTerminal({
      command: "git",
      args: ["clone", "--depth", "1", repo, "-b", branch],
      cwd: path,
    })
  }

  async transpileBoilerJs(path: string): Promise<string> {
    const boilerTsPath = join(path, "boiler.ts")
    const boilerJsPath = boilerTsPath.replace(
      /\.ts$/,
      ".js"
    )

    if (await pathExists(boilerTsPath)) {
      const ts = await readFile(boilerTsPath)
      const code = transpileModule(ts.toString(), {})
      await writeFile(boilerJsPath, code.outputText)
    }

    return boilerJsPath
  }
}
