import { test, expect } from "bun:test";
import { slugify } from "../../src/lib/cms/slug";

test("slugifies names", () => {
  expect(slugify("Fall Retreat 2026")).toBe("fall-retreat-2026");
  expect(slugify("Monday Men's Bible Study")).toBe("monday-men-s-bible-study");
  expect(slugify("  --Weird   input!!  ")).toBe("weird-input");
  expect(slugify("")).toBe("");
  expect(slugify("!!!")).toBe("");
});
