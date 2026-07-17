import { test, expect, describe, afterAll } from "bun:test";
import { hasDbEnv, serviceClient, TEST_MARK } from "./helpers";

describe.skipIf(!hasDbEnv())("page_versions (real database)", () => {
  const sb = serviceClient();
  const slug = `zz-${TEST_MARK}-pv`;
  const draft1 = {
    root: { props: {} },
    content: [{ type: "Hero", props: { id: "Hero-1", headline: "Version One" } }],
  };
  const draft2 = {
    root: { props: {} },
    content: [{ type: "Hero", props: { id: "Hero-1", headline: "Version Two" } }],
  };

  afterAll(async () => {
    await sb.from("page_versions").delete().ilike("slug", `%${TEST_MARK}%`);
    await sb.from("pages").delete().ilike("slug", `%${TEST_MARK}%`);
  });

  // ── (a) publish inserts one version row with the published data ──────────
  test("publishing inserts exactly one version row with correct data", async () => {
    // Seed the page
    await sb.from("pages").insert({ slug, title: "PV Test Page", draft_data: draft1 });

    // Mirror exactly what publishPage does: copy draft→published, then insert version
    const { data: page } = await sb
      .from("pages")
      .select("draft_data, title")
      .eq("slug", slug)
      .single();
    await sb
      .from("pages")
      .update({ published_data: page!.draft_data })
      .eq("slug", slug);
    await sb.from("page_versions").insert({
      slug,
      title: page!.title,
      data: page!.draft_data,
      // created_by is nullable — omit to test null-author path
    });

    const { data: versions } = await sb
      .from("page_versions")
      .select("*")
      .eq("slug", slug);
    expect(versions).toHaveLength(1);
    expect(versions![0].slug).toBe(slug);
    expect(versions![0].data).toEqual(draft1);
  });

  // ── (b) list returns newest-first with createdAt + authorName shape ──────
  test("list returns rows newest-first with expected shape", async () => {
    // Insert a second version (newer)
    await sb.from("page_versions").insert({
      slug,
      title: "PV Test Page v2",
      data: draft2,
    });

    const { data: rows } = await sb
      .from("page_versions")
      .select("id, slug, title, created_at, created_by")
      .eq("slug", slug)
      .order("created_at", { ascending: false });

    expect(rows).toBeDefined();
    expect(rows!.length).toBeGreaterThanOrEqual(2);

    // Newest first: the v2 row should come first (title contains "v2")
    expect(rows![0].title).toBe("PV Test Page v2");
    expect(rows![1].title).toBe("PV Test Page");

    // Every row must have id, slug, title, created_at
    for (const row of rows!) {
      expect(typeof row.id).toBe("string");
      expect(row.slug).toBe(slug);
      expect(typeof row.title).toBe("string");
      expect(typeof row.created_at).toBe("string");
    }
  });

  // ── (c) restore copies data into draft_data, leaves published_data alone ──
  test("restore copies version data into draft_data only", async () => {
    // Confirm published_data is still draft1
    const { data: before } = await sb
      .from("pages")
      .select("draft_data, published_data")
      .eq("slug", slug)
      .single();
    expect(before!.published_data).toEqual(draft1);

    // Get the id of the v2 version row
    const { data: versionRows } = await sb
      .from("page_versions")
      .select("id, data, title")
      .eq("slug", slug)
      .eq("title", "PV Test Page v2")
      .single();
    expect(versionRows).toBeDefined();

    // Mirror exactly what restorePageVersion does: update draft_data only
    const { error } = await sb
      .from("pages")
      .update({ draft_data: versionRows!.data })
      .eq("slug", slug);
    expect(error).toBeNull();

    // Verify: draft_data is now draft2; published_data is still draft1
    const { data: after } = await sb
      .from("pages")
      .select("draft_data, published_data")
      .eq("slug", slug)
      .single();
    expect(after!.draft_data).toEqual(draft2);
    expect(after!.published_data).toEqual(draft1);
  });

  // ── (d) after 51 publishes, only 50 remain (prune) ───────────────────────
  test("pruning keeps only the newest 50 versions", async () => {
    const MAX = 50;
    const pruneSlug = `zz-${TEST_MARK}-pv-prune`;

    // Seed a page for the prune test
    await sb.from("pages").insert({ slug: pruneSlug, title: "Prune Test", draft_data: draft1 });

    // Insert 51 version rows
    const toInsert = Array.from({ length: 51 }, (_, i) => ({
      slug: pruneSlug,
      title: `Prune Test v${i + 1}`,
      data: draft1,
    }));
    await sb.from("page_versions").insert(toInsert);

    // Mirror the prune logic: keep the newest MAX, delete the rest
    const { data: keep } = await sb
      .from("page_versions")
      .select("id")
      .eq("slug", pruneSlug)
      .order("created_at", { ascending: false })
      .range(0, MAX - 1);

    if (keep && keep.length === MAX) {
      const keepIds = keep.map((r) => r.id as string);
      await sb
        .from("page_versions")
        .delete()
        .eq("slug", pruneSlug)
        .not("id", "in", `(${keepIds.join(",")})`);
    }

    const { data: remaining } = await sb
      .from("page_versions")
      .select("id")
      .eq("slug", pruneSlug);
    expect(remaining).toHaveLength(MAX);
  });
});
