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

function payload(fd: FormData) {
  return {
    title: str(fd, "title"),
    description: nullable(fd, "description"),
    starts_at: str(fd, "starts_at"),
    ends_at: nullable(fd, "ends_at"),
    all_day: fd.get("all_day") === "on" || fd.get("all_day") === "true",
    location: nullable(fd, "location"),
  };
}

export async function createCalendarEvent(fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("calendar_events").insert(payload(fd));
  if (error) throw new Error(error.message);
  revalidatePath("/admin/calendar");
  redirect("/admin/calendar");
}

export async function updateCalendarEvent(id: string, fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const { error } = await supabase.from("calendar_events").update(payload(fd)).eq("id", id);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/calendar");
  redirect("/admin/calendar");
}

export async function deleteCalendarEvent(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("calendar_events").delete().eq("id", id);
  revalidatePath("/admin/calendar");
  redirect("/admin/calendar");
}
