# boiler

Boilerplate framework 🥘

```bash
npm install -g boiler-dev
```

# Features

- Standardize & localize boilerplate development
- Save input prompt data for quick repeat installs
- Compile Typescript under same watch task as project (using [Project References](typescriptlang.org/docs/handbook/project-references.html))

# Boilerplate install flow

⓪ `cd` to your project
① `boiler install [git repo]`
② Boiler clones repo to `boilers/` and appends to `.gitignore`
③ Boiler prompts for input and installs boilerplate (using `boiler.ts`)
④ Boiler saves repo and input to `boiler.json`

# Boilerplate update flow

⓪ `cd` to your project
① `boiler update [boiler/my-boiler]`
② `boiler install [boiler/my-boiler]`

# Create boilerplate flow

⓪ `cd` to your project
① `boiler init boiler/my-boiler`
② Hack on `boiler/my-boiler/boiler.ts`
③ `boiler install boiler/my-boiler`
④ `boiler commit boiler/my-boiler "First commit"`

# Start a new project

In addition to creating boilerplate projects, the `boiler init` command creates a new TypeScript project:

```bash
mkdir new-project
cd new-project

boiler init
```

New projects use the following boilerplate:

- [package-json-boiler](https://github.com/boiler-dev/package-json-boiler)
- [ts-boiler](https://github.com/boiler-dev/ts-boiler)
- [eslint-prettier-ts-boiler](https://github.com/boiler-dev/eslint-prettier-ts-boiler)
- [release-boiler](https://github.com/boiler-dev/release-boiler)
