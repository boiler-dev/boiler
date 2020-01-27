import {
  BoilerJsDefaults,
  BoilerJsProcessFile,
  BoilerJsIgnore,
  BoilerJsOnly,
  BoilerJsPrompts,
} from "../../src"

export const defaults: BoilerJsDefaults = async boiler => {
  return {}
}

export const ignore: BoilerJsIgnore = async boiler => {
  return []
}

export const only: BoilerJsOnly = async boiler => {
  return []
}

export const processFile: BoilerJsProcessFile = async (
  boiler,
  path,
  src
) => {
  return [{ path, src }]
}

export const prompts: BoilerJsPrompts = async boiler => {
  return []
}
