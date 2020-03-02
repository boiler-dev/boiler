# boiler

Boilerplate generator framework & low-code power tool 🛠️

```bash
npm install -g boiler-dev
```

## Generator lifecycle

### Start a project

- Start a TypeScript project [using generators](#new-project) — `boiler new`

### Generator package manager

- Install or update — `boiler install`
  - The `boiler` directory is like `node_modules` for generators
  - Unlike npm packages, boilers are live git repos
- Uninstall — `boiler uninstall`

### Run generator — `boiler generate`

- Prompt and store user input — `.boiler.json`
- Create and update files
- Install npm dependencies

### Update and re-run generator

- Update generator — `boiler install`
- Re-run generator — `boiler generate`
- Generates without needing user input — `.boiler.json`

### Develop generator

- Create a new generator — `boiler new`
- Commit and push code — `boiler commit`
- Status of generator repos — `boiler status`

## Usage examples

### Install boiler

```bash
npm install -g boiler-dev
```

### Run generator

1. `cd` to your project
2. `boiler generate [git repo]`

The `generate` command automatically installs new generators.

Generator repos are cloned to the `boiler` directory within your project. The `boiler` directory is like `node_modules` for your generators.

> ℹ️ Explore example generators on [the boiler-dev GitHub org](https://github.com/boiler-dev).

### Update and regenerate

1. `cd` to your project
2. `boiler install [boiler/my-generator]`
3. `boiler generate [boiler/my-generator]`

### New generator

1. `cd` to your project
2. `boiler new boiler/my-generator`

### Develop generator

1. Modify `boiler/my-generator/boiler.ts` (see [next section](#boilerts) for API details)
2. `boiler generate boiler/my-generator`
3. `boiler commit boiler/my-generator "First commit"`

## Generator API — `boiler.ts`

Each generator repo must have a `boiler.ts` or `boiler.js` file:

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

Prompts are essentially an array of [Inquirer.js Questions](https://github.com/SBoudrias/Inquirer.js/#objects).

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

## New project

When not used within a `boiler/` directory, the `boiler new` command creates a new TypeScript project to kick things off:

```bash
boiler new my-project
```

> ℹ️ This is a shortcut for manually running the following generators:
>
> - [package-json-boiler](https://github.com/boiler-dev/package-json-boiler)
> - [ts-boiler](https://github.com/boiler-dev/ts-boiler)
> - [eslint-prettier-ts-boiler](https://github.com/boiler-dev/eslint-prettier-ts-boiler)
> - [release-boiler](https://github.com/boiler-dev/release-boiler)
> - [mocha-boiler](https://github.com/boiler-dev/mocha-boiler)
> - [vscode-watch-boiler](https://github.com/boiler-dev/vscode-watch-boiler)
