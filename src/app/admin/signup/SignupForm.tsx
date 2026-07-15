"use client";

import { useActionState } from "react";
import { Logo } from "@/components/site/Logo";
import { signUpStaff, type AuthActionState } from "@/lib/cms/actions/auth";

const initial: AuthActionState = {};

export function SignupForm() {
  const [state, formAction, pending] = useActionState(signUpStaff, initial);

  if (state.ok) {
    return (
      <div className="relative z-10 w-full max-w-sm">
        <div className="mb-8 flex justify-center">
          <Logo tone="light" />
        </div>
        <div className="rounded-3xl border border-white/10 bg-ink/40 p-8 text-center backdrop-blur-xl">
          <h1 className="font-display text-2xl font-extrabold text-cream">Almost there</h1>
          <p className="mt-3 text-sm text-foam/70">
            We&apos;ve sent a confirmation link to your email. Click it to activate your account,
            then sign in.
          </p>
          <a
            href="/admin/login"
            className="mt-6 inline-block rounded-full bg-cream px-6 py-3 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-aqua"
          >
            Back to sign in
          </a>
        </div>
      </div>
    );
  }

  return (
    <div className="relative z-10 w-full max-w-sm">
      <div className="mb-8 flex justify-center">
        <Logo tone="light" />
      </div>
      <form action={formAction} className="rounded-3xl border border-white/10 bg-ink/40 p-8 backdrop-blur-xl">
        <h1 className="font-display text-2xl font-extrabold text-cream">Create your account</h1>
        <p className="mt-1 text-sm text-foam/60">For H2O staff with an @h2osu.org email.</p>

        {state.error ? (
          <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {state.error}
          </p>
        ) : null}

        <label className="mt-6 block text-xs font-bold uppercase tracking-widest text-foam/60">
          Full name
          <input
            name="full_name"
            type="text"
            required
            className="mt-2 w-full rounded-xl border border-white/15 bg-ink/50 px-4 py-3 text-cream outline-none transition-colors focus:border-aqua"
          />
        </label>
        <label className="mt-4 block text-xs font-bold uppercase tracking-widest text-foam/60">
          Email (@h2osu.org)
          <input
            name="email"
            type="email"
            required
            placeholder="you@h2osu.org"
            className="mt-2 w-full rounded-xl border border-white/15 bg-ink/50 px-4 py-3 text-cream outline-none transition-colors placeholder:text-foam/30 focus:border-aqua"
          />
        </label>
        <label className="mt-4 block text-xs font-bold uppercase tracking-widest text-foam/60">
          Password (8+ characters)
          <input
            name="password"
            type="password"
            required
            minLength={8}
            className="mt-2 w-full rounded-xl border border-white/15 bg-ink/50 px-4 py-3 text-cream outline-none transition-colors focus:border-aqua"
          />
        </label>

        <button
          type="submit"
          disabled={pending}
          className="mt-7 w-full rounded-full bg-cream py-3.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-aqua disabled:opacity-60"
        >
          {pending ? "Creating…" : "Create account"}
        </button>

        <p className="mt-5 text-center text-xs text-foam/60">
          Already have an account?{" "}
          <a href="/admin/login" className="font-semibold text-aqua hover:text-cream">
            Sign in
          </a>
        </p>
      </form>
    </div>
  );
}
