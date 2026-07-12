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
  return name.toLowerCase().replace(/[^a-z0-9]+/g, "-").replace(/^-+|-+$/g, "");
}

function eventPayload(fd: FormData) {
  const name = str(fd, "name");
  const dollars = nullable(fd, "cost");
  return {
    name,
    slug: nullable(fd, "slug") ?? (slugify(name) || null),
    description: nullable(fd, "description"),
    starts_at: nullable(fd, "starts_at"),
    ends_at: nullable(fd, "ends_at"),
    location: nullable(fd, "location"),
    capacity: nullable(fd, "capacity") ? Number(str(fd, "capacity")) : null,
    cost_cents: dollars ? Math.round(Number(dollars) * 100) : 0,
    registration_open: fd.get("registration_open") === "on" || fd.get("registration_open") === "true",
    visibility: nullable(fd, "visibility") ?? "listed",
  };
}

export async function createEvent(fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("events").insert(eventPayload(fd)).select("id").single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/events");
  redirect(`/admin/events/${data.id}`);
}

export async function updateEvent(id: string, fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("events").update(eventPayload(fd)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/events");
  revalidatePath(`/admin/events/${id}`);
  redirect(`/admin/events/${id}`);
}

export async function deleteEvent(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("events").delete().eq("id", id);
  revalidatePath("/admin/events");
  redirect("/admin/events");
}

export async function setRegistrationStatus(eventId: string, registrationId: string, status: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("event_registrations").update({ status }).eq("id", registrationId);
  revalidatePath(`/admin/events/${eventId}`);
}

/** Public: register for an event from the signup page. No auth required. */
export async function registerForEvent(eventId: string, slug: string, fd: FormData) {
  const supabase = createAdminClient();
  const first = str(fd, "first_name");
  const last = str(fd, "last_name");
  const email = nullable(fd, "email");
  if (!first || !last) throw new Error("Name is required");

  // Link to an existing person by email if we can.
  let personId: string | null = null;
  if (email) {
    const { data: person } = await supabase
      .from("people")
      .select("id")
      .eq("email", email.toLowerCase())
      .maybeSingle();
    personId = person?.id ?? null;
  }

  const { error } = await supabase.from("event_registrations").insert({
    event_id: eventId,
    person_id: personId,
    first_name: first,
    last_name: last,
    email: email?.toLowerCase() ?? null,
    phone: nullable(fd, "phone"),
    responses: { notes: str(fd, "notes") },
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/events/${eventId}`);
  redirect(`/events/${slug}?registered=1`);
}
