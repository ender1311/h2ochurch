"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";
import { Logo } from "@/components/site/Logo";

export function SetPasswordForm() {
  const router = useRouter();
  const [ready, setReady] = useState(false);
  const [hasSession, setHasSession] = useState(false);
  const [password, setPassword] = useState("");
  const [confirm, setConfirm] = useState("");
  const [error, setError] = useState<string | null>(null);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    const supabase = createClient();
    // The invite/recovery link establishes a session from the URL on load.
    supabase.auth.getSession().then(({ data }) => {
      setHasSession(!!data.session);
      setReady(true);
    });
    const { data: sub } = supabase.auth.onAuthStateChange((_e, session) => {
      setHasSession(!!session);
      setReady(true);
    });
    return () => sub.subscription.unsubscribe();
  }, []);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    if (password.length < 8) return setError("Use at least 8 characters.");
    if (password !== confirm) return setError("Passwords don't match.");
    setLoading(true);
    const supabase = createClient();
    const { error } = await supabase.auth.updateUser({ password });
    if (error) {
      setError(error.message);
      setLoading(false);
      return;
    }
    router.push("/admin");
    router.refresh();
  }

  return (
    <div className="relative z-10 w-full max-w-sm">
      <div className="mb-8 flex justify-center">
        <Logo tone="light" />
      </div>
      <form onSubmit={onSubmit} className="rounded-3xl border border-white/10 bg-ink/40 p-8 backdrop-blur-xl">
        <h1 className="font-display text-2xl font-extrabold text-cream">Set your password</h1>
        <p className="mt-1 text-sm text-foam/60">Welcome to the H2O Hub. Choose a password to finish.</p>

        {ready && !hasSession ? (
          <p className="mt-5 rounded-xl border border-amber-400/30 bg-amber-500/10 px-4 py-3 text-sm text-amber-200">
            This link is invalid or has expired. Ask an admin to re-send your invite.
          </p>
        ) : null}
        {error ? (
          <p className="mt-5 rounded-xl border border-red-400/30 bg-red-500/10 px-4 py-3 text-sm text-red-200">
            {error}
          </p>
        ) : null}

        <label className="mt-6 block text-xs font-bold uppercase tracking-widest text-foam/60">
          New password
          <input
            type="password"
            required
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-ink/50 px-4 py-3 text-cream outline-none transition-colors focus:border-aqua"
          />
        </label>
        <label className="mt-4 block text-xs font-bold uppercase tracking-widest text-foam/60">
          Confirm password
          <input
            type="password"
            required
            value={confirm}
            onChange={(e) => setConfirm(e.target.value)}
            className="mt-2 w-full rounded-xl border border-white/15 bg-ink/50 px-4 py-3 text-cream outline-none transition-colors focus:border-aqua"
          />
        </label>

        <button
          type="submit"
          disabled={loading || (ready && !hasSession)}
          className="mt-7 w-full rounded-full bg-cream py-3.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:bg-aqua disabled:opacity-60"
        >
          {loading ? "Saving…" : "Set password & continue"}
        </button>
      </form>
    </div>
  );
}
