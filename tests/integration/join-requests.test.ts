import { test, expect, describe, afterAll } from "bun:test";
import { hasDbEnv, serviceClient, cleanup, TEST_MARK } from "./helpers";
import {
  createJoinRequest,
  approveJoinRequest,
  declineJoinRequest,
} from "../../src/lib/cms/join-requests";

describe.skipIf(!hasDbEnv())("group join request flow", () => {
  const supabase = serviceClient();

  afterAll(async () => {
    await cleanup(supabase);
  });

  async function makeGroup(name: string): Promise<string> {
    const { data } = await supabase
      .from("groups")
      .insert({ name: `${name} ${TEST_MARK}` })
      .select("id")
      .single();
    return data!.id;
  }

  test("approve creates a new person and membership", async () => {
    const groupId = await makeGroup("JR New Person");
    const email = `newcomer-${Date.now()}@${TEST_MARK}.example.com`;

    const requestId = await createJoinRequest(supabase, {
      groupId,
      firstName: "Nora",
      lastName: `Newcomer ${TEST_MARK}`,
      email,
      message: "Excited to join!",
    });

    const personId = await approveJoinRequest(supabase, requestId);

    const { data: person } = await supabase
      .from("people")
      .select("email, status")
      .eq("id", personId)
      .single();
    expect(person?.email).toBe(email);
    expect(person?.status).toBe("prospect");

    const { count } = await supabase
      .from("group_memberships")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId)
      .eq("person_id", personId);
    expect(count).toBe(1);

    const { data: req } = await supabase
      .from("group_join_requests")
      .select("status, person_id")
      .eq("id", requestId)
      .single();
    expect(req?.status).toBe("approved");
    expect(req?.person_id).toBe(personId);
  });

  test("approve links an existing person by email instead of duplicating", async () => {
    const groupId = await makeGroup("JR Existing Person");
    const email = `existing-${Date.now()}@${TEST_MARK}.example.com`;
    const { data: existing } = await supabase
      .from("people")
      .insert({ first_name: "Iris", last_name: `Existing ${TEST_MARK}`, email })
      .select("id")
      .single();

    const requestId = await createJoinRequest(supabase, {
      groupId,
      firstName: "Iris",
      lastName: `Existing ${TEST_MARK}`,
      email: email.toUpperCase(), // normalization check
    });
    const personId = await approveJoinRequest(supabase, requestId);
    expect(personId).toBe(existing!.id);

    const { count } = await supabase
      .from("people")
      .select("*", { count: "exact", head: true })
      .eq("email", email);
    expect(count).toBe(1);
  });

  test("approving twice does not duplicate the membership", async () => {
    const groupId = await makeGroup("JR Double Approve");
    const requestId = await createJoinRequest(supabase, {
      groupId,
      firstName: "Dee",
      lastName: `Double ${TEST_MARK}`,
      email: `double-${Date.now()}@${TEST_MARK}.example.com`,
    });

    const personId1 = await approveJoinRequest(supabase, requestId);
    const personId2 = await approveJoinRequest(supabase, requestId);
    expect(personId2).toBe(personId1);

    const { count } = await supabase
      .from("group_memberships")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);
    expect(count).toBe(1);
  });

  test("decline marks the request and adds nothing", async () => {
    const groupId = await makeGroup("JR Decline");
    const requestId = await createJoinRequest(supabase, {
      groupId,
      firstName: "Ned",
      lastName: `Nope ${TEST_MARK}`,
    });

    await declineJoinRequest(supabase, requestId);

    const { data: req } = await supabase
      .from("group_join_requests")
      .select("status")
      .eq("id", requestId)
      .single();
    expect(req?.status).toBe("declined");

    const { count } = await supabase
      .from("group_memberships")
      .select("*", { count: "exact", head: true })
      .eq("group_id", groupId);
    expect(count).toBe(0);
  });
});
