import Link from "next/link";
import { createAdminClient } from "@/utils/supabase/admin";
import { createPerson } from "@/lib/cms/actions/people";
import { PersonForm } from "../PersonForm";
import type { Household } from "@/lib/cms/types";

export const dynamic = "force-dynamic";
export const metadata = { title: "New person — H2O Hub" };

export default async function NewPersonPage() {
  const supabase = createAdminClient();
  const { data } = await supabase.from("households").select("*").order("name");
  const households = (data ?? []) as Household[];

  return (
    <div>
      <Link href="/admin/people" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to people
      </Link>
      <h1 className="mt-6 mb-8 font-display text-4xl font-extrabold text-ink">New person</h1>
      <PersonForm action={createPerson} households={households} />
    </div>
  );
}
