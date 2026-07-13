"use client";

export function PrintButton() {
  return (
    <button
      onClick={() => window.print()}
      className="rounded-full bg-brand px-8 py-3.5 text-sm font-bold uppercase tracking-widest text-white transition-colors hover:bg-deep print:hidden"
    >
      Print labels
    </button>
  );
}
