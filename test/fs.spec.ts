import { join } from "path"
import expect from "./expect"
import fs from "../src/fs"

describe("fs", () => {
  it("should gather files", async () => {
    const srcDir = join(__dirname, "../src")
    const paths = await fs.nestedFiles(srcDir)
    expect(paths).toContain(join(srcDir, "index.ts"))
    expect(paths).toContain(join(srcDir, "cli/index.ts"))
  })
})
