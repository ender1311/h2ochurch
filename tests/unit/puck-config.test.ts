import { test, expect } from "bun:test";

const COMPONENT_KEYS = [
  "Hero",
  "FeatureCards",
  "SermonBand",
  "CommunityCarousel",
  "SocialBand",
  "ConnectCTA",
] as const;

test("config module imports", async () => {
  const mod = await import("../../src/lib/puck/config");
  expect(mod.config).toBeDefined();
  expect(mod.config.components).toBeDefined();
});

test("config.components has all six homepage block keys", async () => {
  const { config } = await import("../../src/lib/puck/config");
  for (const key of COMPONENT_KEYS) {
    expect(config.components).toHaveProperty(key);
  }
});

test("every component has a render function and defaultProps", async () => {
  const { config } = await import("../../src/lib/puck/config");
  for (const key of COMPONENT_KEYS) {
    const component = config.components[key as keyof typeof config.components];
    expect(typeof component.render).toBe("function");
    expect(component.defaultProps).toBeDefined();
  }
});
