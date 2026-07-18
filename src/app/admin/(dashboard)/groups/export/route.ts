import { NextResponse } from "next/server";
import { listGroupsWithCounts } from "@/lib/cms/queries";
import { requireStaffApi } from "@/lib/auth";
import { toCsv } from "@/lib/cms/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireStaffApi();
  if (denied) return denied;

  const groups = await listGroupsWithCounts();
  const csv = toCsv(groups, [
    { key: "name", label: "Name" },
    { key: "schedule", label: "Schedule" },
    { key: "location", label: "Location" },
    { key: "visibility", label: "Visibility" },
    { key: "member_count", label: "Members" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="h2o-groups-export.csv"',
      "cache-control": "no-store, private",
    },
  });
}
