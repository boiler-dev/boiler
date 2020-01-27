import expect from "./expect"
import { spawnTerminal } from "../src/spawnTerminal"

describe("spawnTerminal", () => {
  it("should spawnTerminal", async () => {
    expect(
      await spawnTerminal("echo", { args: ["hi"] })
    ).toEqual({ code: 0, out: "hi\r\n", signal: 0 })
  })
})
