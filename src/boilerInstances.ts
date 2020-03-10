import { BoilerAction } from "./boilerActions"
import { BoilerRecord } from "./boilerRecords"
import ts from "./ts"
import { BoilerPrompt } from "./boilerPrompts"

export interface BoilerInput extends BoilerRecord {
  cwdPath: string
  allAnswers: Record<string, any>
}

export type ActionBoiler = (
  input: BoilerInput
) => Promise<BoilerAction[]>

export type PromptBoiler = (
  input: BoilerInput
) => Promise<BoilerPrompt[]>

export interface BoilerInstance {
  install: ActionBoiler
  prompt: PromptBoiler
  generate: ActionBoiler
  uninstall: ActionBoiler
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
}

export default new BoilerInstances()
