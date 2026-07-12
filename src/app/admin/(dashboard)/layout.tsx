import Link from "next/link";
import { createClient } from "@/utils/supabase/server";
import { Logo } from "@/components/site/Logo";
import { AdminSidebar } from "@/components/admin/AdminSidebar";
import { SignOutButton } from "@/components/admin/SignOutButton";

export const metadata = { title: "H2O Hub" };

export default async function DashboardLayout({ children }: { children: React.ReactNode }) {
  const supabase = await createClient();
  const {
    data: { user },
  } = await supabase.auth.getUser();
  const { data: profile } = user
    ? await supabase.from("profiles").select("full_name, email, role").eq("id", user.id).single()
    : { data: null };

  const name = profile?.full_name || profile?.email || "Staff";
  const role = profile?.role ?? "member";

  return (
    <div className="min-h-screen bg-paper text-ink">
      {/* Sidebar */}
      <aside className="fixed inset-y-0 left-0 hidden w-64 flex-col justify-between bg-ink p-5 lg:flex">
        <div>
          <Link href="/" className="block">
            <Logo tone="light" />
          </Link>
          <p className="mb-6 mt-1 pl-9 text-[0.6rem] font-bold uppercase tracking-[0.3em] text-aqua">
            Hub
          </p>
          <AdminSidebar />
        </div>
        <div className="border-t border-white/10 pt-4">
          <p className="px-3 text-sm font-semibold text-cream">{name}</p>
          <p className="mb-2 px-3 text-xs uppercase tracking-widest text-aqua">{role}</p>
          <SignOutButton />
        </div>
      </aside>

      {/* Mobile top bar */}
      <header className="sticky top-0 z-20 flex items-center justify-between border-b border-ink/10 bg-ink px-5 py-3 lg:hidden">
        <Logo tone="light" />
        <SignOutButton />
      </header>

      <main className="lg:pl-64">
        <div className="mx-auto max-w-6xl px-5 py-10 sm:px-8">{children}</div>
      </main>
    </div>
  );
}
