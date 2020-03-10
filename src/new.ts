export const newBoilerTs = `import {
  ActionBoiler,
  PromptBoiler,
} from "boiler-dev"

export const install: ActionBoiler = async ({
  cwdPath,
  files,
}) => {
  const actions = []
  return actions
}

export const prompt: PromptBoiler = async ({
  cwdPath,
  files,
}) => {
  const prompts = []
  return prompts
}

export const generate: ActionBoiler = async ({
  cwdPath,
  answers,
  files,
}) => {
  const actions = []
  return actions
}

export const uninstall: ActionBoiler = async ({
  cwdPath,
  answers,
  files,
}) => {
  const actions = []
  return actions
}
`

export const newProjectRepos = [
  "git@github.com:boiler-dev/package-json-boiler.git",
  "git@github.com:boiler-dev/ts-boiler.git",
  "git@github.com:boiler-dev/eslint-prettier-ts-boiler.git",
  "git@github.com:boiler-dev/release-boiler.git",
  "git@github.com:boiler-dev/source-boiler.git",
  "git@github.com:boiler-dev/mocha-boiler.git",
  "git@github.com:boiler-dev/vscode-watch-boiler.git",
]
