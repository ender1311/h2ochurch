import type { SupabaseClient } from "@supabase/supabase-js";

export type JoinRequest = {
  id: string;
  group_id: string;
  person_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  message: string | null;
  status: string;
  created_at: string;
};

export async function createJoinRequest(
  supabase: SupabaseClient,
  input: {
    groupId: string;
    firstName: string;
    lastName: string;
    email?: string | null;
    phone?: string | null;
    message?: string | null;
  },
): Promise<string> {
  const email = input.email?.trim().toLowerCase() || null;

  let personId: string | null = null;
  if (email) {
    const { data } = await supabase.from("people").select("id").eq("email", email).maybeSingle();
    personId = data?.id ?? null;
  }

  const { data, error } = await supabase
    .from("group_join_requests")
    .insert({
      group_id: input.groupId,
      person_id: personId,
      first_name: input.firstName.trim(),
      last_name: input.lastName.trim(),
      email,
      phone: input.phone?.trim() || null,
      message: input.message?.trim() || null,
    })
    .select("id")
    .single();
  if (error || !data) throw new Error(error?.message ?? "Could not create request");
  return data.id;
}

/**
 * Approve: find-or-create the person (by email, else by exact name for
 * email-less requests), add a group membership, and mark the request approved.
 * Returns the person id.
 */
export async function approveJoinRequest(
  supabase: SupabaseClient,
  requestId: string,
): Promise<string> {
  const { data: req, error } = await supabase
    .from("group_join_requests")
    .select("*")
    .eq("id", requestId)
    .single();
  if (error || !req) throw new Error("Request not found");
  const r = req as JoinRequest;

  let personId = r.person_id;

  if (!personId && r.email) {
    const { data } = await supabase.from("people").select("id").eq("email", r.email).maybeSingle();
    personId = data?.id ?? null;
  }

  if (!personId) {
    const { data: created, error: insErr } = await supabase
      .from("people")
      .insert({
        first_name: r.first_name,
        last_name: r.last_name,
        email: r.email,
        phone: r.phone,
        status: "prospect",
      })
      .select("id")
      .single();
    if (insErr || !created) throw new Error(insErr?.message ?? "Could not create person");
    personId = created.id as string;
  }

  if (!personId) throw new Error("Could not resolve person");

  const { error: memErr } = await supabase
    .from("group_memberships")
    .upsert(
      { group_id: r.group_id, person_id: personId, role: "member" },
      { onConflict: "group_id,person_id" },
    );
  if (memErr) throw new Error(memErr.message);

  const { error: updErr } = await supabase
    .from("group_join_requests")
    .update({ status: "approved", person_id: personId })
    .eq("id", requestId);
  if (updErr) throw new Error(updErr.message);

  return personId;
}

export async function declineJoinRequest(
  supabase: SupabaseClient,
  requestId: string,
): Promise<void> {
  const { error } = await supabase
    .from("group_join_requests")
    .update({ status: "declined" })
    .eq("id", requestId);
  if (error) throw new Error(error.message);
}
