import { NextResponse } from "next/server";
import { createAdminClient } from "@/utils/supabase/admin";
import { requireStaffApi } from "@/lib/auth";
import { importPeopleGroups } from "@/lib/cms/csv";

export const dynamic = "force-dynamic";

export async function POST(request: Request) {
  const denied = await requireStaffApi();
  if (denied) return denied;

  let body: { csv?: string; dryRun?: boolean };
  try {
    body = await request.json();
  } catch {
    return NextResponse.json({ error: "Invalid JSON body" }, { status: 400 });
  }

  const csv = body.csv;
  if (typeof csv !== "string" || csv.trim().length === 0) {
    return NextResponse.json({ error: "Missing CSV content" }, { status: 400 });
  }
  if (csv.length > 5_000_000) {
    return NextResponse.json({ error: "File too large (max 5MB)" }, { status: 400 });
  }

  try {
    const supabase = createAdminClient();
    const result = await importPeopleGroups(supabase, csv, { dryRun: body.dryRun ?? false });
    return NextResponse.json({ data: result });
  } catch (err) {
    console.error("CSV import failed", err);
    return NextResponse.json({ error: "Import failed. Check the file format and try again." }, { status: 500 });
  }
}
