import { test, expect, describe, afterAll } from "bun:test";
import { hasDbEnv, serviceClient, TEST_MARK } from "./helpers";
import { swapPositions, type Positioned } from "../../src/lib/cms/plan-items";

describe.skipIf(!hasDbEnv())("services module (real database)", () => {
  const supabase = serviceClient();

  afterAll(async () => {
    await supabase.from("service_plans").delete().ilike("title", `%${TEST_MARK}%`);
    await supabase.from("songs").delete().ilike("title", `%${TEST_MARK}%`);
    await supabase.from("teams").delete().ilike("name", `%${TEST_MARK}%`);
    await supabase.from("people").delete().ilike("last_name", `%${TEST_MARK}%`);
  });

  test("run sheet reorder persists via swapPositions", async () => {
    const { data: plan } = await supabase
      .from("service_plans")
      .insert({ service_date: "2026-08-02", title: `Reorder Plan ${TEST_MARK}` })
      .select("id")
      .single();

    await supabase.from("plan_items").insert([
      { plan_id: plan!.id, position: 1, kind: "song", title: "Opener" },
      { plan_id: plan!.id, position: 2, kind: "sermon", title: "Message" },
      { plan_id: plan!.id, position: 3, kind: "song", title: "Closer" },
    ]);

    const { data: items } = await supabase
      .from("plan_items")
      .select("id, position, title")
      .eq("plan_id", plan!.id);
    const closer = items!.find((i) => i.title === "Closer")!;

    for (const u of swapPositions(items as Positioned[], closer.id, "up")) {
      await supabase.from("plan_items").update({ position: u.position }).eq("id", u.id);
    }

    const { data: after } = await supabase
      .from("plan_items")
      .select("title")
      .eq("plan_id", plan!.id)
      .order("position");
    expect(after!.map((i) => i.title)).toEqual(["Opener", "Closer", "Message"]);
  });

  test("deleting a plan cascades items and assignments; songs survive", async () => {
    const { data: song } = await supabase
      .from("songs")
      .insert({ title: `Living Water ${TEST_MARK}`, default_key: "G" })
      .select("id")
      .single();
    const { data: person } = await supabase
      .from("people")
      .insert({ first_name: "Vox", last_name: `Singer ${TEST_MARK}` })
      .select("id")
      .single();
    const { data: plan } = await supabase
      .from("service_plans")
      .insert({ service_date: "2026-08-09", title: `Cascade Plan ${TEST_MARK}` })
      .select("id")
      .single();

    await supabase.from("plan_items").insert({
      plan_id: plan!.id,
      position: 1,
      kind: "song",
      song_id: song!.id,
      title: `Living Water ${TEST_MARK}`,
    });
    await supabase.from("plan_assignments").insert({
      plan_id: plan!.id,
      person_id: person!.id,
      role: "Vocals",
    });

    await supabase.from("service_plans").delete().eq("id", plan!.id);

    const { count: itemCount } = await supabase
      .from("plan_items")
      .select("*", { count: "exact", head: true })
      .eq("plan_id", plan!.id);
    const { count: assignCount } = await supabase
      .from("plan_assignments")
      .select("*", { count: "exact", head: true })
      .eq("plan_id", plan!.id);
    expect(itemCount).toBe(0);
    expect(assignCount).toBe(0);

    const { data: keptSong } = await supabase.from("songs").select("id").eq("id", song!.id).single();
    expect(keptSong?.id).toBe(song!.id);
  });

  test("a person can hold one role per plan; different roles allowed", async () => {
    const { data: person } = await supabase
      .from("people")
      .insert({ first_name: "Multi", last_name: `Role ${TEST_MARK}` })
      .select("id")
      .single();
    const { data: plan } = await supabase
      .from("service_plans")
      .insert({ service_date: "2026-08-16", title: `Roles Plan ${TEST_MARK}` })
      .select("id")
      .single();

    const base = { plan_id: plan!.id, person_id: person!.id };
    const { error: first } = await supabase.from("plan_assignments").insert({ ...base, role: "Vocals" });
    expect(first).toBeNull();
    const { error: dupe } = await supabase.from("plan_assignments").insert({ ...base, role: "Vocals" });
    expect(dupe).toBeTruthy();
    const { error: second } = await supabase.from("plan_assignments").insert({ ...base, role: "Sound" });
    expect(second).toBeNull();
  });
});
