import { test, expect, describe } from "bun:test";
import { isStaffSignupEmail, STAFF_SIGNUP_DOMAIN } from "../../src/lib/signup-domain";

describe("isStaffSignupEmail", () => {
  test("accepts @h2osu.org addresses", () => {
    expect(isStaffSignupEmail("dan.luk@h2osu.org")).toBe(true);
  });

  test("is case-insensitive and trims whitespace", () => {
    expect(isStaffSignupEmail("  Dan.Luk@H2OSU.ORG  ")).toBe(true);
  });

  test("rejects other domains", () => {
    expect(isStaffSignupEmail("someone@gmail.com")).toBe(false);
    expect(isStaffSignupEmail("someone@youversion.com")).toBe(false);
  });

  test("rejects look-alike domains that only contain the string", () => {
    expect(isStaffSignupEmail("attacker@h2osu.org.evil.com")).toBe(false);
    expect(isStaffSignupEmail("h2osu.org@gmail.com")).toBe(false);
  });

  test("domain constant is the church staff domain", () => {
    expect(STAFF_SIGNUP_DOMAIN).toBe("@h2osu.org");
  });
});
