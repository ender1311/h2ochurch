import Papa from "papaparse";
import type { SupabaseClient } from "@supabase/supabase-js";

export type ImportRow = {
  firstName: string;
  lastName: string;
  email: string | null;
  phone: string | null;
  groups: string[];
};

export type ImportResult = {
  parsedRows: number;
  peopleCreated: number;
  peopleMatched: number;
  groupsCreated: number;
  membershipsCreated: number;
  dryRun: boolean;
  warnings: string[];
};

function normalizeKey(k: string): string {
  return k.toLowerCase().replace(/[^a-z0-9]/g, "");
}

export function parsePeopleGroupsCsv(csvText: string): {
  rows: ImportRow[];
  warnings: string[];
} {
  const parsed = Papa.parse<Record<string, string>>(csvText, {
    header: true,
    skipEmptyLines: true,
    transformHeader: (h) => h.trim(),
  });

  const warnings: string[] = [];
  if (parsed.errors.length) {
    warnings.push(
      ...parsed.errors.slice(0, 5).map((e) => `Parse issue on row ${e.row}: ${e.message}`),
    );
  }

  const rows: ImportRow[] = [];
  for (const raw of parsed.data) {
    const map: Record<string, string> = {};
    for (const [k, v] of Object.entries(raw)) {
      map[normalizeKey(k)] = (v ?? "").trim();
    }

    const firstName = map["firstname"] ?? map["first"] ?? "";
    const lastName = map["lastname"] ?? map["last"] ?? "";
    const email = (map["emailaddress"] ?? map["email"] ?? "") || null;
    const phone = (map["phonenumber"] ?? map["phone"] ?? map["mobile"] ?? "") || null;
    const groupsRaw = map["groups"] ?? map["group"] ?? "";
    const groups = groupsRaw
      .split("|")
      .map((s) => s.trim())
      .filter(Boolean);

    if (!firstName && !lastName && !email) continue;
    rows.push({ firstName, lastName, email, phone, groups });
  }

  return { rows, warnings };
}

/**
 * Import people + groups + memberships from a Planning Center-style CSV.
 * Dedupes people by lowercase email, upserts groups by name, and links
 * memberships idempotently. Pass `dryRun` to preview counts without writing.
 */
export async function importPeopleGroups(
  supabase: SupabaseClient,
  csvText: string,
  opts: { dryRun?: boolean } = {},
): Promise<ImportResult> {
  const dryRun = opts.dryRun ?? false;
  const { rows, warnings } = parsePeopleGroupsCsv(csvText);
  const result: ImportResult = {
    parsedRows: rows.length,
    peopleCreated: 0,
    peopleMatched: 0,
    groupsCreated: 0,
    membershipsCreated: 0,
    dryRun,
    warnings,
  };

  // ── Resolve groups ────────────────────────────────────────────────────
  const groupNames = [...new Set(rows.flatMap((r) => r.groups))];
  const groupIdByName = new Map<string, string>();
  let groupsToCreate: string[] = [];

  if (groupNames.length) {
    const { data: existing, error } = await supabase
      .from("groups")
      .select("id,name")
      .in("name", groupNames);
    if (error) throw error;
    for (const g of existing ?? []) groupIdByName.set(g.name, g.id);
    groupsToCreate = groupNames.filter((n) => !groupIdByName.has(n));

    if (!dryRun && groupsToCreate.length) {
      const { data: created, error: insErr } = await supabase
        .from("groups")
        .insert(groupsToCreate.map((name) => ({ name })))
        .select("id,name");
      if (insErr) throw insErr;
      for (const g of created ?? []) groupIdByName.set(g.name, g.id);
    }
  }
  result.groupsCreated = groupsToCreate.length;

  // ── Resolve people (dedupe by email, then by name for email-less rows) ─
  const emailToId = new Map<string, string>();
  const wantedEmails = rows.map((r) => r.email?.toLowerCase()).filter(Boolean) as string[];
  if (wantedEmails.length) {
    const { data: existingPeople, error } = await supabase
      .from("people")
      .select("id,email")
      .in("email", wantedEmails);
    if (error) throw error;
    for (const p of existingPeople ?? []) {
      if (p.email) emailToId.set(p.email.toLowerCase(), p.id);
    }
  }

  const nameKey = (first: string, last: string) =>
    `${first.trim().toLowerCase()}|${last.trim().toLowerCase()}`;
  const nameToId = new Map<string, string>();
  if (rows.some((r) => !r.email)) {
    const { data: emailless, error } = await supabase
      .from("people")
      .select("id,first_name,last_name")
      .is("email", null);
    if (error) throw error;
    for (const p of emailless ?? []) nameToId.set(nameKey(p.first_name, p.last_name), p.id);
  }

  const personIdForRow: (string | null)[] = [];
  for (const r of rows) {
    const key = r.email?.toLowerCase() ?? null;
    const nk = nameKey(r.firstName, r.lastName);

    if (key && emailToId.has(key)) {
      result.peopleMatched++;
      personIdForRow.push(emailToId.get(key)!);
      continue;
    }
    if (!key && nameToId.has(nk)) {
      result.peopleMatched++;
      personIdForRow.push(nameToId.get(nk)!);
      continue;
    }

    result.peopleCreated++;
    if (dryRun) {
      personIdForRow.push(null);
      continue;
    }

    const { data: inserted, error } = await supabase
      .from("people")
      .insert({
        first_name: r.firstName,
        last_name: r.lastName,
        email: r.email?.toLowerCase() ?? null,
        phone: r.phone,
      })
      .select("id")
      .single();

    if (error || !inserted) {
      result.peopleCreated--;
      result.warnings.push(
        `Skipped ${r.firstName} ${r.lastName}: ${error?.message ?? "insert failed"}`,
      );
      personIdForRow.push(null);
      continue;
    }
    if (key) emailToId.set(key, inserted.id);
    else nameToId.set(nk, inserted.id);
    personIdForRow.push(inserted.id);
  }

  // ── Link memberships (idempotent) ─────────────────────────────────────
  const memberships: { group_id: string; person_id: string }[] = [];
  rows.forEach((r, i) => {
    const personId = personIdForRow[i];
    if (!personId) return;
    for (const gn of r.groups) {
      const groupId = groupIdByName.get(gn);
      if (groupId) memberships.push({ group_id: groupId, person_id: personId });
    }
  });

  if (dryRun) {
    result.membershipsCreated = memberships.length;
  } else if (memberships.length) {
    const { data, error } = await supabase
      .from("group_memberships")
      .upsert(memberships, { onConflict: "group_id,person_id", ignoreDuplicates: true })
      .select("id");
    if (error) throw error;
    result.membershipsCreated = data?.length ?? 0;
  }

  return result;
}

// Neutralize spreadsheet formula injection: a cell beginning with = + - @ (or a
// leading tab/CR) is executed as a formula by Excel/Sheets. Prefix such values
// with a single quote so they render as literal text.
export function escapeCsvCell(value: unknown): unknown {
  if (typeof value !== "string") return value;
  return /^[=+\-@\t\r]/.test(value) ? `'${value}` : value;
}

export function toCsv<T extends Record<string, unknown>>(
  rows: T[],
  columns: { key: keyof T & string; label: string }[],
): string {
  const data = rows.map((r) => {
    const o: Record<string, unknown> = {};
    for (const c of columns) o[c.label] = escapeCsvCell(r[c.key] ?? "");
    return o;
  });
  return Papa.unparse(data, { columns: columns.map((c) => c.label) });
}
