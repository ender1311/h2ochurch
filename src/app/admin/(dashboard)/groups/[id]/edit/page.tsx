import Link from "next/link";
import { notFound } from "next/navigation";
import { createAdminClient } from "@/utils/supabase/admin";
import { updateGroup } from "@/lib/cms/actions/groups";
import { GroupForm } from "../../GroupForm";
import type { Group } from "@/lib/cms/types";

export const dynamic = "force-dynamic";

export default async function EditGroupPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const supabase = createAdminClient();
  const { data: group } = await supabase.from("groups").select("*").eq("id", id).single();
  if (!group) notFound();

  const update = updateGroup.bind(null, id);

  return (
    <div>
      <Link href={`/admin/groups/${id}`} className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to group
      </Link>
      <h1 className="mt-6 mb-8 font-display text-4xl font-extrabold text-ink">Edit {group.name}</h1>
      <GroupForm action={update} group={group as Group} />
    </div>
  );
}
