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

export async function createSession(fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const name = str(fd, "name");
  if (!name) return;
  const { data, error } = await supabase
    .from("checkin_sessions")
    .insert({
      name,
      group_id: nullable(fd, "group_id"),
      session_date: nullable(fd, "session_date") ?? undefined,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/checkins");
  redirect(`/admin/checkins/${data.id}`);
}

export async function checkIn(sessionId: string, personId: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase
    .from("checkins")
    .upsert({ session_id: sessionId, person_id: personId }, { onConflict: "session_id,person_id" });
  revalidatePath(`/admin/checkins/${sessionId}`);
}

export async function undoCheckIn(sessionId: string, personId: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("checkins").delete().eq("session_id", sessionId).eq("person_id", personId);
  revalidatePath(`/admin/checkins/${sessionId}`);
}

export async function deleteSession(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("checkin_sessions").delete().eq("id", id);
  revalidatePath("/admin/checkins");
  redirect("/admin/checkins");
}
