"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import {
  createJoinRequest,
  approveJoinRequest,
  declineJoinRequest,
} from "@/lib/cms/join-requests";
import { enforceRateLimit } from "@/lib/cms/rate-limit";

function str(fd: FormData, key: string, max = 2000): string {
  return ((fd.get(key) as string | null)?.trim() ?? "").slice(0, max);
}

/** Public: request to join a group from the /groups directory. */
export async function requestToJoin(groupId: string, fd: FormData) {
  await enforceRateLimit("join", 8, 3600);
  const firstName = str(fd, "first_name", 100);
  const lastName = str(fd, "last_name", 100);
  if (!firstName || !lastName) throw new Error("Name is required");
  const email = str(fd, "email", 200) || null;
  if (email && !/^[^@\s]+@[^@\s]+\.[^@\s]+$/.test(email)) throw new Error("Enter a valid email");

  const supabase = createAdminClient();
  // Only allow requests for real, publicly-listed groups.
  const { data: group } = await supabase
    .from("groups")
    .select("id")
    .eq("id", groupId)
    .eq("visibility", "listed")
    .maybeSingle();
  if (!group) throw new Error("Group not found");

  await createJoinRequest(supabase, {
    groupId,
    firstName,
    lastName,
    email,
    phone: str(fd, "phone", 40) || null,
    message: str(fd, "message", 2000) || null,
  });
  revalidatePath(`/admin/groups/${groupId}`);
  redirect(`/groups?requested=1`);
}

export async function approveRequest(groupId: string, requestId: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await approveJoinRequest(supabase, requestId);
  revalidatePath(`/admin/groups/${groupId}`);
  revalidatePath("/admin/people");
}

export async function declineRequest(groupId: string, requestId: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await declineJoinRequest(supabase, requestId);
  revalidatePath(`/admin/groups/${groupId}`);
}
