"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";

function str(fd: FormData, key: string): string {
  return (fd.get(key) as string | null)?.trim() ?? "";
}
function nullable(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v.length ? v : null;
}
function slugify(name: string): string {
  return name
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/^-+|-+$/g, "");
}

function groupPayload(fd: FormData) {
  const name = str(fd, "name");
  return {
    name,
    slug: nullable(fd, "slug") ?? (slugify(name) || null),
    description: nullable(fd, "description"),
    schedule: nullable(fd, "schedule"),
    location: nullable(fd, "location"),
    visibility: nullable(fd, "visibility") ?? "listed",
  };
}

export async function createGroup(fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("groups")
    .insert(groupPayload(fd))
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/groups");
  redirect(`/admin/groups/${data.id}`);
}

export async function updateGroup(id: string, fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("groups").update(groupPayload(fd)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/groups");
  revalidatePath(`/admin/groups/${id}`);
  redirect(`/admin/groups/${id}`);
}

export async function deleteGroup(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("groups").delete().eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/groups");
  redirect("/admin/groups");
}

export async function addMember(groupId: string, fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const personId = str(fd, "person_id");
  const role = nullable(fd, "role") ?? "member";
  if (!personId) return;
  const { error } = await supabase
    .from("group_memberships")
    .upsert({ group_id: groupId, person_id: personId, role }, { onConflict: "group_id,person_id" });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/groups/${groupId}`);
}

export async function removeMember(groupId: string, personId: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase
    .from("group_memberships")
    .delete()
    .eq("group_id", groupId)
    .eq("person_id", personId);
  revalidatePath(`/admin/groups/${groupId}`);
}

export async function setMemberRole(groupId: string, personId: string, role: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase
    .from("group_memberships")
    .update({ role })
    .eq("group_id", groupId)
    .eq("person_id", personId);
  revalidatePath(`/admin/groups/${groupId}`);
}
