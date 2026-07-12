"use client";

import { useRouter } from "next/navigation";
import { createClient } from "@/utils/supabase/client";

export function SignOutButton() {
  const router = useRouter();

  async function signOut() {
    const supabase = createClient();
    await supabase.auth.signOut();
    router.push("/admin/login");
    router.refresh();
  }

  return (
    <button
      onClick={signOut}
      className="w-full rounded-xl px-3 py-2.5 text-left text-sm font-medium text-foam/60 transition-colors hover:bg-white/5 hover:text-cream"
    >
      Sign out
    </button>
  );
}
