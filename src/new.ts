export const newBoilerTs = `import {
  InstallBoiler,
  PromptBoiler,
  GenerateBoiler,
  UninstallBoiler,
} from "boiler-dev"

export const install: InstallBoiler = async ({
  files,
  rootDirPath,
}) => {}

export const prompt: PromptBoiler = async ({
  files,
  rootDirPath,
}) => {
  const prompts = []
  return prompts
}

export const generate: GenerateBoiler = async ({
  answers,
  files,
  rootDirPath,
}) => {
  const actions = []
  return actions
}

export const uninstall: UninstallBoiler = async ({
  answers,
  files,
  rootDirPath,
}) => {}
`

export const newProjectRepos = [
  "git@github.com:boiler-dev/package-json-boiler.git",
  "git@github.com:boiler-dev/ts-boiler.git",
  "git@github.com:boiler-dev/eslint-prettier-ts-boiler.git",
  "git@github.com:boiler-dev/release-boiler.git",
  "git@github.com:boiler-dev/mocha-boiler.git",
  "git@github.com:boiler-dev/vscode-watch-boiler.git",
]
