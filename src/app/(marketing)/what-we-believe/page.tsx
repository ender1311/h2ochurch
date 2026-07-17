import type { Metadata } from "next";
import { Render } from "@measured/puck";
import { getPublishedPage } from "@/lib/cms/actions/pages";
import { config } from "@/lib/puck/config";
import { DefaultWhatWeBelieve } from "./DefaultWhatWeBelieve";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "What We Believe — H2O Church",
  description:
    "The core convictions that shape H2O Church — Scripture, the Triune God, Jesus, the Spirit, salvation by grace, and the mission of the Church.",
};

export default async function WhatWeBelievePage() {
  const data = await getPublishedPage("what-we-believe");
  if (!data) return <DefaultWhatWeBelieve />;
  return (
    <main>
      <Render config={config} data={data} />
    </main>
  );
}
