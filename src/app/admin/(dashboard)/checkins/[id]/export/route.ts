import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireStaffApi } from "@/lib/auth";
import { toCsv } from "@/lib/cms/csv";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireStaffApi();
  if (denied) return denied;

  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("checkins")
    .select("checked_in_at, people(first_name, last_name, email)")
    .eq("session_id", id)
    .order("checked_in_at");

  const rows = (data ?? []).map((c) => {
    const rec = c as unknown as {
      checked_in_at: string;
      people: { first_name: string; last_name: string; email: string | null } | null;
    };
    return {
      first_name: rec.people?.first_name ?? "",
      last_name: rec.people?.last_name ?? "",
      email: rec.people?.email ?? "",
      checked_in_at: rec.checked_in_at,
    };
  });

  const csv = toCsv(rows, [
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "checked_in_at", label: "Checked In At" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="checkin-attendance.csv"',
      "cache-control": "no-store, private",
    },
  });
}
