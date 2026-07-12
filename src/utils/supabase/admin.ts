import "server-only";
import { createClient } from "@supabase/supabase-js";

/**
 * Privileged, server-only Supabase client using the service-role key.
 * Bypasses RLS — never import this into a Client Component. The `server-only`
 * guard above throws at build time if it is ever pulled into the browser bundle.
 */
export function createAdminClient() {
  const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
  const serviceKey = process.env.SUPABASE_SERVICE_ROLE_KEY;

  if (!url || !serviceKey) {
    throw new Error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY");
  }

  return createClient(url, serviceKey, {
    auth: { persistSession: false, autoRefreshToken: false },
  });
}
