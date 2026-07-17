"use server";
import { revalidatePath } from "next/cache";
import type { Data as PuckData } from "@measured/puck";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { slugify } from "@/lib/cms/slug";
import { detectRasterImage } from "@/lib/cms/image-signature";

const EMPTY: PuckData = { root: { props: {} }, content: [] };
const ASSET_BUCKET = "site-assets";
const MAX_IMAGE_BYTES = 10 * 1024 * 1024;
const MAX_VERSIONS_PER_SLUG = 50;

export type PageVersion = {
  id: string;
  slug: string;
  title: string;
  createdAt: string;
  authorName: string | null;
};

export async function getPageDraft(slug: string): Promise<PuckData> {
  await requireStaff();
  const supabase = createAdminClient();
  const { data } = await supabase.from("pages").select("draft_data").eq("slug", slug).maybeSingle();
  return (data?.draft_data as PuckData) ?? EMPTY;
}

export async function savePageDraft(slug: string, data: PuckData): Promise<void> {
  const profile = await requireStaff();
  const supabase = createAdminClient();
  const { data: rows, error } = await supabase
    .from("pages")
    .update({ draft_data: data, updated_by: profile.userId })
    .eq("slug", slug)
    .select("id");
  if (error) throw new Error("Failed to save draft");
  if (!rows || rows.length === 0) throw new Error(`Page not found: ${slug}`);
  revalidatePath(`/admin/pages/${slug}/edit`);
}

export async function publishPage(slug: string): Promise<void> {
  const profile = await requireStaff();
  const supabase = createAdminClient();
  const { data, error: readErr } = await supabase
    .from("pages").select("draft_data, title").eq("slug", slug).single();
  if (readErr || !data) throw new Error(`Page not found: ${slug}`);

  // Snapshot BEFORE publishing so a snapshot failure never leaves a page
  // silently live with no restore point.
  const { error: snapErr } = await supabase.from("page_versions").insert({
    slug,
    title: data.title,
    data: data.draft_data,
    created_by: profile.userId,
  });
  if (snapErr) throw new Error("Failed to record version history");

  const { error } = await supabase
    .from("pages")
    .update({ published_data: data.draft_data, updated_by: profile.userId })
    .eq("slug", slug);
  if (error) throw new Error("Failed to publish page");

  // Prune to the newest MAX_VERSIONS_PER_SLUG for this slug.
  const { data: keep, error: keepErr } = await supabase
    .from("page_versions").select("id").eq("slug", slug)
    .order("created_at", { ascending: false })
    .range(0, MAX_VERSIONS_PER_SLUG - 1);
  if (keepErr) throw new Error("Failed to prune version history");
  if (keep && keep.length >= MAX_VERSIONS_PER_SLUG) {
    const keepIds = keep.map((r) => r.id as string);
    await supabase.from("page_versions").delete().eq("slug", slug)
      .not("id", "in", `(${keepIds.join(",")})`);
  }

  revalidatePath(slug === "home" ? "/" : `/${slug}`);
}

export async function uploadSiteAsset(fd: FormData): Promise<{ url: string }> {
  await requireStaff();
  const file = fd.get("file") as File | null;
  if (!file || file.size === 0) throw new Error("No file provided");
  if (file.size > MAX_IMAGE_BYTES) throw new Error("Image too large (max 10 MB)");
  const bytes = new Uint8Array(await file.arrayBuffer());
  const detected = detectRasterImage(bytes);
  if (!detected) throw new Error("Unsupported image type (use PNG, JPEG, GIF, or WebP)");
  const supabase = createAdminClient();
  const base = slugify(file.name.replace(/\.[^.]*$/, "")) || "asset";
  const path = `${base}-${Date.now()}.${detected.ext}`;
  const { error } = await supabase.storage
    .from(ASSET_BUCKET)
    .upload(path, bytes, { contentType: detected.contentType, upsert: false });
  if (error) throw new Error("Failed to upload image");
  return { url: supabase.storage.from(ASSET_BUCKET).getPublicUrl(path).data.publicUrl };
}

export async function getPublishedPage(slug: string): Promise<PuckData | null> {
  const supabase = createAdminClient();
  const { data } = await supabase.from("pages").select("published_data").eq("slug", slug).maybeSingle();
  return (data?.published_data as PuckData) ?? null;
}

export async function listPageVersions(slug: string): Promise<PageVersion[]> {
  await requireStaff();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("page_versions")
    .select("id, slug, title, created_at, created_by")
    .eq("slug", slug)
    .order("created_at", { ascending: false });
  if (error) throw new Error("Failed to load version history");
  const rows = data ?? [];
  const ids = [...new Set(rows.map((r) => r.created_by).filter(Boolean))] as string[];
  const names = new Map<string, string>();
  if (ids.length > 0) {
    const { data: profs } = await supabase
      .from("profiles").select("id, full_name, email").in("id", ids);
    for (const p of profs ?? []) names.set(p.id as string, (p.full_name as string) || (p.email as string) || "");
  }
  return rows.map((r) => ({
    id: r.id as string,
    slug: r.slug as string,
    title: r.title as string,
    createdAt: r.created_at as string,
    authorName: r.created_by ? names.get(r.created_by as string) ?? null : null,
  }));
}

export async function restorePageVersion(id: string): Promise<{ slug: string }> {
  const profile = await requireStaff();
  const supabase = createAdminClient();
  const { data: version, error: readErr } = await supabase
    .from("page_versions").select("slug, data").eq("id", id).single();
  if (readErr || !version) throw new Error("Version not found");
  const { error } = await supabase
    .from("pages")
    .update({ draft_data: version.data, updated_by: profile.userId })
    .eq("slug", version.slug);
  if (error) throw new Error("Failed to restore version");
  revalidatePath(`/admin/pages/${version.slug}/edit`);
  return { slug: version.slug as string };
}
