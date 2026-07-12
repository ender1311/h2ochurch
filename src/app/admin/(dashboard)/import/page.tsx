import { ImportPanel } from "./ImportPanel";

export const metadata = { title: "Import / Export — H2O Hub" };

export default function ImportPage() {
  return (
    <div>
      <h1 className="font-display text-4xl font-extrabold text-ink">Import / Export</h1>
      <p className="mt-2 max-w-2xl text-ink/60">
        Bring people and groups in from a CSV (e.g. a Planning Center export). People are matched by
        email so you can re-import safely without creating duplicates.
      </p>

      <div className="mt-8">
        <ImportPanel />
      </div>

      <div className="mt-8 grid gap-4 sm:grid-cols-2">
        <a
          href="/admin/people/export"
          className="rounded-3xl border border-ink/10 bg-cream p-6 transition-colors hover:border-brand"
        >
          <h2 className="font-display text-lg font-bold text-ink">Export people</h2>
          <p className="mt-1 text-sm text-ink/60">Download all people and their groups as CSV.</p>
        </a>
        <a
          href="/admin/groups/export"
          className="rounded-3xl border border-ink/10 bg-cream p-6 transition-colors hover:border-brand"
        >
          <h2 className="font-display text-lg font-bold text-ink">Export groups</h2>
          <p className="mt-1 text-sm text-ink/60">Download all groups with member counts as CSV.</p>
        </a>
      </div>
    </div>
  );
}
