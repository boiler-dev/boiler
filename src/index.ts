import { basename, join, resolve } from "path"
import fs, {
  ensureDir,
  pathExists,
  writeFile,
  remove,
} from "fs-extra"
import inquirer from "inquirer"

import actions from "./actions"
import boilerPackages from "./boilerPackages"
import boilerRecords from "./boilerRecords"
import chmod from "./chmod"
import files from "./files"
import git from "./git"
import { newBoilerTs, newProjectRepos } from "./new"
import npm from "./npm"
import ts from "./ts"
import boilerInstances from "./boilerInstances"

export class Boiler {
  async commit(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const message = args.pop()
    const { allRecords } = await boilerRecords.findUnique(
      cwdPath,
      ...args
    )

    await Promise.all(
      allRecords.map(async ({ paths }) => {
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
    const { allRecords } = await boilerRecords.findUnique(
      cwdPath,
      ...args
    )

    const boilerDirPath = join(cwdPath, "boiler")
    await ensureDir(boilerDirPath)

    const installRecords = allRecords.filter(
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

    boilerRecords.reset(cwdPath, ...installRecords)
    await boilerRecords.fill(cwdPath, ...installRecords)

    await boilerInstances.promptCallback(
      cwdPath,
      ...installRecords
    )

    await boilerInstances.actionCallback(
      cwdPath,
      "install",
      ...installRecords
    )

    await boilerPackages.install(cwdPath)
  }

  async uninstall(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const {
      allRecords,
      records,
    } = await boilerRecords.findUnique(cwdPath, ...args)

    const uninstallRecords = allRecords.filter(
      ({ paths }) => paths.boilerDirExists
    )

    await Promise.all(
      uninstallRecords.map(async record => {
        const { paths } = record
        await remove(paths.boilerDirPath)
      })
    )

    await boilerInstances.actionCallback(
      cwdPath,
      "uninstall",
      ...uninstallRecords
    )

    boilerRecords.remove(cwdPath, ...uninstallRecords)
    await boilerRecords.save(cwdPath)
  }

  async update(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const { allRecords } = await boilerRecords.findUnique(
      cwdPath,
      ...args
    )

    const updateRecords = allRecords.filter(
      ({ paths }) => paths.boilerDirExists
    )

    await Promise.all(
      updateRecords.map(async record => {
        const { paths } = record
        await git.pull(paths.boilerDirPath)
      })
    )

    boilerRecords.reset(cwdPath, ...updateRecords)
    await boilerRecords.fill(cwdPath, ...updateRecords)

    await boilerInstances.promptCallback(
      cwdPath,
      ...updateRecords
    )

    await boilerInstances.actionCallback(
      cwdPath,
      "update",
      ...updateRecords
    )

    await boilerPackages.install(cwdPath)
  }

  async generate(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    await this.install(cwdPath, ...args)

    const {
      newRecords,
      allRecords,
    } = await boilerRecords.find(cwdPath, ...args)

    await boilerInstances.actionCallback(
      cwdPath,
      "generate",
      ...allRecords
    )

    await boilerPackages.install(cwdPath)

    boilerRecords.append(cwdPath, ...newRecords)
    await boilerRecords.save(cwdPath)
  }

  async status(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    let dirty: boolean

    const { records } = await boilerRecords.findUnique(
      cwdPath,
      ...args
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

export {
  InstallBoiler,
  PromptBoiler,
  GenerateBoiler,
  UninstallBoiler,
} from "./boilerInstances"

export {
  actions,
  boilerRecords,
  chmod,
  files,
  fs,
  git,
  npm,
  ts,
}
