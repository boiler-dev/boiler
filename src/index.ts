export interface BoilerFilesInput {
  destDir: string
  files: {
    path: string
    source: string
  }[]
  prompts?: Record<string, any>
}

export type PromptBoilerFiles = (
  input: BoilerFilesInput
) => {
  type: string
  name: string
  default: any
  message: string
}[]

export type ProcessBoilerFiles = (
  input: BoilerFilesInput
) => { path: string; source: string; action: string }[]

export class Boiler {
  async run(
    boilerPath: string,
    destDir: string
  ): Promise<void> {}
}

export default new Boiler()
