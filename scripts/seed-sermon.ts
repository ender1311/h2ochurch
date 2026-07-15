/**
 * Seed one published sample sermon (uploads local audio to the sermons bucket).
 *
 *   bun scripts/seed-sermon.ts <path-to-audio>
 *
 * Idempotent: skips if a sermon with the same title already exists.
 */
import { readFileSync } from "node:fs";
import { createClient } from "@supabase/supabase-js";

const audioPath = process.argv[2] ?? "/tmp/sample-sermon.mp3";
const TITLE = "Grace That Moves Us (Sample)";

const url = process.env.SUPABASE_URL ?? process.env.NEXT_PUBLIC_SUPABASE_URL;
const key = process.env.SUPABASE_SERVICE_ROLE_KEY;
if (!url || !key) {
  console.error("Missing SUPABASE_URL or SUPABASE_SERVICE_ROLE_KEY.");
  process.exit(1);
}
const sb = createClient(url, key, { auth: { persistSession: false } });

const { data: existing } = await sb.from("sermons").select("id").eq("title", TITLE).maybeSingle();
if (existing) {
  console.log(`Sermon "${TITLE}" already exists (${existing.id}) — nothing to do.`);
  process.exit(0);
}

const file = readFileSync(audioPath);
const objectPath = `grace-that-moves-us-sample-${Date.now()}.mp3`;
const { error: upErr } = await sb.storage
  .from("sermons")
  .upload(objectPath, file, { contentType: "audio/mpeg", upsert: true });
if (upErr) {
  console.error("Upload failed:", upErr.message);
  process.exit(1);
}
const audioUrl = sb.storage.from("sermons").getPublicUrl(objectPath).data.publicUrl;

const { data, error } = await sb
  .from("sermons")
  .insert({
    title: TITLE,
    speaker: "H2O Teaching Team",
    series: "The Real Gospel",
    scripture: "Romans 1:1–17",
    description:
      "A sample message from our walk through Romans — grace isn't something we earn, it's the mercy that moves us on mission. (Placeholder audio; replace with a real recording from the Hub.)",
    audio_url: audioUrl,
    preached_on: "2026-07-13",
    published: true,
  })
  .select("id")
  .single();

if (error) {
  console.error("Insert failed:", error.message);
  process.exit(1);
}
console.log(`✓ Published sermon "${TITLE}" (${data.id})`);
console.log(`  audio: ${audioUrl}`);
