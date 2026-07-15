"use client";

import { useState } from "react";
import { useRouter, useSearchParams } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Logo } from "@/components/site/Logo";

export function LoginForm() {
  const router = useRouter();
  const params = useSearchParams();
  const next = params.get("next") ?? "/admin";
  const forbidden = params.get("e") === "forbidden";
  const notice =
    params.get("signup") === "check-email"
      ? "Account created — check your email to confirm it, then sign in."
      : params.get("reset") === "sent"
        ? "If an account exists for that email, we've sent a password-reset link."
        : null;

  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState<string | null>(forbidden ? "That account can't access the Hub." : null);
  const [loading, setLoading] = useState(false);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setLoading(true);
    setError(null);
    const supabase = createClient();
    const { error } = await supabase.auth.signInWithPassword({ email, password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push(next);
    router.refresh();
  }

  return (
    <div className="relative z-10 w-full max-w-sm">
      <div className="mb-8 flex justify-center">
        <Logo tone="light" />
      </div>
      <form
        onSubmit={onSubmit}
        className="rounded-3xl border border-white/10 bg-ink/40 p-8 backdrop-blur-xl"
      >
        <h1 className="font-display text-2xl font-extrabold text-cream">H2O Hub</h1>
        <p className="mt-1 text-sm text-foam/60">Staff sign in</p>

        {notice ? (
          <p className="mt-5 rounded-xl border border-aqua/30 bg-aqua/10 px-4 py-3 text-sm text-aqua">
            {notice}
          </p>
        ) : null}
        {error ? (
          <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <label className="mt-6 block text-xs font-bold uppercase tracking-widest text-foam/60">
          Email
          <input
            type="email"
            required
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-ink/50 px-4 py-3 text-cream outline-none transition-colors focus:border-aqua"
          />
        </label>
        <label className="mt-4 block text-xs font-bold uppercase tracking-widest text-foam/60">
          Password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-ink/50 px-4 py-3 text-cream outline-none transition-colors focus:border-aqua"
          />
        </label>

        <button
          type="submit"
          disabled={loading}
          className="mt-7 w-full rounded-full bg-cream py-3.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-aqua disabled:opacity-60"
        >
          {loading ? "Signing in…" : "Sign in"}
        </button>

        <div className="mt-5 flex items-center justify-between text-xs text-foam/60">
          <a href="/admin/reset" className="font-semibold transition-colors hover:text-cream">
            Forgot password?
          </a>
          <a href="/admin/signup" className="font-semibold transition-colors hover:text-cream">
            Create account
          </a>
        </div>
      </form>
    </div>
  );
}
