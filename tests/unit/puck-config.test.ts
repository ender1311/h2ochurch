import { test, expect } from "bun:test";

test("config module imports", async () => {
  const mod = await import("../../src/lib/puck/config");
  expect(mod.config).toBeDefined();
  expect(mod.config.components).toBeDefined();
});
