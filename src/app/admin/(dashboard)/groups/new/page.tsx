import Link from "next/link";
import { createGroup } from "@/lib/cms/actions/groups";
import { GroupForm } from "../GroupForm";

export const metadata = { title: "New group — H2O Hub" };

export default function NewGroupPage() {
  return (
    <div>
      <Link href="/admin/groups" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to groups
      </Link>
      <h1 className="mt-6 mb-8 font-display text-4xl font-extrabold text-ink">New group</h1>
      <GroupForm action={createGroup} />
    </div>
  );
}
