import { join } from "path"
import git from "./git"
import listBoilers from "./listBoilers"
import { pathExists } from "fs-extra"

export interface BoilerInput {
  destDir: string
  files: {
    path: string
    source: string
  }[]
  prompts?: Record<string, any>
}

export type SetupBoiler = (
  input: BoilerInput
) => Promise<void>

export type TeardownBoiler = (
  input: BoilerInput
) => Promise<void>

export type PromptBoiler = (
  input: BoilerInput
) => Promise<
  {
    type: string
    name: string
    default: any
    message: string
  }[]
>

export type InstallBoiler = (
  input: BoilerInput
) => Promise<
  { path: string; source: string; action: string }[]
>

export class Boiler {
  async run(
    boilerName: string,
    destDir: string
  ): Promise<void> {
    const boilerJs = join(
      destDir,
      "dist/boiler",
      boilerName,
      "boiler.js"
    )
    const boilerJsExists = await pathExists(boilerJs)

    if (boilerJsExists) {
      const boiler = await import(boilerJs)
    }
  }
}

export default new Boiler()
export { git, listBoilers }
