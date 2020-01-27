////
import { join } from "path"

////
import {
  pathExists,
  pathExistsSync,
  readFile,
  readJson,
  writeFile,
} from "fs-extra"
import inquirer from "inquirer"
import pino from "pino"
import { dir } from "tmp-promise"
import { transpileModule } from "typescript"

////
import { spawnTerminal } from "./spawnTerminal"

////
export const REPO_REGEX = /((git|ssh|http(s)?)|(git@[\w.]+))(:(\/\/)?)([\w.@:/\-~]+)(\.git)(\/)?/
export const JSON_REGEX = /\s*{/

////
export type BoilerDefaults = (
  boiler: BoilerDev
) => Promise<Record<string, any>>

export type BoilerIgnore = (
  boiler: BoilerDev
) => Promise<(string | RegExp)[]>

export type BoilerOnly = (
  boiler: BoilerDev
) => Promise<(string | RegExp)[]>

export type BoilerProcessFile = (
  boiler: BoilerDev,
  path: string,
  src: string
) => Promise<{ path: string; src: string }[]>

export type BoilerPrompts = (
  boiler: BoilerDev
) => Promise<{ type: string; name: string }[]>

////
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

          await this.gitCloneToTmp(branch, path, repo)

          const boilerJsPath = await this.transpileBoilerJs(
            path
          )

          const {
            defaults,
            ignore,
            only,
            processFile,
            prompts,
          }: {
            defaults: BoilerDefaults
            ignore: BoilerIgnore
            only: BoilerOnly
            prompts: BoilerPrompts
            processFile: BoilerProcessFile
          } = await import(boilerJsPath)

          this.data = Object.assign(
            {},
            await defaults(this),
            await this.prompts(prompts),
            this.data
          )

          await this.processFiles(
            path,
            ignore,
            only,
            processFile
          )
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
    await spawnTerminal("git", {
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

  async getTrackedFiles(path: string): Promise<string[]> {
    const { out } = await spawnTerminal("git", {
      args: [
        "ls-tree",
        "--full-tree",
        "-r",
        "--name-only",
        "HEAD",
      ],
    })

    return out.split("\r\n").slice(0, -1)
  }

  async prompts(
    prompts: BoilerPrompts
  ): Promise<Record<string, any>> {
    return await inquirer.prompt(await prompts(this))
  }

  async processFiles(
    path: string,
    ignore: BoilerIgnore,
    only: BoilerOnly,
    processFile: BoilerProcessFile
  ): Promise<void> {
    const trackedFiles = await this.getTrackedFiles(path)
    const files = await this.filterFiles(
      trackedFiles,
      ignore,
      only
    )
    const promises = []

    for (const file of files) {
      promises.push(async () => {
        const filePath = join(path, file)
        const src = await readFile(filePath)
        const files = await processFile(
          this,
          filePath,
          src.toString()
        )
        for (const { path, src } of files) {
          await writeFile(path, src)
        }
      })
    }

    await Promise.all(promises)
  }

  async filterFiles(
    files: string[],
    ignore: BoilerIgnore,
    only: BoilerOnly
  ): Promise<string[]> {
    const ignorePaths = await ignore(this)
    const onlyPaths = await only(this)
    return files.filter(file => {
      return (
        !this.matchPath(file, ignorePaths) &&
        this.matchPath(file, onlyPaths)
      )
    })
  }

  matchPath(
    path: string,
    paths: (string | RegExp)[]
  ): boolean {
    for (const matcher of paths) {
      if (
        typeof matcher === "string" &&
        path.startsWith(matcher)
      ) {
        return true
      }
      if (
        matcher instanceof RegExp &&
        path.match(matcher)
      ) {
        return true
      }
    }
  }
}
