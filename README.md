# boiler

Boilerplate framework 🥘

```bash
npm install -g boiler-dev
```

- Easy to hack on, clones boilerplate repos to gitignored `boiler/` directory within your project
- Shares single build/watch task with project using [TypeScript Project References](https://github.com/boiler-dev/boiler/blob/master/typescriptlang.org/docs/handbook/project-references.html)
- Doesn't leave a mark on final committed project code other than `boiler.json`
- Saves prompt inputs for quick repeat installs

## Install boilerplate from repo

1. `cd` to your project
2. `boiler install [git repo]`
3. Boiler clones repo to `boilers/` and appends to `.gitignore`
4. Boiler prompts for input and installs boilerplate (using `boilers/*/boiler.ts`)
5. Boiler saves repo and input to `boiler.json`

## Update boilerplate from repo

1. `cd` to your project
2. `boiler update [boiler/my-boiler]`
3. `boiler install [boiler/my-boiler]`

## Create new boilerplate

1. `cd` to your project
2. `boiler init boiler/my-boiler`

## Modify boilerplate

1. Hack on `boiler/my-boiler/boiler.ts`
2. `boiler install boiler/my-boiler`
3. `boiler commit boiler/my-boiler "First commit"`

## Initialize a TypeScript project

When not used within a `boiler/` directory, the `boiler init` command creates a new TypeScript project:

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
