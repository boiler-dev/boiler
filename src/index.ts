import { basename, join, resolve } from "path"

import fs, {
  ensureDir,
  pathExists,
  writeFile,
  remove,
} from "fs-extra"
import inquirer from "inquirer"

import actions from "./actions"
import boilerActions from "./boilerActions"
import boilerAnswers from "./boilerAnswers"
import boilerFiles from "./boilerFiles"
import boilerPackages from "./boilerPackages"
import boilerPaths from "./boilerPaths"
import boilerPrompts from "./boilerPrompts"
import { BoilerRecord } from "./boilerRecords"
import chmod from "./chmod"
import files from "./files"
import git from "./git"
import { newBoilerTs, newProjectRepos } from "./new"
import npm from "./npm"
import packages from "./packages"
import ts from "./ts"

export class Boiler {
  async absorb(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const records = (await packages.find(cwdPath, args, {
      modify: this.modifyFind,
      unique: true,
    })) as BoilerRecord[]

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
    const records = (await packages.find(cwdPath, args, {
      modify: this.modifyFind,
      unique: true,
    })) as BoilerRecord[]

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

  extractName(nameOrPathOrRepo: string): string {
    const nameMatch = nameOrPathOrRepo.match(
      /([^\/.]+)\.*[git/]*$/
    )

    if (!nameMatch) {
      console.error(
        "Argument `${repo}` should be a name, path, or repository."
      )
      process.exit(1)
    }

    return nameMatch[1]
  }

  async modifyFind(
    cwdPath: string,
    record: BoilerRecord
  ): Promise<BoilerRecord> {
    const { answers, id, name } = record

    const { out } = await git.remote(
      join(cwdPath, "boiler", name)
    )

    record.repo = out.trim()
    record.name = this.extractName(record.repo)

    record.answers = boilerAnswers.load(
      cwdPath,
      id,
      answers
    )

    record.paths = await boilerPaths.load(
      cwdPath,
      record.name
    )

    if (!record.paths.boilerDirExists) {
      return record
    }

    record.files = await boilerFiles.load(cwdPath, record)

    record.version = await git.commitHash(
      join(cwdPath, "boiler", record.name)
    )

    return record
  }

  async modifySave(
    cwdPath: string,
    record: BoilerRecord
  ): Promise<BoilerRecord> {
    const { answers, repo, version, writes } = record
    return {
      answers,
      repo,
      writes:
        boilerActions.writes(cwdPath, record) || writes,
      version,
    }
  }

  async push(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const records = (await packages.find(cwdPath, args, {
      modify: this.modifyFind,
      unique: true,
    })) as BoilerRecord[]

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
        await ensureDir(path)
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

  async install(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const promptAll = this.extractOption(
      "--prompt-all",
      args
    )

    const records = (await packages.find(cwdPath, args, {
      modify: this.modifyFind,
      unique: true,
    })) as BoilerRecord[]

    const boilerDirPath = join(cwdPath, "boiler")
    await ensureDir(boilerDirPath)

    const installRecords = records.filter(
      ({ paths }) => !paths.boilerDirExists
    )

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

    await boilerPrompts.load(
      cwdPath,
      ...(promptAll ? records : installRecords)
    )

    await boilerActions.load(
      cwdPath,
      this,
      "install",
      ...installRecords
    )

    await boilerPackages.install(cwdPath)
  }

  async save(cwdPath: string): Promise<void> {
    await packages.save(
      cwdPath,
      join(cwdPath, ".boiler.json"),
      { modify: this.modifySave }
    )
  }

  async uninstall(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const records = (await packages.find(cwdPath, args, {
      modify: this.modifyFind,
      unique: true,
    })) as BoilerRecord[]

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
        await remove(paths.boilerDirPath)
      })
    )

    packages.remove(cwdPath, ...uninstallRecords)

    await this.save(cwdPath)
    await boilerPackages.uninstall(cwdPath)
  }

  async update(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const records = (await packages.find(cwdPath, args, {
      modify: this.modifyFind,
      unique: true,
    })) as BoilerRecord[]

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

    await boilerPackages.install(cwdPath)
  }

  async generate(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const newRecord =
      this.extractOption("--new", args) ||
      this.extractOption("-n", args)

    await this.install(cwdPath, "--prompt-all", ...args)

    const records = (await packages.find(cwdPath, args, {
      forceNew: newRecord,
      modify: this.modifyFind,
    })) as BoilerRecord[]

    await boilerActions.load(
      cwdPath,
      this,
      "generate",
      ...records
    )

    await boilerPackages.install(cwdPath)

    packages.append(cwdPath, records)
    await this.save(cwdPath)
  }

  async status(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    let dirty: boolean

    const records = (await packages.find(cwdPath, args, {
      modify: this.modifyFind,
      unique: true,
    })) as BoilerRecord[]

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
