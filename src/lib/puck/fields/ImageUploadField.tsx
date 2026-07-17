"use client";
import { useState } from "react";
import { uploadSiteAsset } from "@/lib/cms/actions/pages";

export function ImageUploadField({
  value, onChange,
}: { value: string; onChange: (v: string) => void }) {
  const [busy, setBusy] = useState(false);
  const [err, setErr] = useState<string | null>(null);
  return (
    <div style={{ display: "grid", gap: 8 }}>
      {value ? (
        // eslint-disable-next-line @next/next/no-img-element
        <img src={value} alt="" style={{ maxHeight: 96, borderRadius: 8, objectFit: "cover" }} />
      ) : null}
      <input
        type="text" value={value} placeholder="Image URL or upload below"
        onChange={(e) => onChange(e.target.value)}
        style={{ width: "100%", padding: 6 }}
      />
      <input
        type="file" accept="image/*" disabled={busy}
        onChange={async (e) => {
          const file = e.target.files?.[0];
          if (!file) return;
          setBusy(true); setErr(null);
          try {
            const fd = new FormData();
            fd.set("file", file);
            const { url } = await uploadSiteAsset(fd);
            onChange(url);
          } catch (e) {
            setErr(e instanceof Error ? e.message : "Upload failed");
          } finally {
            setBusy(false);
          }
        }}
      />
      {busy ? <span style={{ fontSize: 12 }}>Uploading…</span> : null}
      {err ? <span style={{ fontSize: 12, color: "#b91c1c" }}>{err}</span> : null}
    </div>
  );
}
