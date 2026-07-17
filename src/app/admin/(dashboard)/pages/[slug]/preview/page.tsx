import { Render } from "@measured/puck";
import { getPageDraft } from "@/lib/cms/actions/pages";
import { config } from "@/lib/puck/config";

export const dynamic = "force-dynamic";
export const metadata = { title: "Preview — H2O Hub" };

export default async function PreviewPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const data = await getPageDraft(slug);
  return <Render config={config} data={data} />;
}
