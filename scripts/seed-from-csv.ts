/**
 * Seed people + groups from a Planning Center-style CSV export.
 *
 *   bun scripts/seed-from-csv.ts <path-to-csv> [--dry-run]
 *
 * Env (auto-loaded by Bun from .env.local): SUPABASE_URL / NEXT_PUBLIC_SUPABASE_URL
 * and SUPABASE_SERVICE_ROLE_KEY.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";
import { importPeopleGroups } from "../src/lib/cms/csv";

const path = process.argv[2];
const dryRun = process.argv.includes("--dry-run");

if (!path) {
  console.error("Usage: bun scripts/seed-from-csv.ts <path-to-csv> [--dry-run]");
  process.exit(1);
}

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY in env.");
  process.exit(1);
}

const supabase = createClient(url, key, { auth: { persistSession: false } });
const csv = readFileSync(path, "utf8");

const result = await importPeopleGroups(supabase, csv, { dryRun });
console.log(dryRun ? "DRY RUN — no writes" : "IMPORT COMPLETE");
console.log(JSON.stringify(result, null, 2));
