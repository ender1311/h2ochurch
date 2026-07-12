"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type ImportResult = {
  parsedRows: number;
  peopleCreated: number;
  peopleMatched: number;
  groupsCreated: number;
  membershipsCreated: number;
  dryRun: boolean;
  warnings: string[];
};

export function ImportPanel() {
  const router = useRouter();
  const [csv, setCsv] = useState<string>("");
  const [fileName, setFileName] = useState<string>("");
  const [preview, setPreview] = useState<ImportResult | null>(null);
  const [committed, setCommitted] = useState<ImportResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [busy, setBusy] = useState(false);

  async function run(dryRun: boolean) {
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/admin/import/run", {
        method: "POST",
        headers: { "content-type": "application/json" },
        body: JSON.stringify({ csv, dryRun }),
      });
      const json = await res.json();
      if (!res.ok) throw new Error(json.error ?? "Import failed");
      if (dryRun) setPreview(json.data);
      else {
        setCommitted(json.data);
        setPreview(null);
        router.refresh();
      }
    } catch (e) {
      setError(e instanceof Error ? e.message : "Import failed");
    } finally {
      setBusy(false);
    }
  }

  async function onFile(e: React.ChangeEvent<HTMLInputElement>) {
    const file = e.target.files?.[0];
    if (!file) return;
    setFileName(file.name);
    setCsv(await file.text());
    setPreview(null);
    setCommitted(null);
    setError(null);
  }

  return (
    <div className="rounded-3xl border border-ink/10 bg-cream p-8">
      <label className="flex cursor-pointer flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-ink/20 px-6 py-12 text-center transition-colors hover:border-brand hover:bg-water/5">
        <svg viewBox="0 0 24 24" className="h-10 w-10 text-brand" fill="none" stroke="currentColor" strokeWidth="1.6" strokeLinecap="round" strokeLinejoin="round">
          <path d="M12 16V4m0 0L8 8m4-4l4 4M4 20h16" />
        </svg>
        <span className="font-display text-lg font-bold text-ink">
          {fileName || "Choose a CSV file"}
        </span>
        <span className="text-sm text-ink/50">
          Planning Center export format: First Name, Last Name, Email, Phone, Groups
        </span>
        <input type="file" accept=".csv,text/csv" onChange={onFile} className="hidden" />
      </label>

      {error ? (
        <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-700">
          {error}
        </p>
      ) : null}

      {csv && !committed ? (
        <div className="mt-6 flex flex-wrap gap-3">
          <button
            onClick={() => run(true)}
            disabled={busy}
            className="rounded-full border border-ink/15 px-6 py-3 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand disabled:opacity-50"
          >
            {busy ? "Working…" : "Preview"}
          </button>
          {preview ? (
            <button
              onClick={() => run(false)}
              disabled={busy}
              className="rounded-full bg-brand px-6 py-3 text-sm font-bold uppercase tracking-widest text-cream transition-colors hover:bg-water disabled:opacity-50"
            >
              {busy ? "Importing…" : "Confirm import"}
            </button>
          ) : null}
        </div>
      ) : null}

      {(preview || committed) && (
        <ResultCard result={(committed ?? preview)!} />
      )}
    </div>
  );
}

function ResultCard({ result }: { result: ImportResult }) {
  const stats = [
    { label: "Rows parsed", value: result.parsedRows },
    { label: result.dryRun ? "People (new)" : "People created", value: result.peopleCreated },
    { label: "People matched", value: result.peopleMatched },
    { label: "Groups (new)", value: result.groupsCreated },
    { label: "Memberships", value: result.membershipsCreated },
  ];
  return (
    <div className="mt-6 rounded-2xl border border-ink/10 bg-paper p-6">
      <p className="text-xs font-bold uppercase tracking-widest text-brand">
        {result.dryRun ? "Preview — nothing saved yet" : "Import complete"}
      </p>
      <div className="mt-4 grid grid-cols-2 gap-4 sm:grid-cols-5">
        {stats.map((s) => (
          <div key={s.label}>
            <p className="font-display text-3xl font-extrabold text-ink">{s.value}</p>
            <p className="text-xs font-semibold uppercase tracking-wider text-ink/50">{s.label}</p>
          </div>
        ))}
      </div>
      {result.warnings.length ? (
        <ul className="mt-4 space-y-1 text-sm text-amber-700">
          {result.warnings.map((w, i) => (
            <li key={i}>⚠ {w}</li>
          ))}
        </ul>
      ) : null}
    </div>
  );
}
