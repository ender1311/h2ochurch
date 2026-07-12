/**
 * Create (or promote) an admin user.
 *
 *   bun scripts/create-admin.ts <email> [password]
 *
 * If the user already exists, they are promoted to admin. If no password is
 * given, a strong one is generated and printed once.
 */
import { randomBytes } from "node:crypto";
import { createClient } from "@supabase/supabase-js";

const email = process.argv[2];
const password = process.argv[3] ?? `H2O-${randomBytes(9).toString("base64url")}`;

if (!email) {
  console.error("Usage: bun scripts/create-admin.ts <email> [password]");
  process.exit(1);
}

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });

let userId: string | undefined;

const { data: created, error } = await supabase.auth.admin.createUser({
  email,
  password,
  email_confirm: true,
});

if (error) {
  // Likely already exists — find them.
  const { data: list } = await supabase.auth.admin.listUsers();
  userId = list?.users.find((u) => u.email?.toLowerCase() === email.toLowerCase())?.id;
  if (!userId) {
    console.error("Could not create or find user:", error.message);
    process.exit(1);
  }
  console.log(`User already existed — promoting to admin (password unchanged).`);
} else {
  userId = created.user?.id;
  console.log(`Created user ${email}`);
  console.log(`Temporary password: ${password}`);
}

const { error: roleErr } = await supabase
  .from("profiles")
  .update({ role: "admin", email })
  .eq("id", userId);

if (roleErr) {
  console.error("Failed to set admin role:", roleErr.message);
  process.exit(1);
}

console.log(`✓ ${email} is now an admin.`);
