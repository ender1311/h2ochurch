import type { Metadata } from "next";
import { Render } from "@measured/puck";
import { getPublishedPage } from "@/lib/cms/actions/pages";
import { config } from "@/lib/puck/config";
import { DefaultWhoWeAre } from "./DefaultWhoWeAre";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Who We Are — H2O Church",
  description:
    "H2O is a local church cultivating a Christlike community at Ohio State — a church of Tov (goodness) shaped by four core values.",
};

export default async function WhoWeArePage() {
  const data = await getPublishedPage("who-we-are");
  if (!data) return <DefaultWhoWeAre />;
  return (
    <main>
      <Render config={config} data={data} />
    </main>
  );
}
