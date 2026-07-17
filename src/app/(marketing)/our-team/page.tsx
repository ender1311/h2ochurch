import type { Metadata } from "next";
import { Render } from "@measured/puck";
import { getPublishedPage } from "@/lib/cms/actions/pages";
import { config } from "@/lib/puck/config";
import { DefaultOurTeam } from "./DefaultOurTeam";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "Our Team — H2O Church",
  description: "Meet the team that helps H2O Church live life together in community at Ohio State.",
};

export default async function OurTeamPage() {
  const data = await getPublishedPage("our-team");
  if (!data) return <DefaultOurTeam />;
  return (
    <main>
      <Render config={config} data={data} />
    </main>
  );
}
