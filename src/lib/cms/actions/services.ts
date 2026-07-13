"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { swapPositions, nextPosition, type Positioned } from "@/lib/cms/plan-items";

function str(fd: FormData, key: string): string {
  return (fd.get(key) as string | null)?.trim() ?? "";
}
function nullable(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v.length ? v : null;
}

/* ── Songs ─────────────────────────────────────────────────────────── */
export async function createSong(fd: FormData) {
  await requireStaff();
  const title = str(fd, "title");
  if (!title) return;
  const supabase = createAdminClient();
  const { error } = await supabase.from("songs").insert({
    title,
    artist: nullable(fd, "artist"),
    ccli_number: nullable(fd, "ccli_number"),
    default_key: nullable(fd, "default_key"),
    bpm: nullable(fd, "bpm") ? Number(str(fd, "bpm")) : null,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/services/songs");
}

export async function deleteSong(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("songs").delete().eq("id", id);
  revalidatePath("/admin/services/songs");
}

/* ── Teams ─────────────────────────────────────────────────────────── */
export async function createTeam(fd: FormData) {
  await requireStaff();
  const name = str(fd, "name");
  if (!name) return;
  const supabase = createAdminClient();
  await supabase.from("teams").upsert({ name }, { onConflict: "name" });
  revalidatePath("/admin/services/teams");
}

export async function deleteTeam(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("teams").delete().eq("id", id);
  revalidatePath("/admin/services/teams");
}

export async function addTeamMember(teamId: string, fd: FormData) {
  await requireStaff();
  const personId = str(fd, "person_id");
  if (!personId) return;
  const supabase = createAdminClient();
  await supabase
    .from("team_members")
    .upsert(
      { team_id: teamId, person_id: personId, role: nullable(fd, "role") },
      { onConflict: "team_id,person_id" },
    );
  revalidatePath("/admin/services/teams");
}

export async function removeTeamMember(teamId: string, personId: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("team_members").delete().eq("team_id", teamId).eq("person_id", personId);
  revalidatePath("/admin/services/teams");
}

/* ── Service plans ─────────────────────────────────────────────────── */
export async function createPlan(fd: FormData) {
  await requireStaff();
  const serviceDate = str(fd, "service_date");
  if (!serviceDate) return;
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("service_plans")
    .insert({
      service_date: serviceDate,
      title: nullable(fd, "title") ?? "Sunday Gathering",
      notes: nullable(fd, "notes"),
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath("/admin/services");
  redirect(`/admin/services/${data.id}`);
}

export async function deletePlan(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("service_plans").delete().eq("id", id);
  revalidatePath("/admin/services");
  redirect("/admin/services");
}

/* ── Run sheet items ───────────────────────────────────────────────── */
export async function addPlanItem(planId: string, fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();

  const { data: existing } = await supabase
    .from("plan_items")
    .select("id, position")
    .eq("plan_id", planId);

  const songId = nullable(fd, "song_id");
  let title = nullable(fd, "title");
  let songKey = nullable(fd, "song_key");
  if (songId) {
    const { data: song } = await supabase
      .from("songs")
      .select("title, default_key")
      .eq("id", songId)
      .single();
    title = title ?? song?.title ?? null;
    songKey = songKey ?? song?.default_key ?? null;
  }

  const { error } = await supabase.from("plan_items").insert({
    plan_id: planId,
    position: nextPosition((existing ?? []) as Positioned[]),
    kind: nullable(fd, "kind") ?? (songId ? "song" : "other"),
    song_id: songId,
    title,
    song_key: songKey,
    length_minutes: nullable(fd, "length_minutes") ? Number(str(fd, "length_minutes")) : null,
    notes: nullable(fd, "notes"),
  });
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/services/${planId}`);
}

export async function movePlanItem(planId: string, itemId: string, direction: "up" | "down") {
  await requireStaff();
  const supabase = createAdminClient();
  const { data: items } = await supabase
    .from("plan_items")
    .select("id, position")
    .eq("plan_id", planId);

  const updates = swapPositions((items ?? []) as Positioned[], itemId, direction);
  for (const u of updates) {
    await supabase.from("plan_items").update({ position: u.position }).eq("id", u.id);
  }
  revalidatePath(`/admin/services/${planId}`);
}

export async function removePlanItem(planId: string, itemId: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("plan_items").delete().eq("id", itemId);
  revalidatePath(`/admin/services/${planId}`);
}

/* ── Assignments ───────────────────────────────────────────────────── */
export async function addAssignment(planId: string, fd: FormData) {
  await requireStaff();
  const personId = str(fd, "person_id");
  if (!personId) return;
  const supabase = createAdminClient();
  const { error } = await supabase.from("plan_assignments").upsert(
    {
      plan_id: planId,
      person_id: personId,
      team_id: nullable(fd, "team_id"),
      role: str(fd, "role"),
    },
    { onConflict: "plan_id,person_id,role" },
  );
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/services/${planId}`);
}

export async function setAssignmentStatus(planId: string, assignmentId: string, status: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("plan_assignments").update({ status }).eq("id", assignmentId);
  revalidatePath(`/admin/services/${planId}`);
}

export async function removeAssignment(planId: string, assignmentId: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("plan_assignments").delete().eq("id", assignmentId);
  revalidatePath(`/admin/services/${planId}`);
}
