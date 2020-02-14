import { join } from "path"
import { pathExists } from "fs-extra"

export default async function boilerFromArg(
  destDir: string,
  repo: string
): Promise<string> {
  const nameMatch = repo.match(/([^\/.]+)\.*[git]*$/)
  if (!nameMatch) {
    console.error(
      "Argument should be a git repository or `boiler/[name]`."
    )
    process.exit(1)
  }
  const [, name] = nameMatch

  if (await pathExists(join(destDir, "boiler", name))) {
    return name
  }
}
