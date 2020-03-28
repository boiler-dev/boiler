import { join } from "path"
import expect from "./expect"
import files from "../src/files"

describe("files", () => {
  it("should gather files", async () => {
    const paths = await files.nestedFiles(__dirname)
    expect(paths).toContain(
      join(__dirname, "files.spec.ts")
    )
  })
})
