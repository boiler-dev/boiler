export const newBoilerTs = `import {
  ActionBoiler,
  PromptBoiler,
  BoilerAction,
  BoilerPrompt,
} from "boiler-dev"

export const install: ActionBoiler = async () => {
  const actions: BoilerAction[] = []

  // actions.push({
  //   action: "npmInstall",
  //   dev: true,
  //   source: ["some-package"],
  // })

  return actions
}

export const prompt: PromptBoiler = async () => {
  const prompts: BoilerPrompt[] = []

  // prompts.push({
  //   type: "input",
  //   name: "someValue",
  //   message: "some message",
  //   default: "some default",
  // })

  return prompts
}

export const generate: ActionBoiler = async () => {
  const actions: BoilerAction[] = []

  // actions.push({
  //   action: "write",
  //   path: "src/someName.ts",
  //   sourcePath: "tsignore/someName.ts",
  // })

  return actions
}

export const absorb: ActionBoiler = async ({ writes }) => {
  return writes.map(({ path, sourcePath }) => ({
    action: "write",
    sourcePath: path,
    path: sourcePath,
    modify: (src: string): string => src,
  }))
}

export const uninstall: ActionBoiler = async () => {
  const actions: BoilerAction[] = []

  // actions.push({
  //   action: "npmUninstall",
  //   dev: true,
  //   source: ["some-package"],
  // })

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
