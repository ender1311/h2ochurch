import { test, expect, describe, afterAll } from "bun:test";
import { hasDbEnv, serviceClient, TEST_MARK } from "./helpers";

describe.skipIf(!hasDbEnv())("pages module (real database)", () => {
  const sb = serviceClient();
  const slug = `zz-${TEST_MARK}-home`;
  const draft = { root: { props: {} }, content: [{ type: "Hero", props: { id: "Hero-1", headline: "Hi" } }] };

  afterAll(async () => { await sb.from("pages").delete().ilike("slug", `%${TEST_MARK}%`); });

  test("insert draft, publish copies draft to published", async () => {
    await sb.from("pages").insert({ slug, title: "Home", draft_data: draft });
    await sb.from("pages").update({ published_data: draft }).eq("slug", slug);
    const { data } = await sb.from("pages").select("draft_data,published_data").eq("slug", slug).single();
    expect(data!.published_data).toEqual(draft);
    expect(data!.draft_data).toEqual(draft);
  });
});
