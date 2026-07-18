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

function personPayload(fd: FormData) {
  const tags = str(fd, "tags")
    .split(",")
    .map((t) => t.trim())
    .filter(Boolean);
  return {
    first_name: str(fd, "first_name"),
    last_name: str(fd, "last_name"),
    email: nullable(fd, "email")?.toLowerCase() ?? null,
    phone: nullable(fd, "phone"),
    status: nullable(fd, "status") ?? "active",
    campus: nullable(fd, "campus"),
    address: nullable(fd, "address"),
    birthdate: nullable(fd, "birthdate"),
    household_id: nullable(fd, "household_id"),
    notes: nullable(fd, "notes"),
    tags,
  };
}

export async function createPerson(fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("people")
    .insert(personPayload(fd))
    .select("id")
    .single();
  if (error) throw new Error("Could not save changes");
  revalidatePath("/admin/people");
  redirect(`/admin/people/${data.id}`);
}

export async function updatePerson(id: string, fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("people").update(personPayload(fd)).eq("id", id);
  if (error) throw new Error("Could not save changes");
  revalidatePath("/admin/people");
  revalidatePath(`/admin/people/${id}`);
  redirect(`/admin/people/${id}`);
}

export async function deletePerson(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("people").delete().eq("id", id);
  if (error) throw new Error("Could not save changes");
  revalidatePath("/admin/people");
  redirect("/admin/people");
}

export async function createHousehold(fd: FormData) {
  await requireStaff();
  const name = str(fd, "name");
  if (!name) return;
  const supabase = createAdminClient();
  const { error } = await supabase.from("households").insert({ name });
  if (error) throw new Error("Could not save changes");
  revalidatePath("/admin/people/households");
}

export async function deleteHousehold(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("households").delete().eq("id", id);
  revalidatePath("/admin/people/households");
}

export async function createFieldDefinition(fd: FormData) {
  await requireStaff();
  const label = str(fd, "label");
  if (!label) return;
  const key = label.toLowerCase().replace(/[^a-z0-9]+/g, "_").replace(/^_+|_+$/g, "");
  const kind = str(fd, "kind") || "text";
  const supabase = createAdminClient();
  const { error } = await supabase
    .from("field_definitions")
    .upsert({ key, label, kind }, { onConflict: "key" });
  if (error) throw new Error("Could not save changes");
  revalidatePath("/admin/settings/fields");
}

export async function deleteFieldDefinition(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("field_definitions").delete().eq("id", id);
  revalidatePath("/admin/settings/fields");
}

/** Form-friendly wrapper: save one custom field value from a person page form. */
export async function saveCustomField(personId: string, fieldId: string, fd: FormData) {
  await setPersonCustomField(personId, fieldId, str(fd, "value"));
}

export async function setPersonCustomField(personId: string, fieldId: string, value: string) {
  await requireStaff();
  const supabase = createAdminClient();
  const clean = value.trim();
  if (!clean) {
    await supabase
      .from("person_field_values")
      .delete()
      .eq("person_id", personId)
      .eq("field_id", fieldId);
  } else {
    await supabase
      .from("person_field_values")
      .upsert(
        { person_id: personId, field_id: fieldId, value: clean },
        { onConflict: "person_id,field_id" },
      );
  }
  revalidatePath(`/admin/people/${personId}`);
}
