"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { slugify } from "@/lib/cms/slug";
import { enforceRateLimit } from "@/lib/cms/rate-limit";

const MAX_TEXT = 2000;

function str(fd: FormData, key: string, max = MAX_TEXT): string {
  return ((fd.get(key) as string | null)?.trim() ?? "").slice(0, max);
}
function nullable(fd: FormData, key: string, max = MAX_TEXT): string | null {
  const v = str(fd, key, max);
  return v.length ? v : null;
}

function eventPayload(fd: FormData) {
  const name = str(fd, "name", 200);
  const capacityRaw = nullable(fd, "capacity", 12);
  let capacity: number | null = null;
  if (capacityRaw !== null) {
    const n = Number(capacityRaw);
    if (!Number.isInteger(n) || n <= 0) throw new Error("Capacity must be a positive whole number");
    capacity = n;
  }
  const dollars = nullable(fd, "cost", 12);
  let cost_cents = 0;
  if (dollars !== null) {
    const n = Number(dollars);
    if (!Number.isFinite(n) || n < 0) throw new Error("Cost must be a non-negative number");
    cost_cents = Math.round(n * 100);
  }
  return {
    name,
    slug: nullable(fd, "slug", 200) ?? (slugify(name) || null),
    description: nullable(fd, "description"),
    starts_at: nullable(fd, "starts_at"),
    ends_at: nullable(fd, "ends_at"),
    location: nullable(fd, "location", 300),
    capacity,
    cost_cents,
    registration_open: fd.get("registration_open") === "on" || fd.get("registration_open") === "true",
    visibility: nullable(fd, "visibility", 20) ?? "listed",
  };
}

export async function createEvent(fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const { data, error } = await supabase.from("events").insert(eventPayload(fd)).select("id").single();
  if (error) throw new Error("Could not save event");
  revalidatePath("/admin/events");
  redirect(`/admin/events/${data.id}`);
}

export async function updateEvent(id: string, fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("events").update(eventPayload(fd)).eq("id", id);
  if (error) throw new Error("Could not save event");
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

type RegisterResult = {
  registration_id: string;
  status: string;
  event_name: string;
  cost_cents: number;
};

/** Public: register for an event from the signup page. No auth required. */
export async function registerForEvent(eventId: string, slug: string, fd: FormData) {
  await enforceRateLimit("register", 8, 3600);
  const supabase = createAdminClient();
  const first = str(fd, "first_name", 100);
  const last = str(fd, "last_name", 100);
  const email = nullable(fd, "email", 200);
  if (!first || !last) throw new Error("Name is required");
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email");

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

  // Capacity check + insert happen atomically in one advisory-locked transaction
  // (register_for_event) so concurrent signups can't exceed capacity. The RPC
  // also re-checks visibility/open status and blocks duplicate emails.
  const { data, error } = await supabase.rpc("register_for_event", {
    p_event_id: eventId,
    p_person_id: personId,
    p_first_name: first,
    p_last_name: last,
    p_email: email?.toLowerCase() ?? null,
    p_phone: nullable(fd, "phone"),
    p_notes: str(fd, "notes"),
  });
  if (error) {
    const m = error.message ?? "";
    if (m.includes("EVENT_NOT_FOUND")) throw new Error("Event not found");
    if (m.includes("REGISTRATION_CLOSED")) throw new Error("Registration is closed");
    if (m.includes("ALREADY_REGISTERED")) throw new Error("You're already registered for this event");
    throw new Error("Registration failed");
  }
  const row = (Array.isArray(data) ? data[0] : data) as RegisterResult | undefined;
  if (!row) throw new Error("Registration failed");
  revalidatePath(`/admin/events/${eventId}`);

  // Paid event → hand off to Stripe Checkout (skipped for waitlist or when unconfigured).
  if (row.cost_cents > 0 && row.status === "registered") {
    const { startRegistrationCheckout } = await import("@/lib/payments/checkout");
    const url = await startRegistrationCheckout({
      registrationId: row.registration_id,
      eventName: row.event_name,
      slug,
      costCents: row.cost_cents,
      email: email?.toLowerCase() ?? null,
    });
    if (url) redirect(url);
  }

  redirect(`/events/${slug}?registered=${row.status === "waitlisted" ? "waitlist" : "1"}`);
}
