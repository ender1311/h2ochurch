import { test, expect, describe, afterAll } from "bun:test";
import { hasDbEnv, serviceClient, cleanup, TEST_MARK } from "./helpers";
import { importPeopleGroups } from "../../src/lib/cms/csv";

describe.skipIf(!hasDbEnv())("CSV import (real database)", () => {
  const supabase = serviceClient();
  const stamp = Date.now();

  const csv = [
    "First Name,Last Name,Email Address,Phone Number,Groups",
    `Ava,Import ${TEST_MARK},ava-${stamp}@${TEST_MARK}.example.com,(614) 555-0001,Import Group A ${TEST_MARK}`,
    `Bo,Import ${TEST_MARK},bo-${stamp}@${TEST_MARK}.example.com,(614) 555-0002,"Import Group A ${TEST_MARK} | Import Group B ${TEST_MARK}"`,
    `Cy,NoEmail ${TEST_MARK},,,Import Group B ${TEST_MARK}`,
  ].join("\n");

  afterAll(async () => {
    await supabase.from("people").delete().ilike("last_name", `%${TEST_MARK}%`);
    await supabase.from("groups").delete().ilike("name", `%${TEST_MARK}%`);
    await cleanup(supabase);
  });

  test("dry run counts without writing", async () => {
    const result = await importPeopleGroups(supabase, csv, { dryRun: true });
    expect(result.parsedRows).toBe(3);
    expect(result.peopleCreated).toBe(3);
    expect(result.groupsCreated).toBe(2);

    const { count } = await supabase
      .from("people")
      .select("*", { count: "exact", head: true })
      .ilike("last_name", `%${TEST_MARK}%`);
    expect(count).toBe(0);
  });

  test("real import creates people, groups, and memberships", async () => {
    const result = await importPeopleGroups(supabase, csv);
    expect(result.peopleCreated).toBe(3);
    expect(result.groupsCreated).toBe(2);
    expect(result.membershipsCreated).toBe(4); // Ava:1 + Bo:2 + Cy:1
  });

  test("re-import is fully idempotent (email + name matching)", async () => {
    const result = await importPeopleGroups(supabase, csv);
    expect(result.peopleCreated).toBe(0);
    expect(result.peopleMatched).toBe(3);
    expect(result.groupsCreated).toBe(0);
    expect(result.membershipsCreated).toBe(0);
  });
});
