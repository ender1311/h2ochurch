import { test, expect, describe, afterAll } from "bun:test";
import { hasDbEnv, serviceClient, TEST_MARK } from "./helpers";

describe.skipIf(!hasDbEnv())("register_for_event RPC (atomic capacity)", () => {
  const sb = serviceClient();
  const slug = `zz-${TEST_MARK}-cap-event`;

  afterAll(async () => {
    const { data } = await sb.from("events").select("id").eq("slug", slug);
    for (const e of data ?? []) {
      await sb.from("event_registrations").delete().eq("event_id", e.id);
    }
    await sb.from("events").delete().eq("slug", slug);
    await sb.from("rate_limits").delete().ilike("bucket", `%${TEST_MARK}%`);
  });

  test("enforces capacity: fills spots then waitlists, and blocks duplicate email", async () => {
    const { data: ev } = await sb
      .from("events")
      .insert({ name: `Cap ${TEST_MARK}`, slug, capacity: 2, cost_cents: 0, registration_open: true, visibility: "listed" })
      .select("id")
      .single();
    const eventId = ev!.id as string;

    const reg = (email: string) =>
      sb.rpc("register_for_event", {
        p_event_id: eventId, p_person_id: null,
        p_first_name: "A", p_last_name: TEST_MARK, p_email: email, p_phone: null, p_notes: "",
      });

    const r1 = await reg("a@zz.test");
    const r2 = await reg("b@zz.test");
    const r3 = await reg("c@zz.test");
    expect(r1.data![0].status).toBe("registered");
    expect(r2.data![0].status).toBe("registered");
    expect(r3.data![0].status).toBe("waitlisted"); // capacity 2 exceeded

    // Duplicate email is rejected.
    const dup = await reg("a@zz.test");
    expect(dup.error).toBeTruthy();
    expect(dup.error!.message).toContain("ALREADY_REGISTERED");
  });

  test("rejects closed / unlisted events", async () => {
    const closedSlug = `zz-${TEST_MARK}-closed`;
    const { data: ev } = await sb
      .from("events")
      .insert({ name: `Closed ${TEST_MARK}`, slug: closedSlug, cost_cents: 0, registration_open: false, visibility: "listed" })
      .select("id").single();
    const res = await sb.rpc("register_for_event", {
      p_event_id: ev!.id, p_person_id: null, p_first_name: "X", p_last_name: TEST_MARK,
      p_email: null, p_phone: null, p_notes: "",
    });
    expect(res.error?.message).toContain("REGISTRATION_CLOSED");
    await sb.from("event_registrations").delete().eq("event_id", ev!.id);
    await sb.from("events").delete().eq("id", ev!.id);
  });
});

describe.skipIf(!hasDbEnv())("rate_limit_hit RPC", () => {
  const sb = serviceClient();
  const key = `zz-${TEST_MARK}-rl-${Math.floor(Date.now())}`;

  afterAll(async () => {
    await sb.from("rate_limits").delete().ilike("bucket", `%${TEST_MARK}%`);
  });

  test("allows up to the limit then blocks within the window", async () => {
    const hit = () => sb.rpc("rate_limit_hit", { p_key: key, p_limit: 2, p_window_seconds: 60 });
    expect((await hit()).data).toBe(true);
    expect((await hit()).data).toBe(true);
    expect((await hit()).data).toBe(false);
  });
});
