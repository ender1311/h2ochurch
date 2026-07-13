"use server";

import { revalidatePath } from "next/cache";
import { requireAdmin } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";
import { siteUrl } from "@/lib/site";
import { sendEmail, inviteEmailHtml, isEmailConfigured } from "@/lib/email/resend";

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
  const redirectTo = `${siteUrl()}/account/set-password`;

  if (isEmailConfigured()) {
    // Generate the invite link ourselves and deliver it via Resend — full
    // control over the email, no Supabase SMTP configuration needed.
    const { data, error } = await supabase.auth.admin.generateLink({
      type: "invite",
      email,
      options: { redirectTo },
    });
    if (error) throw new Error(error.message);

    if (data.user) {
      await supabase.from("profiles").update({ role, email }).eq("id", data.user.id);
    }
    await sendEmail({
      to: email,
      subject: "You're invited to the H2O Hub",
      html: inviteEmailHtml(data.properties.action_link, role),
    });
  } else {
    // Fallback: Supabase's built-in (rate-limited) invite email.
    const { data, error } = await supabase.auth.admin.inviteUserByEmail(email, { redirectTo });
    if (error) throw new Error(error.message);
    if (data.user) {
      await supabase.from("profiles").update({ role, email }).eq("id", data.user.id);
    }
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
