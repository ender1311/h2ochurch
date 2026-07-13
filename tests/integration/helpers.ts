import { createClient, type SupabaseClient } from "@supabase/supabase-js";
import { readFileSync } from "node:fs";
import { join } from "node:path";

export const TEST_MARK = "zztest";

// Bun intentionally skips .env.local when NODE_ENV=test — load it ourselves so
// integration tests can reach the dev database.
(() => {
  if (process.env.SUPABASE_SERVICE_ROLE_KEY) return;
  try {
    const raw = readFileSync(join(import.meta.dir, "../../.env.local"), "utf8");
    for (const line of raw.split("\n")) {
      const m = line.match(/^([A-Z0-9_]+)="?([^"\n]*)"?$/);
      if (m && !process.env[m[1]]) process.env[m[1]] = m[2];
    }
  } catch {
    // No .env.local — tests will skip via hasDbEnv().
  }
})();

export function hasDbEnv(): boolean {
  return Boolean(
    (process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL) &&
      process.env.SUPABASE_SERVICE_ROLE_KEY,
  );
}

export function serviceClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  return createClient(url, process.env.SUPABASE_SERVICE_ROLE_KEY!, {
    auth: { persistSession: false },
  });
}

export function anonClient(): SupabaseClient {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL!;
  const key =
    process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY ?? process.env.NEXT_PUBLIC_SUPABASE_ANON_KEY!;
  return createClient(url, key, { auth: { persistSession: false } });
}

/** Remove every row this test run created (matched by the zztest marker). */
export async function cleanup(supabase: SupabaseClient) {
  await supabase.from("group_join_requests").delete().ilike("last_name", `%${TEST_MARK}%`);
  await supabase.from("event_registrations").delete().ilike("last_name", `%${TEST_MARK}%`);
  await supabase.from("events").delete().ilike("name", `%${TEST_MARK}%`);
  await supabase.from("people").delete().ilike("last_name", `%${TEST_MARK}%`);
  await supabase.from("groups").delete().ilike("name", `%${TEST_MARK}%`);
}
