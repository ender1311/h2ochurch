"use client";
import { useState } from "react";
import { useRouter } from "next/navigation";
import { usePuck } from "@measured/puck";
import { savePageDraft } from "@/lib/cms/actions/pages";

export function EditorTopBar({ slug }: { slug: string }) {
  const router = useRouter();
  const { appState } = usePuck();
  const [saved, setSaved] = useState(false);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSaveDraft() {
    setSaving(true);
    setError(null);
    try {
      await savePageDraft(slug, appState.data);
      setSaved(true);
      setTimeout(() => setSaved(false), 2000);
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  async function handlePreview() {
    setSaving(true);
    setError(null);
    try {
      await savePageDraft(slug, appState.data);
      window.open(`/admin/pages/${slug}/preview`, "_blank");
    } catch (e) {
      setError(e instanceof Error ? e.message : "Save failed");
    } finally {
      setSaving(false);
    }
  }

  return (
    <div className="flex items-center gap-2">
      <button
        type="button"
        onClick={() => {
          if (window.confirm("Leave the editor? Unsaved changes will be lost unless you saved a draft.")) {
            router.push("/admin/pages");
          }
        }}
        className="flex items-center gap-1 rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900"
      >
        ← Pages
      </button>

      <button
        type="button"
        onClick={handleSaveDraft}
        disabled={saving}
        className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
      >
        {saved ? "Saved ✓" : saving ? "Saving…" : "Save draft"}
      </button>

      <button
        type="button"
        onClick={handlePreview}
        disabled={saving}
        className="rounded px-2 py-1 text-sm text-gray-600 hover:bg-gray-100 hover:text-gray-900 disabled:opacity-50"
      >
        Preview
      </button>

      {error ? <span className="px-2 text-xs text-red-600">{error}</span> : null}

      {/* TODO(task-6): wire this to the version-history drawer */}
      <button
        type="button"
        disabled
        className="rounded px-2 py-1 text-sm text-gray-400 cursor-not-allowed"
        title="Version history — coming soon"
      >
        History
      </button>
    </div>
  );
}
