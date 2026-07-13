import { test, expect, describe, afterAll } from "bun:test";
import { hasDbEnv, serviceClient, cleanup, TEST_MARK } from "./helpers";

describe.skipIf(!hasDbEnv())("database constraints", () => {
  const supabase = serviceClient();

  afterAll(async () => {
    await cleanup(supabase);
  });

  test("membership is unique per (group, person); upsert is idempotent", async () => {
    const { data: group } = await supabase
      .from("groups")
      .insert({ name: `Constraint Group ${TEST_MARK}` })
      .select("id")
      .single();
    const { data: person } = await supabase
      .from("people")
      .insert({ first_name: "Cass", last_name: `Cade ${TEST_MARK}` })
      .select("id")
      .single();

    const membership = { group_id: group!.id, person_id: person!.id };
    await supabase.from("group_memberships").upsert(membership, { onConflict: "group_id,person_id" });
    await supabase.from("group_memberships").upsert(membership, { onConflict: "group_id,person_id" });

    const { count } = await supabase
      .from("group_memberships")
      .select("*", { count: "exact", head: true })
      .eq("group_id", group!.id);
    expect(count).toBe(1);

    // Plain duplicate insert must violate the unique constraint.
    const { error } = await supabase.from("group_memberships").insert(membership);
    expect(error).toBeTruthy();
  });

  test("deleting a group cascades memberships but keeps people", async () => {
    const { data: group } = await supabase
      .from("groups")
      .insert({ name: `Cascade Group ${TEST_MARK}` })
      .select("id")
      .single();
    const { data: person } = await supabase
      .from("people")
      .insert({ first_name: "Kept", last_name: `Person ${TEST_MARK}` })
      .select("id")
      .single();
    await supabase.from("group_memberships").insert({ group_id: group!.id, person_id: person!.id });

    await supabase.from("groups").delete().eq("id", group!.id);

    const { count: memberships } = await supabase
      .from("group_memberships")
      .select("*", { count: "exact", head: true })
      .eq("person_id", person!.id);
    expect(memberships).toBe(0);

    const { data: kept } = await supabase.from("people").select("id").eq("id", person!.id).single();
    expect(kept?.id).toBe(person!.id);
  });

  test("people email is unique case-insensitively", async () => {
    const email = `dupe-${Date.now()}@${TEST_MARK}.example.com`;
    const { error: first } = await supabase
      .from("people")
      .insert({ first_name: "A", last_name: `Dupe ${TEST_MARK}`, email });
    expect(first).toBeNull();

    const { error: second } = await supabase
      .from("people")
      .insert({ first_name: "B", last_name: `Dupe ${TEST_MARK}`, email: email.toUpperCase() });
    expect(second).toBeTruthy();
  });

  test("event registrations cascade when the event is deleted", async () => {
    const { data: event } = await supabase
      .from("events")
      .insert({ name: `Cascade Event ${TEST_MARK}` })
      .select("id")
      .single();
    await supabase.from("event_registrations").insert({
      event_id: event!.id,
      first_name: "Reg",
      last_name: `Gone ${TEST_MARK}`,
    });

    await supabase.from("events").delete().eq("id", event!.id);

    const { count } = await supabase
      .from("event_registrations")
      .select("*", { count: "exact", head: true })
      .eq("event_id", event!.id);
    expect(count).toBe(0);
  });
});
