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
}

export default new BoilerAnswers()
