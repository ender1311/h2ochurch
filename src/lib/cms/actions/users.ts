"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";

const ROLES = ["admin", "staff", "leader", "member"] as const;

function str(fd: FormData, key: string): string {
  return (fd.get(key) as string | null)?.trim() ?? "";
}

export async function inviteUser(fd: FormData) {
  await requireAdmin();
  const email = str(fd, "email").toLowerCase();
  const role = (ROLES as readonly string[]).includes(str(fd, "role")) ? str(fd, "role") : "staff";
  if (!email) throw new Error("Email is required");

  const supabase = createAdminClient();
  const { data, error } = await supabase.auth.admin.inviteUserByEmail(email);
  if (error) throw new Error(error.message);

  if (data.user) {
    await supabase.from("profiles").update({ role, email }).eq("id", data.user.id);
  }
  revalidatePath("/admin/settings/users");
}

export async function setUserRole(userId: string, fd: FormData) {
  await requireAdmin();
  const role = str(fd, "role");
  if (!(ROLES as readonly string[]).includes(role)) throw new Error("Invalid role");

  const supabase = createAdminClient();
  const { error } = await supabase.from("profiles").update({ role }).eq("id", userId);
  if (error) throw new Error(error.message);
  revalidatePath("/admin/settings/users");
}
