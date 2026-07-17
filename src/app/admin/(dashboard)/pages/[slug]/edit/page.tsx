import { getPageDraft } from "@/lib/cms/actions/pages";
import { Editor } from "./Editor";

export const metadata = { title: "Edit page — H2O Hub" };

export default async function EditPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPageDraft(slug);
  return <Editor slug={slug} data={data} />;
}
