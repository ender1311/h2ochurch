import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { updatePerson } from "@/lib/cms/actions/people";
import { PersonForm } from "../../PersonForm";
import type { Household, Person } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export default async function EditPersonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const [{ data: person }, { data: households }] = await Promise.all([
    supabase.from("people").select("*").eq("id", id).single(),
    supabase.from("households").select("*").order("name"),
  ]);
  if (!person) notFound();

  const update = updatePerson.bind(null, id);

  return (
    <div>
      <Link href={`/admin/people/${id}`} className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to profile
      </Link>
      <h1 className="mt-6 mb-8 font-display text-4xl font-extrabold text-ink">
        Edit {person.first_name} {person.last_name}
      </h1>
      <PersonForm action={update} person={person as Person} households={(households ?? []) as Household[]} />
    </div>
  );
}
