import { test, expect } from "bun:test";
import { parsePeopleGroupsCsv, toCsv } from "../../src/lib/cms/csv";

test("parses people and splits pipe-delimited groups", () => {
  const csv = [
    "First Name,Last Name,Email Address,Phone Number,Groups",
    "Abigail,Worstell,worstell.21@osu.edu,(740) 336-3259,Wednesday Co-Ed Bible Study",
    'Jordan,Kim,jk@osu.edu,(614) 555-0100,"Tuesday Men\'s Bible Study | Thursday Men\'s Bible Study"',
  ].join("\n");

  const { rows } = parsePeopleGroupsCsv(csv);
  expect(rows.length).toBe(2);
  expect(rows[0].firstName).toBe("Abigail");
  expect(rows[0].groups).toEqual(["Wednesday Co-Ed Bible Study"]);
  expect(rows[1].groups).toEqual(["Tuesday Men's Bible Study", "Thursday Men's Bible Study"]);
});

test("tolerates header name variants and blank rows", () => {
  const csv = ["first_name,last_name,email,phone,groups", "Sam,Lee,sam@x.com,,", ""].join("\n");
  const { rows } = parsePeopleGroupsCsv(csv);
  expect(rows.length).toBe(1);
  expect(rows[0].email).toBe("sam@x.com");
  expect(rows[0].phone).toBeNull();
  expect(rows[0].groups).toEqual([]);
});

test("skips rows with no name and no email", () => {
  const csv = ["First Name,Last Name,Email Address,Phone Number,Groups", ",,,,SomeGroup"].join("\n");
  const { rows } = parsePeopleGroupsCsv(csv);
  expect(rows.length).toBe(0);
});

test("toCsv maps keys to labeled columns", () => {
  const csv = toCsv(
    [{ first_name: "Sam", last_name: "Lee", email: null }],
    [
      { key: "first_name", label: "First Name" },
      { key: "last_name", label: "Last Name" },
      { key: "email", label: "Email Address" },
    ],
  );
  const lines = csv.trim().split(/\r?\n/);
  expect(lines[0]).toBe("First Name,Last Name,Email Address");
  expect(lines[1]).toBe("Sam,Lee,");
});
