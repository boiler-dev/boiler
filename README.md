# boiler

Boilerplate framework 🥘

```bash
npm install -g boiler-dev
```

- Easy to hack on, clones boilerplate repos to gitignored `boiler/` directory within your project
- Shares single build/watch task with project using [TypeScript Project References](https://github.com/boiler-dev/boiler/blob/master/typescriptlang.org/docs/handbook/project-references.html)
- Doesn't leave a mark on final committed project code other than `boiler.json`
- Saves user inputs for quick updates

## Install boilerplate from repo

1. `cd` to your project
2. `boiler install [git repo]`
3. Boiler clones repo to `boilers/` and gitignores it
4. Boiler prompts for input and installs boilerplate (using [`boilers/*/boiler.ts`](#boilerts))
5. Boiler saves repo and input to `boiler.json`

Even though `boilers/` is gitignored, each boilerplate project inside is a functioning git repo that you may modify, commit, and push to.

> ℹ️ For boilerplate repos, take a look at [the boiler-dev GitHub org](https://github.com/boiler-dev).

## Update boilerplate from repo

1. `cd` to your project
2. `boiler update [boiler/my-boiler]`
3. `boiler install [boiler/my-boiler]`

## Create new boilerplate

1. `cd` to your project
2. `boiler init boiler/my-boiler`

## Modify boilerplate

1. Hack on `boiler/my-boiler/boiler.ts` (see [next section](#boilerts))
2. `boiler install boiler/my-boiler`
3. `boiler commit boiler/my-boiler "First commit"`

## `boiler.ts`

Each boilerplate repo must have a `boiler.ts` or `boiler.js` file:

```ts
import {
  SetupBoiler,
  PromptBoiler,
  InstallBoiler,
  TeardownBoiler,
} from "boiler-dev"

export const setupBoiler: SetupBoiler = async ({
  destDir,
  files,
}) => {}

export const promptBoiler: PromptBoiler = async ({
  destDir,
  files,
}) => {
  const prompts = []
  return prompts
}

export const installBoiler: InstallBoiler = async ({
  answers,
  destDir,
  files,
}) => {
  const actions = []
  return actions
}

export const teardownBoiler: TeardownBoiler = async ({
  answers,
  destDir,
  files,
}) => {}
```

### Prompts

The `promptBoiler` function returns an array of "prompts" that define user input to retrieve.

Prompts are just an array of [Inquirer.js Questions](https://github.com/SBoudrias/Inquirer.js/#objects).

### Actions

The `installBoiler` function returns an array of "actions" necessary to install the boilerplate.

Actions are merely a convenience; feel free to run your own async code within `installBoiler` and return nothing.

#### Write file action

```ts
actions.push({
  action: "write",
  path: "hi.txt",
  source: "hi!",
})
```

#### Write binary

```ts
actions.push({
  action: "write",
  path: "bin/hi",
  source: "#!/usr/bin/env node",
  bin: true,
})
```

> ℹ️ The `bin` option sets `chmod +x` on the file.

#### Merge JSON

```ts
actions.push({
  action: "merge",
  path: "package.json",
  source: { hi: true },
})
```

> ℹ️ This action uses [deepmerge](https://github.com/TehShrike/deepmerge).

#### Install NPM packages

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

This is a shortcut for manually installing these boilerplate projects:

- [package-json-boiler](https://github.com/boiler-dev/package-json-boiler)
- [ts-boiler](https://github.com/boiler-dev/ts-boiler)
- [eslint-prettier-ts-boiler](https://github.com/boiler-dev/eslint-prettier-ts-boiler)
- [release-boiler](https://github.com/boiler-dev/release-boiler)
