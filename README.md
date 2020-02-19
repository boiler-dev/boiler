# boiler

Boilerplate framework 🥘

```bash
npm install -g boiler-dev
```

- Standardize & localize boilerplate development
- Save input prompt data for quick repeat installs
- Compile Typescript under same watch task as project (using [Project References](typescriptlang.org/docs/handbook/project-references.html))

## Boilerplate install flow

➊ — `cd` to your project  
➋ — `boiler install [git repo]`  
➌ — Boiler clones repo to `boilers/` and appends to `.gitignore`  
➍ — Boiler prompts for input and installs boilerplate (using `boiler.ts`)  
➎ — Boiler saves repo and input to `boiler.json`

## Boilerplate update flow

➊ — `cd` to your project  
➋ — `boiler update [boiler/my-boiler]`  
➌ — `boiler install [boiler/my-boiler]`

## Create boilerplate flow

➊ — `cd` to your project  
➋ — `boiler init boiler/my-boiler`  
➌ — Hack on `boiler/my-boiler/boiler.ts`  
➍ — `boiler install boiler/my-boiler`  
➎ — `boiler commit boiler/my-boiler "First commit"`

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
