# boiler

Boilerplate framework for the low code revolution 🥘

```bash
npm install -g boiler-dev
```

- Boilerplate generators live in their own repos (see an [example boilerplate repo](https://github.com/boiler-dev/package-json-boiler))
- Quickly commit to boilerplate repos from any project it is installed on
- Save user input to quickly regenerate boilerplate

## Install boilerplate from repo

1. `cd` to your project
2. `boiler generate [git repo]`

Boilerplate repos are cloned to a gitignored `boiler/` directory. Each boilerplate project inside `boiler/` is a functioning git repo that you may commit to.

> ℹ️ For more example boilerplate repos, take a look at [the boiler-dev GitHub org](https://github.com/boiler-dev).

## Update boilerplate from repo

1. `cd` to your project
2. `boiler update [boiler/my-boiler]`

## Create new boilerplate

1. `cd` to your project
2. `boiler init boiler/my-boiler`
3. Modify `boiler/my-boiler/boiler.ts` (see [next section](#boilerts) for details)
4. `boiler generate boiler/my-boiler`
5. `boiler commit boiler/my-boiler "First commit"`

## `boiler.ts`

Each boilerplate repo must have a `boiler.ts` or `boiler.js` file:

```ts
import {
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
```

### Prompt

The `prompt` function returns an array of "prompts" that define user input to retrieve.

Prompts are just an array of [Inquirer.js Questions](https://github.com/SBoudrias/Inquirer.js/#objects).

### Generate

The `generate` function returns an array of "actions" necessary to install the boilerplate.

Actions are a convenience; feel free to run your own async code within `installBoiler` and return nothing.

#### Write file action

```ts
actions.push({
  action: "write",
  path: "bin/hi",
  source: "#!/usr/bin/env node",
  bin: true,
})
```

> ℹ️ The `bin` option runs `chmod +x` on the file.

#### Merge JSON action

```ts
actions.push({
  action: "merge",
  path: "package.json",
  source: { hi: true },
})
```

> ℹ️ The merge functionality comes from [deepmerge](https://github.com/TehShrike/deepmerge).

#### NPM install action

```ts
actions.push({
  action: "npmInstall",
  source: ["typescript"],
  dev: true,
})
```

## Start a fresh project

When not used within a `boiler/` directory, the `boiler init` command creates a new TypeScript project to kick things off:

```bash
mkdir new-project
cd new-project
boiler init
```

> ℹ️ This is a shortcut for manually installing these boilerplate projects:
>
> - [package-json-boiler](https://github.com/boiler-dev/package-json-boiler)
> - [ts-boiler](https://github.com/boiler-dev/ts-boiler)
> - [eslint-prettier-ts-boiler](https://github.com/boiler-dev/eslint-prettier-ts-boiler)
> - [release-boiler](https://github.com/boiler-dev/release-boiler)
> - [mocha-boiler](https://github.com/boiler-dev/mocha-boiler)
> - [vscode-watch-boiler](https://github.com/boiler-dev/vscode-watch-boiler)
