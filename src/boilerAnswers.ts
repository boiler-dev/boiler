export class BoilerAnswers {
  records: Record<string, Record<string, any>> = {}

  load(
    cwdPath: string,
    boilerName: string
  ): Record<string, any> {
    const id = `${cwdPath}:${boilerName}`

    if (this.records[id]) {
      return this.records[id]
    }

    this.records[id] = {}
    return this.records[id]
  }

  allAnswers(cwdPath: string): Record<string, any> {
    const allAnswers = {}

    for (const key in this.records) {
      if (key.startsWith(cwdPath + ":")) {
        Object.assign(allAnswers, this.records[key])
      }
    }

    return allAnswers
  }
}

export default new BoilerAnswers()
