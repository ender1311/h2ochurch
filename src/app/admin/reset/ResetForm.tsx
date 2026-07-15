"use client";

import { useActionState } from "react";
import { Logo } from "@/components/site/Logo";
import { requestPasswordReset, type AuthActionState } from "@/lib/cms/actions/auth";

const initial: AuthActionState = {};

export function ResetForm() {
  const [state, formAction, pending] = useActionState(requestPasswordReset, initial);

  return (
    <div className="relative z-10 w-full max-w-sm">
      <div className="mb-8 flex justify-center">
        <Logo tone="light" />
      </div>
      <form action={formAction} className="rounded-3xl border border-white/10 bg-ink/40 p-8 backdrop-blur-xl">
        <h1 className="font-display text-2xl font-extrabold text-cream">Reset your password</h1>
        <p className="mt-1 text-sm text-foam/60">We&apos;ll email you a link to set a new one.</p>

        {state.ok ? (
          <p className="mt-5 rounded-xl border border-aqua/30 bg-aqua/10 px-4 py-3 text-sm text-aqua">
            If an account exists for that email, a reset link is on its way.
          </p>
        ) : null}
        {state.error ? (
          <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}

        <label className="mt-6 block text-xs font-bold uppercase tracking-widest text-foam/60">
          Email
          <input
            name="email"
            type="email"
            required
            className="mt-2 w-full rounded-xl border border-white/15 bg-ink/50 px-4 py-3 text-cream outline-none transition-colors focus:border-aqua"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-7 w-full rounded-full bg-cream py-3.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-aqua disabled:opacity-60"
        >
          {pending ? "Sending…" : "Send reset link"}
        </button>

        <p className="mt-5 text-center text-xs text-foam/60">
          <a href="/admin/login" className="font-semibold text-aqua hover:text-cream">
            Back to sign in
          </a>
        </p>
      </form>
    </div>
  );
}
