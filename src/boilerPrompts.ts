import { BoilerRecord } from "."
import boilerAnswers from "./boilerAnswers"
import boilerInstances from "./boilerInstances"
import inquirer = require("inquirer")

export interface BoilerPrompt {
  type: string
  name: string
  message: string
  default?: any
  choices?: Record<string, any>[]
}

export class BoilerPrompts {
  records: Record<string, BoilerPrompt[]> = {}

  async load(
    cwdPath: string,
    ...records: BoilerRecord[]
  ): Promise<void> {
    for (const record of records) {
      const { answers } = record
      const id = `${cwdPath}:${record.id}`

      const instance = await boilerInstances.load(
        cwdPath,
        record
      )

      if (!instance || !instance.prompt) {
        continue
      }

      const prompts = await instance.prompt({
        cwdPath,
        allAnswers: boilerAnswers.allAnswers(cwdPath),
        ...record,
      })

      records[id] = prompts.filter(
        prompt =>
          answers[prompt.name] === undefined ||
          answers[prompt.name] === null
      )

      const newAnswers = await inquirer.prompt(records[id])
      Object.assign(answers, newAnswers)
    }
  }
}

export default new BoilerPrompts()
