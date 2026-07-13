import type { Metadata } from "next";
import { createAdminClient } from "@/utils/supabase/admin";
import { PageHero } from "@/components/site/PageHero";
import { Reveal } from "@/components/Reveal";
import { JoinGroupCard } from "./JoinGroupCard";
import type { Group } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Groups — H2O Church",
  description: "Find a Bible study or community group meeting on campus at Ohio State.",
};

export default async function PublicGroupsPage({
  searchParams,
}: {
  searchParams: Promise<{ requested?: string }>;
}) {
  const { requested } = await searchParams;
  // Public content only: listed groups, public columns.
  const supabase = createAdminClient();
  const { data } = await supabase
    .from("groups")
    .select("id,name,slug,description,schedule,location,visibility")
    .eq("visibility", "listed")
    .order("name");
  const groups = (data ?? []) as Pick<
    Group,
    "id" | "name" | "slug" | "description" | "schedule" | "location" | "visibility"
  >[];

  return (
    <main>
      <PageHero
        eyebrow="Get Connected"
        title="Groups"
        subtitle="As a church body, we live life together. Find a Bible study or community group meeting near you on campus this week."
      />

      <section className="bg-white py-20 sm:py-24">
        <div className="mx-auto max-w-6xl px-5 sm:px-8">
          {requested ? (
            <div className="mb-10 rounded-lg border border-brand/30 bg-foam px-6 py-5 text-center">
              <p className="font-display text-lg font-bold text-brand">Request received!</p>
              <p className="mt-1 text-sm text-ink/70">
                A group leader will reach out soon to help you get plugged in.
              </p>
            </div>
          ) : null}

          {groups.length === 0 ? (
            <div className="rounded-lg border border-dashed border-ink/20 p-16 text-center text-ink/50">
              Group listings are coming soon — email us and we&apos;ll get you connected.
            </div>
          ) : (
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {groups.map((g, i) => (
                <Reveal key={g.id} as="article" delay={(i % 3) * 100}>
                  <JoinGroupCard group={g} />
                </Reveal>
              ))}
            </div>
          )}
        </div>
      </section>
    </main>
  );
}
