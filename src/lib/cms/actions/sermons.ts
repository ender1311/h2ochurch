"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { slugify } from "@/lib/cms/slug";

const AUDIO_BUCKET = "sermons";
const MAX_AUDIO_BYTES = 100 * 1024 * 1024; // 100 MB

function str(fd: FormData, key: string): string {
  return (fd.get(key) as string | null)?.trim() ?? "";
}
function nullable(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v.length ? v : null;
}

/** Upload an audio File to the public sermons bucket and return its public URL. */
async function uploadAudio(
  supabase: ReturnType<typeof createAdminClient>,
  file: File,
  title: string,
): Promise<string> {
  if (!file.type.startsWith("audio/")) {
    throw new Error("Audio must be an audio file (mp3, m4a, etc.).");
  }
  if (file.size > MAX_AUDIO_BYTES) {
    throw new Error("Audio file is too large (max 100 MB).");
  }
  const rawExt = file.name.includes(".") ? file.name.split(".").pop() : "mp3";
  const ext = (rawExt ?? "mp3").toLowerCase().replace(/[^a-z0-9]/g, "") || "mp3";
  const path = `${slugify(title) || "sermon"}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage
    .from(AUDIO_BUCKET)
    .upload(path, file, { contentType: file.type || "audio/mpeg", upsert: false });
  if (error) throw new Error(`Audio upload failed: ${error.message}`);
  return supabase.storage.from(AUDIO_BUCKET).getPublicUrl(path).data.publicUrl;
}

function sermonFields(fd: FormData) {
  return {
    title: str(fd, "title"),
    speaker: nullable(fd, "speaker"),
    series: nullable(fd, "series"),
    scripture: nullable(fd, "scripture"),
    description: nullable(fd, "description"),
    preached_on: nullable(fd, "preached_on"),
    published: fd.get("published") === "on" || fd.get("published") === "true",
  };
}

export async function createSermon(fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();

  const fields = sermonFields(fd);
  if (!fields.title) throw new Error("Title is required");

  // Audio comes from either an uploaded file or a pasted URL.
  const file = fd.get("audio") as File | null;
  let audioUrl = nullable(fd, "audio_url");
  if (file && file.size > 0) {
    audioUrl = await uploadAudio(supabase, file, fields.title);
  } else if (audioUrl && !/^https?:\/\//i.test(audioUrl)) {
    throw new Error("Audio URL must start with http:// or https://");
  }

  const { error } = await supabase.from("sermons").insert({ ...fields, audio_url: audioUrl });
  if (error) throw new Error(error.message);

  revalidatePath("/admin/sermons");
  revalidatePath("/sermons");
  redirect("/admin/sermons");
}

export async function setSermonPublished(id: string, published: boolean) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("sermons").update({ published }).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/sermons");
  revalidatePath("/sermons");
}

export async function deleteSermon(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("sermons").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/sermons");
  revalidatePath("/sermons");
  redirect("/admin/sermons");
}
