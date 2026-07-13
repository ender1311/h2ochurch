import { test, expect } from "bun:test";
import { upcomingBirthdays } from "../../src/lib/cms/birthdays";

const p = (id: string, birthdate: string | null) => ({
  id,
  first_name: id,
  last_name: "Test",
  birthdate,
});

test("includes birthdays within window, sorted soonest first", () => {
  const today = new Date(2026, 6, 12); // Jul 12 2026
  const out = upcomingBirthdays(
    [p("a", "2000-07-20"), p("b", "1999-07-13"), p("c", "2001-09-01")],
    30,
    today,
  );
  expect(out.map((x) => x.id)).toEqual(["b", "a"]);
  expect(out[0].turning).toBe(27);
});

test("includes today, excludes yesterday", () => {
  const today = new Date(2026, 6, 12);
  const out = upcomingBirthdays([p("today", "2000-07-12"), p("past", "2000-07-11")], 30, today);
  expect(out.map((x) => x.id)).toEqual(["today"]);
});

test("handles year wrap (late Dec window reaching Jan)", () => {
  const today = new Date(2026, 11, 20); // Dec 20 2026
  const out = upcomingBirthdays([p("jan", "2003-01-05"), p("dec", "2003-12-28")], 30, today);
  expect(out.map((x) => x.id)).toEqual(["dec", "jan"]);
  expect(out[1].nextBirthday.getFullYear()).toBe(2027);
});

test("skips null / malformed birthdates", () => {
  const today = new Date(2026, 6, 12);
  const out = upcomingBirthdays([p("none", null), p("bad", "not-a-date")], 30, today);
  expect(out).toEqual([]);
});

test("Feb 29 celebrated Mar 1 in non-leap years", () => {
  const today = new Date(2026, 1, 20); // Feb 20 2026 (non-leap)
  const out = upcomingBirthdays([p("leap", "2004-02-29")], 30, today);
  expect(out.length).toBe(1);
  expect(out[0].nextBirthday.getMonth()).toBe(2); // March
  expect(out[0].nextBirthday.getDate()).toBe(1);
});
