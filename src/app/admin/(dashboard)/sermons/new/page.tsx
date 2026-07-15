import Link from "next/link";
import { createSermon } from "@/lib/cms/actions/sermons";
import { SermonForm } from "../SermonForm";

export const metadata = { title: "New sermon — H2O Hub" };

export default function NewSermonPage() {
  return (
    <div>
      <Link href="/admin/sermons" className="text-sm font-semibold text-ink/50 hover:text-brand">
        ← Back to sermons
      </Link>
      <h1 className="mt-6 mb-8 font-display text-4xl font-extrabold text-ink">New sermon</h1>
      <SermonForm action={createSermon} />
    </div>
  );
}
