import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireStaffApi } from "@/lib/auth";
import { toCsv } from "@/lib/cms/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireStaffApi();
  if (denied) return denied;

  const supabase = createAdminClient();
  const { data } = await supabase
    .from("donations")
    .select("donated_on, amount_cents, method, note, people(first_name,last_name), funds(name)")
    .order("donated_on", { ascending: false });

  const rows = (data ?? []).map((row) => {
    const rec = row as unknown as {
      donated_on: string;
      amount_cents: number;
      method: string;
      note: string | null;
      people: { first_name: string; last_name: string } | null;
      funds: { name: string } | null;
    };
    return {
      date: rec.donated_on,
      donor: rec.people ? `${rec.people.first_name} ${rec.people.last_name}` : "Anonymous",
      fund: rec.funds?.name ?? "General",
      amount: (rec.amount_cents / 100).toFixed(2),
      method: rec.method,
      note: rec.note ?? "",
    };
  });

  const csv = toCsv(rows, [
    { key: "date", label: "Date" },
    { key: "donor", label: "Donor" },
    { key: "fund", label: "Fund" },
    { key: "amount", label: "Amount" },
    { key: "method", label: "Method" },
    { key: "note", label: "Note" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="h2o-giving-export.csv"',
    },
  });
}
