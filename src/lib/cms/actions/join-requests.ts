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

function str(fd: FormData, key: string): string {
  return (fd.get(key) as string | null)?.trim() ?? "";
}

/** Public: request to join a group from the /groups directory. */
export async function requestToJoin(groupId: string, fd: FormData) {
  const firstName = str(fd, "first_name");
  const lastName = str(fd, "last_name");
  if (!firstName || !lastName) throw new Error("Name is required");

  const supabase = createAdminClient();
  await createJoinRequest(supabase, {
    groupId,
    firstName,
    lastName,
    email: str(fd, "email") || null,
    phone: str(fd, "phone") || null,
    message: str(fd, "message") || null,
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
