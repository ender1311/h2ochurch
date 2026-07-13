"use client";

import { useState } from "react";
import { requestToJoin } from "@/lib/cms/actions/join-requests";

type PublicGroup = {
  id: string;
  name: string;
  description: string | null;
  schedule: string | null;
  location: string | null;
};

export function JoinGroupCard({ group }: { group: PublicGroup }) {
  const [open, setOpen] = useState(false);
  const action = requestToJoin.bind(null, group.id);

  return (
    <div className="flex h-full flex-col border border-black/5 bg-white shadow-[0_10px_40px_-15px_rgba(43,51,60,0.18)]">
      <div className="border-b-4 border-brand bg-sand px-7 py-5">
        <h2 className="font-display text-xl font-bold text-slate">{group.name}</h2>
        {group.schedule ? (
          <p className="mt-1 text-xs font-bold uppercase tracking-[0.2em] text-brand">{group.schedule}</p>
        ) : null}
      </div>

      <div className="flex flex-1 flex-col p-7">
        {group.location ? (
          <p className="flex items-center gap-2 text-sm text-ink/60">
            <svg viewBox="0 0 24 24" className="h-4 w-4 shrink-0 text-brand" fill="none" stroke="currentColor" strokeWidth="1.8">
              <path d="M12 21s7-6.3 7-11a7 7 0 1 0-14 0c0 4.7 7 11 7 11Z" />
              <circle cx="12" cy="10" r="2.5" />
            </svg>
            {group.location}
          </p>
        ) : null}
        {group.description ? (
          <p className="mt-3 flex-1 text-sm leading-relaxed text-ink/70">{group.description}</p>
        ) : (
          <span className="flex-1" />
        )}

        {open ? (
          <form action={action} className="mt-6 grid gap-3">
            <div className="grid grid-cols-2 gap-3">
              <input name="first_name" required placeholder="First name" className="rounded border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
              <input name="last_name" required placeholder="Last name" className="rounded border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            </div>
            <input name="email" type="email" placeholder="Email" className="rounded border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            <input name="phone" placeholder="Phone (optional)" className="rounded border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            <textarea name="message" rows={2} placeholder="Anything you'd like us to know?" className="rounded border border-ink/15 px-3 py-2.5 text-sm outline-none focus:border-brand" />
            <div className="flex gap-2">
              <button className="flex-1 bg-brand px-5 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-deep">
                Send Request
              </button>
              <button
                type="button"
                onClick={() => setOpen(false)}
                className="border border-ink/15 px-4 py-2.5 text-xs font-bold uppercase tracking-widest text-ink/60 hover:border-ink/40"
              >
                Cancel
              </button>
            </div>
          </form>
        ) : (
          <button
            onClick={() => setOpen(true)}
            className="mt-6 w-fit bg-brand px-6 py-2.5 text-xs font-bold uppercase tracking-widest text-white transition-colors hover:bg-deep"
          >
            Request to Join
          </button>
        )}
      </div>
    </div>
  );
}
