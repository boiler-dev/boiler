# boiler

Boilerplate framework 🥘

```bash
npm install -g boiler-dev
```

- Standardize & localize boilerplate development
- Save input prompt data for quick repeat installs
- Compile Typescript under same watch task as project (using [Project References](typescriptlang.org/docs/handbook/project-references.html))

## Boilerplate install flow

1. `cd` to your project
2. `boiler install [git repo]`
3. Boiler clones repo to `boilers/` and appends to `.gitignore`
4. Boiler prompts for input and installs boilerplate (using `boiler.ts`)
5. Boiler saves repo and input to `boiler.json`

## Boilerplate update flow

1. `cd` to your project
2. `boiler update [boiler/my-boiler]`
3. `boiler install [boiler/my-boiler]`

## Create boilerplate flow

1. `cd` to your project
2. `boiler init boiler/my-boiler`
3. Hack on `boiler/my-boiler/boiler.ts`
4. `boiler install boiler/my-boiler`
5. `boiler commit boiler/my-boiler "First commit"`

## Initialize a TypeScript project

When not used within a `boiler/` directory, the `boiler init` command creates a new TypeScript project with great defaults:

```bash
mkdir new-project
cd new-project

boiler init
```

New projects include the following boilerplate:

- [package-json-boiler](https://github.com/boiler-dev/package-json-boiler)
- [ts-boiler](https://github.com/boiler-dev/ts-boiler)
- [eslint-prettier-ts-boiler](https://github.com/boiler-dev/eslint-prettier-ts-boiler)
- [release-boiler](https://github.com/boiler-dev/release-boiler)
