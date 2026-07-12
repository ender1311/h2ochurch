"use client";

import { useState } from "react";

export type AccordionItem = {
  emphasis: string;
  rest: string;
  body: string;
};

export function Accordion({ items }: { items: AccordionItem[] }) {
  const [open, setOpen] = useState<number | null>(0);

  return (
    <div className="divide-y divide-ink/10 overflow-hidden rounded-3xl border border-ink/10 bg-cream">
      {items.map((item, i) => {
        const isOpen = open === i;
        return (
          <div key={item.emphasis}>
            <h3>
              <button
                onClick={() => setOpen(isOpen ? null : i)}
                aria-expanded={isOpen}
                className="flex w-full items-center gap-5 px-7 py-6 text-left transition-colors hover:bg-water/5 sm:px-9"
              >
                <span className="font-display text-sm font-extrabold text-water/70 tabular-nums">
                  0{i + 1}
                </span>
                <span className="flex-1 font-display text-xl font-bold text-ink sm:text-2xl">
                  <span className="text-brand">{item.emphasis}</span>{" "}
                  <span className="font-medium text-ink/70">{item.rest}</span>
                </span>
                <span
                  className={`flex h-9 w-9 shrink-0 items-center justify-center rounded-full border border-ink/15 text-ink transition-transform duration-300 ${
                    isOpen ? "rotate-45 border-brand bg-brand text-cream" : ""
                  }`}
                >
                  <svg viewBox="0 0 16 16" className="h-4 w-4" fill="none">
                    <path d="M8 3v10M3 8h10" stroke="currentColor" strokeWidth="1.8" strokeLinecap="round" />
                  </svg>
                </span>
              </button>
            </h3>
            <div
              className="grid transition-all duration-500 ease-out"
              style={{ gridTemplateRows: isOpen ? "1fr" : "0fr" }}
            >
              <div className="overflow-hidden">
                <p className="px-7 pb-7 pl-[3.75rem] text-lg leading-relaxed text-ink/70 sm:px-9 sm:pl-[4.5rem]">
                  {item.body}
                </p>
              </div>
            </div>
          </div>
        );
      })}
    </div>
  );
}
