import boilerAnswers from "./boilerAnswers"
import boilerInstances from "./boilerInstances"
import { BoilerRecord } from "./boilerRecords"
import inquirer = require("inquirer")

export interface BoilerAction {
  action: string
  bin?: boolean
  dev?: boolean
  path?: string
  source: any
}

export class BoilerActions {
  records: Record<string, BoilerAction[]> = {}

  async load(
    cwdPath: string,
    ...records: BoilerRecord[]
  ): Promise<void> {
    for (const record of records) {
      const { answers, name } = record
      const id = `${cwdPath}:${name}`

      const instance = await boilerInstances.load(
        cwdPath,
        record
      )

      if (!instance || !instance.prompt) {
        continue
      }

      let prompts = await instance.prompt({
        cwdPath,
        allAnswers: boilerAnswers.allAnswers(cwdPath),
        ...record,
      })

      prompts = prompts.filter(
        prompt =>
          answers[prompt.name] === undefined ||
          answers[prompt.name] === null
      )

      const newAnswers = await inquirer.prompt(prompts)

      records[id] = Object.assign(
        records[id] || {},
        newAnswers
      )
    }
  }
}

export default new BoilerActions()
