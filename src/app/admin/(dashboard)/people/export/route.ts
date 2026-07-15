import { NextResponse } from "next/server";
import { listAllPeopleForExport } from "@/lib/cms/queries";
import { requireStaffApi } from "@/lib/auth";
import { toCsv } from "@/lib/cms/csv";

export const dynamic = "force-dynamic";

export async function GET() {
  const denied = await requireStaffApi();
  if (denied) return denied;

  const people = await listAllPeopleForExport();
  const csv = toCsv(people, [
    { key: "first_name", label: "First Name" },
    { key: "last_name", label: "Last Name" },
    { key: "email", label: "Email Address" },
    { key: "phone", label: "Phone Number" },
    { key: "status", label: "Status" },
    { key: "group_names", label: "Groups" },
  ]);

  return new NextResponse(csv, {
    headers: {
      "content-type": "text/csv; charset=utf-8",
      "content-disposition": 'attachment; filename="h2o-people-export.csv"',
    },
  });
}
