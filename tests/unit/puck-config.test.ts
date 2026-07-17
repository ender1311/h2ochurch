import { test, expect } from "bun:test";

const HOMEPAGE_KEYS = [
  "Hero",
  "FeatureCards",
  "SermonBand",
  "CommunityCarousel",
  "SocialBand",
  "ConnectCTA",
] as const;

const GENERIC_KEYS = [
  "Heading",
  "Text",
  "Image",
  "Button",
  "Spacer",
  "Columns",
] as const;

const ABOUT_KEYS = [
  "WhoWeAreHero",
  "MissionStatement",
  "CoreValues",
] as const;

const ALL_KEYS = [...HOMEPAGE_KEYS, ...GENERIC_KEYS, ...ABOUT_KEYS] as const;

test("config module imports", async () => {
  const mod = await import("../../src/lib/puck/config");
  expect(mod.config).toBeDefined();
  expect(mod.config.components).toBeDefined();
});

test("config.components has all six homepage block keys", async () => {
  const { config } = await import("../../src/lib/puck/config");
  for (const key of HOMEPAGE_KEYS) {
    expect(config.components).toHaveProperty(key);
  }
});

test("config.components has all six generic content block keys", async () => {
  const { config } = await import("../../src/lib/puck/config");
  for (const key of GENERIC_KEYS) {
    expect(config.components).toHaveProperty(key);
  }
});

test("every component has a render function", async () => {
  const { config } = await import("../../src/lib/puck/config");
  for (const key of ALL_KEYS) {
    const component = config.components[key as keyof typeof config.components];
    expect(typeof component.render).toBe("function");
  }
});

test("every homepage component has defaultProps", async () => {
  const { config } = await import("../../src/lib/puck/config");
  for (const key of HOMEPAGE_KEYS) {
    const component = config.components[key as keyof typeof config.components];
    expect(component.defaultProps).toBeDefined();
  }
});

test("Heading defaultProps are sensible", async () => {
  const { config } = await import("../../src/lib/puck/config");
  const comp = config.components["Heading"];
  expect(comp.defaultProps).toBeDefined();
  expect((comp.defaultProps as Record<string, unknown>)["text"]).toBeTypeOf("string");
  expect((comp.defaultProps as Record<string, unknown>)["level"]).toMatch(/^h[123]$/);
  expect((comp.defaultProps as Record<string, unknown>)["align"]).toMatch(/^(left|center)$/);
});

test("Text defaultProps are sensible", async () => {
  const { config } = await import("../../src/lib/puck/config");
  const comp = config.components["Text"];
  expect(comp.defaultProps).toBeDefined();
  expect((comp.defaultProps as Record<string, unknown>)["text"]).toBeTypeOf("string");
  expect((comp.defaultProps as Record<string, unknown>)["align"]).toMatch(/^(left|center)$/);
});

test("Image defaultProps are sensible", async () => {
  const { config } = await import("../../src/lib/puck/config");
  const comp = config.components["Image"];
  expect(comp.defaultProps).toBeDefined();
  expect((comp.defaultProps as Record<string, unknown>)["alt"]).toBeTypeOf("string");
});

test("Button defaultProps are sensible", async () => {
  const { config } = await import("../../src/lib/puck/config");
  const comp = config.components["Button"];
  expect(comp.defaultProps).toBeDefined();
  expect((comp.defaultProps as Record<string, unknown>)["label"]).toBeTypeOf("string");
  expect((comp.defaultProps as Record<string, unknown>)["href"]).toBeTypeOf("string");
  expect((comp.defaultProps as Record<string, unknown>)["style"]).toMatch(/^(solid|outline)$/);
});

test("Spacer defaultProps are sensible", async () => {
  const { config } = await import("../../src/lib/puck/config");
  const comp = config.components["Spacer"];
  expect(comp.defaultProps).toBeDefined();
  expect((comp.defaultProps as Record<string, unknown>)["size"]).toMatch(/^(sm|md|lg)$/);
});

test("Columns defaultProps have slot arrays", async () => {
  const { config } = await import("../../src/lib/puck/config");
  const comp = config.components["Columns"];
  expect(comp.defaultProps).toBeDefined();
  expect(Array.isArray((comp.defaultProps as Record<string, unknown>)["left"])).toBe(true);
  expect(Array.isArray((comp.defaultProps as Record<string, unknown>)["right"])).toBe(true);
});

test("config has categories for Homepage and Content", async () => {
  const { config } = await import("../../src/lib/puck/config");
  expect(config.categories).toBeDefined();
  expect(config.categories).toHaveProperty("Homepage");
  expect(config.categories).toHaveProperty("Content");
});

test("Homepage category contains all homepage components", async () => {
  const { config } = await import("../../src/lib/puck/config");
  const homepageComponents = config.categories?.["Homepage"]?.components ?? [];
  for (const key of HOMEPAGE_KEYS) {
    expect(homepageComponents).toContain(key);
  }
});

test("Content category contains all generic components", async () => {
  const { config } = await import("../../src/lib/puck/config");
  const contentComponents = config.categories?.["Content"]?.components ?? [];
  for (const key of GENERIC_KEYS) {
    expect(contentComponents).toContain(key);
  }
});

test("config has About category", async () => {
  const { config } = await import("../../src/lib/puck/config");
  expect(config.categories).toHaveProperty("About");
});

test("About category contains all about components", async () => {
  const { config } = await import("../../src/lib/puck/config");
  const aboutComponents = config.categories?.["About"]?.components ?? [];
  for (const key of ABOUT_KEYS) {
    expect(aboutComponents).toContain(key);
  }
});

test("config.components has all about block keys", async () => {
  const { config } = await import("../../src/lib/puck/config");
  for (const key of ABOUT_KEYS) {
    expect(config.components).toHaveProperty(key);
  }
});

test("every about component has a render function and defaultProps", async () => {
  const { config } = await import("../../src/lib/puck/config");
  for (const key of ABOUT_KEYS) {
    const component = config.components[key as keyof typeof config.components];
    expect(typeof component.render).toBe("function");
    expect(component.defaultProps).toBeDefined();
  }
});

test("CoreValues defaultProps has values array with four items", async () => {
  const { config } = await import("../../src/lib/puck/config");
  const comp = config.components["CoreValues"];
  const dp = comp.defaultProps as Record<string, unknown>;
  expect(Array.isArray(dp["values"])).toBe(true);
  expect((dp["values"] as unknown[]).length).toBe(4);
});
