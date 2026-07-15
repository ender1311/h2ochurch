import "server-only";
import { redirect } from "next/navigation";
import { createClient } from "@/utils/supabase/server";

export type Role = "admin" | "staff" | "leader" | "member";

export type SessionProfile = {
  userId: string;
  email: string | null;
  fullName: string;
  role: Role;
};

export async function getProfile(): Promise<SessionProfile | null> {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  if (!user) return null;

  const { data } = await supabase
    .from("profiles")
    .select("email, full_name, role")
    .eq("id", user.id)
    .single();
  if (!data) return null;

  return {
    userId: user.id,
    email: data.email,
    fullName: data.full_name ?? "",
    role: (data.role ?? "member") as Role,
  };
}

/** Ensure the caller is staff or admin. Redirects to login otherwise. */
export async function requireStaff(): Promise<SessionProfile> {
  const profile = await getProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    redirect("/admin/login");
  }
  return profile;
}

/** Ensure the caller is an admin. Redirects otherwise. */
export async function requireAdmin(): Promise<SessionProfile> {
  const profile = await getProfile();
  if (!profile || profile.role !== "admin") {
    redirect("/admin/login?e=forbidden");
  }
  return profile;
}

/**
 * Route-handler guard: returns a 403 Response when the caller is not staff,
 * or null when authorized. Use in API/export route handlers as defense in
 * depth so sensitive endpoints authorize independently of middleware.
 */
export async function requireStaffApi(): Promise<Response | null> {
  const profile = await getProfile();
  if (!profile || (profile.role !== "admin" && profile.role !== "staff")) {
    return new Response("Forbidden", { status: 403 });
  }
  return null;
}
