"use server";

import { revalidatePath } from "next/cache";
import { requireStaff } from "@/lib/auth";
import { createAdminClient } from "@/utils/supabase/admin";

function str(fd: FormData, key: string): string {
  return (fd.get(key) as string | null)?.trim() ?? "";
}
function nullable(fd: FormData, key: string): string | null {
  const v = str(fd, key);
  return v.length ? v : null;
}

export async function createFund(fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const name = str(fd, "name");
  if (!name) return;
  await supabase.from("funds").upsert({ name }, { onConflict: "name" });
  revalidatePath("/admin/giving");
}

export async function recordDonation(fd: FormData) {
  await requireStaff();
  const supabase = createAdminClient();
  const amount = Number(str(fd, "amount"));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error("Enter a valid amount");
  const { error } = await supabase.from("donations").insert({
    person_id: nullable(fd, "person_id"),
    fund_id: nullable(fd, "fund_id"),
    amount_cents: Math.round(amount * 100),
    method: nullable(fd, "method") ?? "other",
    note: nullable(fd, "note"),
    donated_on: nullable(fd, "donated_on") ?? undefined,
  });
  if (error) throw new Error(error.message);
  revalidatePath("/admin/giving");
}

export async function deleteDonation(id: string) {
  await requireStaff();
  const supabase = createAdminClient();
  await supabase.from("donations").delete().eq("id", id);
  revalidatePath("/admin/giving");
}
