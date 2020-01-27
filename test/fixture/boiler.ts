import {
  BoilerDefaults,
  BoilerProcessFile,
  BoilerIgnore,
  BoilerOnly,
  BoilerPrompts,
} from "../../src"

export const defaults: BoilerDefaults = async boiler => {
  return {}
}

export const ignore: BoilerIgnore = async boiler => {
  return []
}

export const only: BoilerOnly = async boiler => {
  return []
}

export const processFile: BoilerProcessFile = async (
  boiler,
  path,
  src
) => {
  return [{ path, src }]
}

export const prompts: BoilerPrompts = async boiler => {
  return []
}
