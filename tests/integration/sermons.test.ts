import { test, expect, describe, afterAll } from "bun:test";
import { hasDbEnv, serviceClient, TEST_MARK } from "./helpers";

// The public /sermons page selects these exact columns and filters published=true.
const PUBLIC_COLUMNS =
  "id,title,speaker,series,scripture,description,audio_url,preached_on,published";

describe.skipIf(!hasDbEnv())("sermons module (real database)", () => {
  const supabase = serviceClient();
  const publishedTitle = `Published Sermon ${TEST_MARK}`;
  const draftTitle = `Draft Sermon ${TEST_MARK}`;

  afterAll(async () => {
    await supabase.from("sermons").delete().ilike("title", `%${TEST_MARK}%`);
  });

  test("insert returns all public columns with the expected shape", async () => {
    const { data, error } = await supabase
      .from("sermons")
      .insert({
        title: publishedTitle,
        speaker: "Tester",
        series: "Test Series",
        scripture: "John 1:1",
        description: "A test sermon.",
        audio_url: "https://example.com/audio.mp3",
        preached_on: "2026-01-01",
        published: true,
      })
      .select(PUBLIC_COLUMNS)
      .single();

    expect(error).toBeNull();
    expect(data).toMatchObject({
      title: publishedTitle,
      speaker: "Tester",
      series: "Test Series",
      scripture: "John 1:1",
      audio_url: "https://example.com/audio.mp3",
      published: true,
    });
  });

  test("public query returns only published sermons", async () => {
    await supabase.from("sermons").insert({ title: draftTitle, published: false });

    const { data, error } = await supabase
      .from("sermons")
      .select(PUBLIC_COLUMNS)
      .eq("published", true)
      .ilike("title", `%${TEST_MARK}%`);

    expect(error).toBeNull();
    const titles = (data ?? []).map((s) => s.title);
    expect(titles).toContain(publishedTitle);
    expect(titles).not.toContain(draftTitle);
  });
});
