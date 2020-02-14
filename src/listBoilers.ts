import { join } from "path"
import { readdir, stat } from "fs-extra"

export default async function listBoilers(
  path: string
): Promise<string[]> {
  path = join(path, "boiler")

  return (await readdir(path))
    .filter(async f =>
      (await stat(join(path, f))).isDirectory()
    )
    .map(path => join("boiler", path))
}
