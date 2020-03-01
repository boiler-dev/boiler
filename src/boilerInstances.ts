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
) => Promise<void>

export type UninstallBoiler = (
  input: BoilerInput
) => Promise<void>

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
}

export default new BoilerInstances()
