import { basename, join, resolve } from "path"

import fs, {
  ensureDir,
  pathExists,
  writeFile,
  remove,
} from "fs-extra"
import inquirer from "inquirer"

import actions from "./actions"
import boilerActions, {
  BoilerActionWrite,
} from "./boilerActions"
import { BoilerFileRecord } from "./boilerFiles"
import boilerNpm from "./boilerNpm"
import boilerPackages from "./boilerPackages"
import { BoilerPathRecord } from "./boilerPaths"
import boilerPrompts from "./boilerPrompts"
import chmod from "./chmod"
import files from "./files"
import git from "./git"
import { newBoilerTs, newProjectRepos } from "./new"
import npm from "./npm"
import packages, { PackageRecord } from "./packages"
import ts from "./ts"

export interface BoilerRecord extends PackageRecord {
  repo: string

  answers?: Record<string, any>
  files?: BoilerFileRecord[]
  id?: string
  name?: string
  paths?: BoilerPathRecord
  writes?: BoilerActionWrite[]
  version?: string
}

export class Boiler {
  async absorb(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const records = await boilerPackages.find(
      cwdPath,
      args,
      { unique: true }
    )

    await boilerActions.load(
      cwdPath,
      this,
      "absorb",
      ...records
    )
  }

  async commit(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const message = args.pop()
    const records = await boilerPackages.find(
      cwdPath,
      args,
      { unique: true }
    )

    await Promise.all(
      records.map(async ({ paths }) => {
        const { boilerDirPath } = paths
        const isRepo = await pathExists(
          join(boilerDirPath, ".git")
        )
        if (isRepo) {
          await git.add(boilerDirPath)
          await git.commit(boilerDirPath, message)
          await git.push(boilerDirPath)
        } else {
          console.error(
            `⚠️ Not a git repository: ${boilerDirPath}`
          )
        }
      })
    )
  }

  async generate(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const newRecord =
      this.extractOption("--new", args) ||
      this.extractOption("-n", args)

    const records = await boilerPackages.find(
      cwdPath,
      args,
      {
        appendNew: true,
        forceNew: newRecord,
      }
    )

    await this.install(cwdPath, ...args)

    await boilerActions.load(
      cwdPath,
      this,
      "generate",
      ...records
    )

    await boilerNpm.install(cwdPath)
    await boilerPackages.save(cwdPath)
  }

  async install(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const records = await boilerPackages.find(
      cwdPath,
      args,
      { unique: true }
    )

    let promptRecords = records.filter(
      ({ newRecord, paths }) =>
        newRecord || !paths.boilerDirExists
    )

    let installRecords = records.filter(
      ({ paths }) => !paths.boilerDirExists
    )

    const boilerDirPath = join(cwdPath, "boiler")
    await /* TODO: JSFIX could not patch the breaking change:
    Creating a directory with fs-extra no longer returns the path 
    Suggested fix: The returned promise no longer includes the path of the new directory */
    ensureDir(boilerDirPath)

    await Promise.all(
      installRecords.map(async record => {
        const { repo, version } = record

        const { code, out } = await git.clone(
          boilerDirPath,
          repo
        )

        if (code !== 0) {
          console.error("⚠️  Git clone failed:\n\n", out)
          process.exit(1)
        }

        if (version) {
          await git.checkout(cwdPath, version)
        }
      })
    )

    installRecords = await boilerPackages.reload(
      cwdPath,
      installRecords
    )

    promptRecords = await boilerPackages.reload(
      cwdPath,
      promptRecords
    )

    await boilerPrompts.load(cwdPath, ...promptRecords)

    await boilerActions.load(
      cwdPath,
      this,
      "install",
      ...installRecords
    )

    await boilerNpm.install(cwdPath)
  }

  async new(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    if (!args.length) {
      args.push(".")
    }

    for (const arg of args) {
      const path = resolve(cwdPath, arg)
      const parentDir = join(path, "../")

      if (basename(parentDir) === "boiler") {
        await /* TODO: JSFIX could not patch the breaking change:
        Creating a directory with fs-extra no longer returns the path 
        Suggested fix: The returned promise no longer includes the path of the new directory */
        ensureDir(path)
        await git.init(path)

        const { repo } = await inquirer.prompt([
          {
            type: "input",
            name: "repo",
            message: "git repository url",
          },
        ])

        await writeFile(
          join(path, "boiler.ts"),
          newBoilerTs
        )

        await git.remote(path, repo)
        await this.commit(cwdPath, arg, "First commit")
      } else {
        await this.generate(path, ...newProjectRepos)
      }
    }
  }

  async push(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const records = await boilerPackages.find(
      cwdPath,
      args,
      { unique: true }
    )

    await Promise.all(
      records.map(async ({ paths }) => {
        const { boilerDirPath } = paths
        const isRepo = await pathExists(
          join(boilerDirPath, ".git")
        )
        if (isRepo) {
          await git.push(boilerDirPath)
        } else {
          console.error(
            `⚠️ Not a git repository: ${boilerDirPath}`
          )
        }
      })
    )
  }

  async status(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    let dirty: boolean

    const records = await boilerPackages.find(
      cwdPath,
      args,
      { unique: true }
    )

    for (const { name, paths } of records) {
      const { out } = await git.status(paths.boilerDirPath)

      dirty = dirty || !!out

      // eslint-disable-next-line no-console
      console.log(
        (out ? "🚨 dirty\t" : "✨ clean\t") +
          ` ${name}` +
          (out ? `\n${out}` : "")
      )
    }

    if (dirty) {
      process.exit(1)
    }
  }

  async uninstall(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const records = await boilerPackages.find(
      cwdPath,
      args,
      { unique: true }
    )

    const uninstallRecords = records.filter(
      ({ paths }) => paths.boilerDirExists
    )

    await boilerActions.load(
      cwdPath,
      this,
      "uninstall",
      ...uninstallRecords
    )

    await Promise.all(
      uninstallRecords.map(async record => {
        const { paths } = record
        await Promise.all([
          remove(paths.boilerDirPath),
          remove(paths.distJsPath),
        ])
      })
    )

    packages.remove(cwdPath, ...uninstallRecords)

    await boilerPackages.save(cwdPath)
    await boilerNpm.uninstall(cwdPath)
  }

  async update(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const records = await boilerPackages.find(
      cwdPath,
      args,
      { unique: true }
    )

    const updateRecords = records.filter(
      ({ paths }) => paths.boilerDirExists
    )

    await Promise.all(
      updateRecords.map(async record => {
        const { paths } = record
        await git.pull(paths.boilerDirPath)
      })
    )

    await boilerPrompts.load(cwdPath, ...updateRecords)

    await boilerActions.load(
      cwdPath,
      this,
      "update",
      ...updateRecords
    )

    await boilerPackages.save(cwdPath)
    await boilerNpm.install(cwdPath)
  }

  extractOption(opt: string, args: string[]): boolean {
    let found: boolean, index: number

    do {
      index = args.indexOf(opt)

      if (index > -1) {
        args.splice(index, 1)
        found = true
      }
    } while (index > -1)

    return found
  }
}

export default new Boiler()

export { BoilerAction } from "./boilerActions"
export { BoilerPrompt } from "./boilerPrompts"

export {
  ActionBoiler,
  PromptBoiler,
} from "./boilerInstances"

export { actions, chmod, files, fs, git, npm, ts }
