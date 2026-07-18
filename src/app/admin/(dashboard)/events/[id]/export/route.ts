import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireStaffApi } from "@/lib/auth";
import { toCsv } from "@/lib/cms/csv";
import type { EventRegistration } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export async function GET(_req: Request, { params }: { params: Promise<{ id: string }> }) {
  const denied = await requireStaffApi();
  if (denied) return denied;

  const { id } = await params;
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("event_registrations")
    .select("first_name,last_name,email,phone,status,created_at")
    .eq("event_id", id)
    .order("created_at");
  const rows = (data ?? []) as EventRegistration[];

  const csv = toCsv(rows, [
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email" },
    { key: "phone", label: "Phone" },
    { key: "status", label: "Status" },
    { key: "created_at", label: "Registered At" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="event-registrations.csv"',
      "cache-control": "no-store, private",
    },
  });
}
