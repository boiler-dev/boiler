import { basename, join, resolve } from "path"
import { ensureDir, pathExists, writeFile } from "fs-extra"
import inquirer from "inquirer"

import actions from "./actions"
import boilerRecords from "./boilerRecords"
import chmod from "./chmod"
import fs from "./fs"
import git from "./git"
import { initBoilerTs, initRepos } from "./init"
import npm from "./npm"
import ts from "./ts"

export interface BoilerNpmModules {
  dev: string[]
  prod: string[]
}

export class Boiler {
  npmModules: Record<string, BoilerNpmModules> = {}

  async commit(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const message = args.pop()
    const [
      records,
      newRecords,
    ] = await boilerRecords.findUnique(cwdPath, ...args)

    for (const { paths } of records.concat(newRecords)) {
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
    }
  }

  async init(
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
          initBoilerTs
        )

        await git.remote(path, repo)
        await this.commit(cwdPath, arg, "First commit")
      } else {
        await this.generate(path, ...initRepos)
      }
    }
  }

  async install(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const [
      records,
      newRecords,
    ] = await boilerRecords.findUnique(cwdPath, ...args)

    const allRecords = records.concat(newRecords)

    const boilerDirPath = join(cwdPath, "boiler")
    await ensureDir(boilerDirPath)

    for (const record of allRecords) {
      const { paths, repo, version } = record

      if (await pathExists(paths.boilerDirPath)) {
        await git.pull(paths.boilerDirPath)
      } else {
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
      }
    }

    boilerRecords.reset(cwdPath, ...allRecords)
  }

  async generate(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    await this.install(cwdPath, ...args)
    await this.prompt(cwdPath, ...args)

    const [records, newRecords] = await boilerRecords.find(
      cwdPath,
      ...args
    )

    const allRecords = records.concat(newRecords)

    for (const record of allRecords) {
      const { instance } = record

      if (!instance) {
        continue
      }

      if (!instance.generate) {
        continue
      }

      const boilerActions = await instance.generate({
        cwdPath,
        ...record,
      })

      for (const record of boilerActions) {
        if (!record) {
          continue
        }

        const { action } = record

        if (action === "write") {
          await actions.write(record)
        }

        if (action === "merge") {
          await actions.merge(record)
        }

        if (action === "npmInstall") {
          actions.npmInstall(
            cwdPath,
            this.npmModules,
            record
          )
        }
      }
    }

    boilerRecords.append(cwdPath, ...newRecords)

    await this.npmInstall(cwdPath)
    await boilerRecords.save(cwdPath)
  }

  async prompt(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    const [records, newRecords] = await boilerRecords.find(
      cwdPath,
      ...args
    )

    for (const record of records.concat(newRecords)) {
      const { answers, instance } = record

      if (!instance.prompt) {
        continue
      }

      let prompts = await instance.prompt({
        cwdPath,
        ...record,
      })

      prompts = prompts.filter(
        prompt =>
          answers[prompt.name] === undefined ||
          answers[prompt.name] === null
      )

      const newAnswers = await inquirer.prompt(prompts)

      Object.assign(answers, newAnswers)
    }
  }

  async status(
    cwdPath: string,
    ...args: string[]
  ): Promise<void> {
    let dirty: boolean

    const [records] = await boilerRecords.findUnique(
      cwdPath,
      ...args
    )

    for (const { paths } of records) {
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

  async npmInstall(cwdPath: string): Promise<void> {
    if (this.npmModules[cwdPath]) {
      await npm.install(
        cwdPath,
        this.npmModules[cwdPath].dev,
        {
          saveDev: true,
        }
      )

      await npm.install(
        cwdPath,
        this.npmModules[cwdPath].prod
      )
    }
  }
}

export default new Boiler()
export { actions, boilerRecords, chmod, fs, git, npm, ts }
