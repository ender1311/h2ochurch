import { test, expect } from "bun:test";
import { decideRegistrationStatus, spotsLeft } from "../../src/lib/cms/registration";

test("unlimited capacity always registers", () => {
  expect(decideRegistrationStatus(null, 0)).toBe("registered");
  expect(decideRegistrationStatus(null, 9999)).toBe("registered");
  expect(decideRegistrationStatus(0, 50)).toBe("registered");
});

test("registers while under capacity", () => {
  expect(decideRegistrationStatus(10, 0)).toBe("registered");
  expect(decideRegistrationStatus(10, 9)).toBe("registered");
});

test("waitlists at and beyond capacity", () => {
  expect(decideRegistrationStatus(10, 10)).toBe("waitlisted");
  expect(decideRegistrationStatus(10, 15)).toBe("waitlisted");
  expect(decideRegistrationStatus(1, 1)).toBe("waitlisted");
});

test("spotsLeft math", () => {
  expect(spotsLeft(null, 5)).toBeNull();
  expect(spotsLeft(0, 5)).toBeNull();
  expect(spotsLeft(10, 3)).toBe(7);
  expect(spotsLeft(10, 10)).toBe(0);
  expect(spotsLeft(10, 12)).toBe(0);
});
