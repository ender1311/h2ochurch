import { test, expect, describe } from "bun:test";
import { hasDbEnv, anonClient } from "./helpers";

// PII lockdown: no table may be readable through the public Data API with the
// publishable (anon) key. The app only reads server-side via the service role.
const TABLES = [
  "people",
  "groups",
  "group_memberships",
  "group_join_requests",
  "events",
  "event_registrations",
  "donations",
  "funds",
  "checkins",
  "checkin_sessions",
  "calendar_events",
  "households",
  "profiles",
  "songs",
  "teams",
  "team_members",
  "service_plans",
  "plan_items",
  "plan_assignments",
];

describe.skipIf(!hasDbEnv())("RLS lockdown (anon key)", () => {
  for (const table of TABLES) {
    test(`anon cannot read ${table}`, async () => {
      const supabase = anonClient();
      const { data, error } = await supabase.from(table).select("*").limit(1);
      // Either PostgREST rejects the request outright or RLS yields zero rows.
      if (error) {
        expect(error).toBeTruthy();
      } else {
        expect(data).toEqual([]);
      }
    });
  }

  test("anon cannot insert into people", async () => {
    const supabase = anonClient();
    const { error } = await supabase
      .from("people")
      .insert({ first_name: "Nope", last_name: "Nope" });
    expect(error).toBeTruthy();
  });
});
