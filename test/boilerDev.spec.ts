import { join } from "path"
import { remove } from "fs-extra"

import expect from "./expect"
import { BoilerDev } from "../src"

const dir = join(__dirname, "fixture")
const repo = "git@github.com:boiler-dev/boiler.git"

after(async () => {
  await remove(join(dir, "boiler.js"))
})

describe("boilerDev", () => {
  it("should instantiate", () => {
    const boiler = new BoilerDev([
      dir,
      repo,
      '{"data":true}',
    ])
    expect(boiler.repos).toEqual([repo])
    expect(boiler.data).toEqual({ data: true })
    expect(boiler.dir).toBe(dir)
  })

  it("should initializeFromPkgJson", async () => {
    const boiler = new BoilerDev([dir])
    await boiler.initFromPkgJson()
    expect(boiler.repos).toEqual([repo])
    expect(boiler.data).toEqual({ myData: true })
    expect(boiler.dir).toBe(dir)
  })

  it("should transpileBoilerJs", async () => {
    const boiler = new BoilerDev([dir])
    const boilerJsPath = await boiler.transpileBoilerJs(dir)
    const { processFile } = await import(boilerJsPath)
    expect(processFile).toEqual(expect.any(Function))
  })

  it("should getTrackedFiles", async () => {
    const boiler = new BoilerDev([dir])
    const files = await boiler.getTrackedFiles(dir)
    expect(files[0]).toEqual(expect.any(String))
  })
})
