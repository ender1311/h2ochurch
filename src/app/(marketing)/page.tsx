import { Render } from "@measured/puck";
import { getPublishedPage } from "@/lib/cms/actions/pages";
import { config } from "@/lib/puck/config";
import { DefaultHome } from "./DefaultHome";

export const dynamic = "force-dynamic";

export default async function Home() {
  const data = await getPublishedPage("home");
  if (!data) return <DefaultHome />;
  return (
    <main id="top">
      <Render config={config} data={data} />
    </main>
  );
}
