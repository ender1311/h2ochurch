import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { createPlan } from "@/lib/cms/actions/services";
import { Field, SubmitButton } from "@/components/admin/Form";

export const dynamic = "force-dynamic";
export const metadata = { title: "Services — H2O Hub" };

type PlanRow = {
  id: string;
  service_date: string;
  title: string;
  plan_items: { count: number }[];
  plan_assignments: { count: number }[];
};

export default async function ServicesPage() {
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("service_plans")
    .select("id, service_date, title, plan_items(count), plan_assignments(count)")
    .order("service_date", { ascending: false });
  const plans = (data ?? []) as PlanRow[];

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <h1 className="font-display text-4xl font-extrabold text-ink">Services</h1>
          <p className="mt-1 text-ink/60">Plan Sunday gatherings — order of service, songs, and teams.</p>
        </div>
        <div className="flex items-center gap-3">
          <Link href="/admin/services/songs" className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand">
            Song Library
          </Link>
          <Link href="/admin/services/teams" className="rounded-full border border-ink/15 px-5 py-2.5 text-sm font-bold uppercase tracking-widest text-ink transition-colors hover:border-brand hover:text-brand">
            Teams
          </Link>
        </div>
      </div>

      <form action={createPlan} className="mt-8 flex flex-wrap items-end gap-3 rounded-2xl border border-ink/10 bg-cream p-5">
        <div className="min-w-44"><Field label="Service date" name="service_date" type="date" required /></div>
        <div className="min-w-56 flex-1"><Field label="Title" name="title" placeholder="Sunday Gathering" /></div>
        <SubmitButton>Create plan</SubmitButton>
      </form>

      <div className="mt-6 grid gap-4">
        {plans.map((p) => (
          <Link
            key={p.id}
            href={`/admin/services/${p.id}`}
            className="group flex flex-wrap items-center justify-between gap-4 rounded-3xl border border-ink/10 bg-cream p-6 transition-colors hover:border-water/30"
          >
            <div>
              <h2 className="font-display text-xl font-bold text-ink group-hover:text-brand">{p.title}</h2>
              <p className="mt-1 text-sm text-ink/55">
                {new Date(`${p.service_date}T12:00:00`).toLocaleDateString(undefined, {
                  weekday: "long",
                  month: "long",
                  day: "numeric",
                  year: "numeric",
                })}
              </p>
            </div>
            <div className="flex gap-8 text-right">
              <div>
                <p className="font-display text-2xl font-extrabold text-brand">{p.plan_items?.[0]?.count ?? 0}</p>
                <p className="text-xs uppercase tracking-widest text-ink/40">items</p>
              </div>
              <div>
                <p className="font-display text-2xl font-extrabold text-brand">{p.plan_assignments?.[0]?.count ?? 0}</p>
                <p className="text-xs uppercase tracking-widest text-ink/40">scheduled</p>
              </div>
            </div>
          </Link>
        ))}
        {plans.length === 0 ? (
          <div className="rounded-3xl border border-dashed border-ink/20 p-16 text-center text-ink/50">
            No service plans yet — create your first Sunday above.
          </div>
        ) : null}
      </div>
    </div>
  );
}
