"use client";

import { useTransition } from "react";

export function DeleteButton({
  action,
  label = "Delete",
  confirm = "Are you sure? This can't be undone.",
}: {
  action: () => Promise<void>;
  label?: string;
  confirm?: string;
}) {
  const [pending, start] = useTransition();

  return (
    <button
      type="button"
      disabled={pending}
      onClick={() => {
        if (window.confirm(confirm)) start(() => action());
      }}
      className="rounded-full border border-red-300 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-red-600 transition-colors hover:bg-red-50 disabled:opacity-50"
    >
      {pending ? "Working…" : label}
    </button>
  );
}
