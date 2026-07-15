"use server";

import { createClient } from "@/utils/supabase/server";
import { isStaffSignupEmail, STAFF_SIGNUP_DOMAIN } from "@/lib/signup-domain";

export type AuthActionState = { error?: string; ok?: boolean };

function siteUrl(): string {
  return process.env.NEXT_PUBLIC_SITE_URL ?? "https://h2ochurch.vercel.app";
}

function str(fd: FormData, key: string): string {
  return (fd.get(key) as string | null)?.trim() ?? "";
}

/**
 * Self-serve signup, restricted to @h2osu.org. New accounts are granted the
 * `staff` role by the auth trigger (see 20260714000000_auth_domain_signup.sql).
 * The domain check here is authoritative — it cannot be bypassed by the form.
 */
export async function signUpStaff(_prev: AuthActionState, fd: FormData): Promise<AuthActionState> {
  const fullName = str(fd, "full_name");
  const email = str(fd, "email").toLowerCase();
  const password = str(fd, "password");

  if (!fullName) return { error: "Please enter your name." };
  if (!isStaffSignupEmail(email)) {
    return { error: `Accounts are limited to ${STAFF_SIGNUP_DOMAIN} email addresses.` };
  }
  if (password.length < 8) return { error: "Password must be at least 8 characters." };

  const supabase = await createClient();
  const { error } = await supabase.auth.signUp({
    email,
    password,
    options: { data: { full_name: fullName }, emailRedirectTo: `${siteUrl()}/admin` },
  });
  if (error) return { error: error.message };

  return { ok: true };
}

/**
 * Send a password-reset link. Always reports success to avoid leaking whether
 * an account exists. The link lands on /account/set-password.
 */
export async function requestPasswordReset(
  _prev: AuthActionState,
  fd: FormData,
): Promise<AuthActionState> {
  const email = str(fd, "email").toLowerCase();
  if (!email) return { error: "Please enter your email." };

  const supabase = await createClient();
  await supabase.auth.resetPasswordForEmail(email, {
    redirectTo: `${siteUrl()}/account/set-password`,
  });

  return { ok: true };
}
