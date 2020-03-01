import { join } from "path"
import expect from "./expect"
import files from "../src/files"

describe("files", () => {
  it("should gather files", async () => {
    const srcDir = join(__dirname, "../src")
    const paths = await files.nestedFiles(srcDir)
    expect(paths).toContain(join(srcDir, "index.ts"))
    expect(paths).toContain(join(srcDir, "cli.ts"))
  })
})
