import inquirer from "inquirer"

import { Boiler } from "."
import actions from "./actions"
import { BoilerRecord } from "./boilerRecords"
import ts from "./ts"

export interface BoilerAction {
  action: string
  bin?: boolean
  dev?: boolean
  path: string
  source: any
}

export interface BoilerInput extends BoilerRecord {
  cwdPath: string
}

export type InstallBoiler = (
  input: BoilerInput
) => Promise<BoilerAction[]>

export type UninstallBoiler = (
  input: BoilerInput
) => Promise<BoilerAction[]>

export type PromptBoiler = (
  input: BoilerInput
) => Promise<
  {
    type: string
    name: string
    message: string
    default?: any
    choices?: Record<string, any>[]
  }[]
>

export type GenerateBoiler = (
  input: BoilerInput
) => Promise<BoilerAction[]>

export interface BoilerInstance {
  install: InstallBoiler
  prompt: PromptBoiler
  generate: GenerateBoiler
  uninstall: UninstallBoiler
}

export class BoilerInstances {
  records: Record<string, BoilerInstance> = {}

  async load(
    cwdPath: string,
    record: BoilerRecord
  ): Promise<BoilerInstance> {
    const { name, paths } = record
    const id = `${cwdPath}:${name}`

    if (this.records[id]) {
      return this.records[id]
    }

    const {
      distJsExists,
      distJsPath,
      boilerJsExists,
      boilerJsPath,
      boilerTsExists,
      boilerTsPath,
    } = paths

    if (
      !boilerJsExists &&
      !distJsExists &&
      boilerTsExists
    ) {
      await ts.transpile(boilerTsPath, distJsPath)
    }

    if (boilerJsExists || boilerTsExists) {
      this.records[id] = (await import(
        boilerJsExists ? boilerJsPath : distJsPath
      )) as BoilerInstance
    }

    return this.records[id]
  }

  async actionCallback(
    cwdPath: string,
    boiler: Boiler,
    callback: string,
    ...records: BoilerRecord[]
  ): Promise<void> {
    for (const record of records) {
      const instance = await this.load(cwdPath, record)

      if (!instance || !instance[callback]) {
        continue
      }

      const boilerActions = await instance[callback]({
        cwdPath,
        ...record,
      })

      await actions.run(cwdPath, boiler, boilerActions)
    }
  }

  async promptCallback(
    cwdPath: string,
    ...records: BoilerRecord[]
  ): Promise<void> {
    for (const record of records) {
      const { answers } = record
      const instance = await this.load(cwdPath, record)

      if (!instance || !instance.prompt) {
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
}

export default new BoilerInstances()
