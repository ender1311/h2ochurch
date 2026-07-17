"use client";
import { Puck, type Data } from "@measured/puck";
import "@measured/puck/puck.css";
import { useRouter } from "next/navigation";
import { config } from "@/lib/puck/config";
import { savePageDraft, publishPage } from "@/lib/cms/actions/pages";

export function Editor({ slug, data }: { slug: string; data: Data }) {
  const router = useRouter();
  return (
    <Puck
      config={config}
      data={data}
      headerTitle={`Editing: ${slug}`}
      onPublish={async (next: Data) => {
        await savePageDraft(slug, next);
        await publishPage(slug);
        router.push("/admin/pages");
      }}
    />
  );
}
