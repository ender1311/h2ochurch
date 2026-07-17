"use client";
import { useEffect, useState } from "react";
import { listPageVersions, restorePageVersion, type PageVersion } from "@/lib/cms/actions/pages";

interface HistoryDrawerProps {
  slug: string;
  open: boolean;
  onClose: () => void;
}

export function HistoryDrawer({ slug, open, onClose }: HistoryDrawerProps) {
  const [versions, setVersions] = useState<PageVersion[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [restoringId, setRestoringId] = useState<string | null>(null);

  useEffect(() => {
    if (!open) return;
    setLoading(true);
    setError(null);
    listPageVersions(slug)
      .then((v) => setVersions(v))
      .catch((e: unknown) => setError(e instanceof Error ? e.message : "Failed to load history"))
      .finally(() => setLoading(false));
  }, [open, slug]);

  async function handleRestore(id: string) {
    setRestoringId(id);
    try {
      await restorePageVersion(id);
      window.location.reload();
    } catch (e: unknown) {
      setError(e instanceof Error ? e.message : "Restore failed");
      setRestoringId(null);
    }
  }

  if (!open) return null;

  return (
    <>
      {/* Backdrop */}
      <div
        className="fixed inset-0 z-[55] bg-black/30"
        onClick={onClose}
        aria-hidden="true"
      />

      {/* Drawer panel */}
      <div
        role="dialog"
        aria-label="Version history"
        className="fixed inset-y-0 right-0 z-[60] flex w-80 flex-col bg-white shadow-xl"
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-gray-200 px-4 py-3">
          <h2 className="text-sm font-semibold text-gray-900">Version history</h2>
          <button
            type="button"
            onClick={onClose}
            className="rounded p-1 text-gray-400 hover:bg-gray-100 hover:text-gray-700"
            aria-label="Close history drawer"
          >
            ✕
          </button>
        </div>

        {/* Body */}
        <div className="flex-1 overflow-y-auto px-4 py-3">
          {loading && (
            <p className="text-sm text-gray-500">Loading…</p>
          )}

          {error && !loading && (
            <p className="text-sm text-red-600">{error}</p>
          )}

          {!loading && !error && versions.length === 0 && (
            <p className="text-sm text-gray-500">No published versions yet.</p>
          )}

          {!loading && !error && versions.length > 0 && (
            <ul className="space-y-3">
              {versions.map((v) => (
                <li key={v.id} className="rounded border border-gray-200 p-3">
                  <p className="text-xs font-medium text-gray-900">
                    {new Date(v.createdAt).toLocaleString()}
                  </p>
                  <p className="mt-0.5 text-xs text-gray-500">
                    {v.authorName ?? "Unknown"}
                  </p>
                  <button
                    type="button"
                    disabled={restoringId !== null}
                    onClick={() => handleRestore(v.id)}
                    className="mt-2 rounded bg-blue-600 px-2.5 py-1 text-xs font-medium text-white hover:bg-blue-700 disabled:opacity-50 disabled:cursor-not-allowed"
                  >
                    {restoringId === v.id ? "Restoring…" : "Restore to draft"}
                  </button>
                </li>
              ))}
            </ul>
          )}
        </div>
      </div>
    </>
  );
}
