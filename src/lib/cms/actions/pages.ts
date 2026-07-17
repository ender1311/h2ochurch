"use server";
import { revalidatePath } from "next/cache";
import type { Data as PuckData } from "@measured/puck";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { slugify } from "@/lib/cms/slug";

const EMPTY: PuckData = { root: { props: {} }, content: [] };
const ASSET_BUCKET = "site-assets";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;

export async function getPageDraft(slug: string): Promise<PuckData> {
  await requireStaff();
  const supabase = createAdminClient();
  const { data } = await supabase.from("pages").select("draft_data").eq("slug", slug).maybeSingle();
  return (data?.draft_data as PuckData) ?? EMPTY;
}

export async function savePageDraft(slug: string, data: PuckData): Promise<void> {
  const profile = await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("pages")
    .update({ draft_data: data, updated_by: profile.userId })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/pages/${slug}/edit`);
}

export async function publishPage(slug: string): Promise<void> {
  const profile = await requireStaff();
  const supabase = createAdminClient();
  const { data } = await supabase.from("pages").select("draft_data").eq("slug", slug).single();
  const { error } = await supabase
    .from("pages")
    .update({ published_data: data?.draft_data ?? EMPTY, updated_by: profile.userId })
    .eq("slug", slug);
  if (error) throw new Error(error.message);
  revalidatePath(slug === "home" ? "/" : `/${slug}`);
}

export async function uploadSiteAsset(fd: FormData): Promise<{ url: string }> {
  await requireStaff();
  const file = fd.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file provided");
  if (!file.type.startsWith("image/")) throw new Error("Asset must be an image");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image too large (max 10 MB)");
  const supabase = createAdminClient();
  const ext = (file.name.split(".").pop() ?? "png").toLowerCase().replace(/[^a-z0-9]/g, "") || "png";
  const path = `${slugify(file.name) || "asset"}-${Date.now()}.${ext}`;
  const { error } = await supabase.storage.from(ASSET_BUCKET).upload(path, file, { contentType: file.type, upsert: false });
  if (error) throw new Error(error.message);
  return { url: supabase.storage.from(ASSET_BUCKET).getPublicUrl(path).data.publicUrl };
}

export async function getPublishedPage(slug: string): Promise<PuckData | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("pages").select("published_data").eq("slug", slug).maybeSingle();
  return (data?.published_data as PuckData) ?? null;
}
