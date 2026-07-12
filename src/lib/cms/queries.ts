import "server-only";
import { createAdminClient } from "@/utils/supabase/admin";
import type { Group, GroupMembership, Person } from "./types";

export async function getStats() {
  const supabase = createAdminClient();
  const [people, groups, memberships] = await Promise.all([
    supabase.from("people").select("*", { count: "exact", head: true }),
    supabase.from("groups").select("*", { count: "exact", head: true }),
    supabase.from("group_memberships").select("*", { count: "exact", head: true }),
  ]);
  return {
    people: people.count ?? 0,
    groups: groups.count ?? 0,
    memberships: memberships.count ?? 0,
  };
}

export async function listPeople(search?: string): Promise<Person[]> {
  const supabase = createAdminClient();
  let query = supabase
    .from("people")
    .select("*")
    .order("last_name", { ascending: true })
    .order("first_name", { ascending: true })
    .limit(500);

  const term = search?.trim();
  if (term) {
    const like = `%${term}%`;
    query = query.or(
      `first_name.ilike.${like},last_name.ilike.${like},email.ilike.${like},phone.ilike.${like}`,
    );
  }

  const { data, error } = await query;
  if (error) throw error;
  return (data ?? []) as Person[];
}

export type PersonWithGroups = Person & {
  groups: { role: string; group: Group }[];
};

export async function getPersonWithGroups(id: string): Promise<PersonWithGroups | null> {
  const supabase = createAdminClient();
  const { data: person, error } = await supabase.from("people").select("*").eq("id", id).single();
  if (error || !person) return null;

  const { data: memberships } = await supabase
    .from("group_memberships")
    .select("role, groups(*)")
    .eq("person_id", id);

  const groups =
    (memberships ?? []).map((m) => ({
      role: (m as { role: string }).role,
      group: (m as unknown as { groups: Group }).groups,
    })) ?? [];

  return { ...(person as Person), groups };
}

export type GroupWithCount = Group & { member_count: number };

export async function listGroupsWithCounts(): Promise<GroupWithCount[]> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("groups")
    .select("*, group_memberships(count)")
    .order("name", { ascending: true });
  if (error) throw error;

  return (data ?? []).map((g) => {
    const counts = (g as unknown as { group_memberships: { count: number }[] }).group_memberships;
    const { group_memberships, ...rest } = g as Group & {
      group_memberships: { count: number }[];
    };
    void group_memberships;
    return { ...(rest as Group), member_count: counts?.[0]?.count ?? 0 };
  });
}

export type GroupWithMembers = Group & {
  members: { role: string; person: Person }[];
};

export async function getGroupWithMembers(id: string): Promise<GroupWithMembers | null> {
  const supabase = createAdminClient();
  const { data: group, error } = await supabase.from("groups").select("*").eq("id", id).single();
  if (error || !group) return null;

  const { data: memberships } = await supabase
    .from("group_memberships")
    .select("role, people(*)")
    .eq("group_id", id);

  const members = (memberships ?? [])
    .map((m) => ({
      role: (m as { role: string }).role,
      person: (m as unknown as { people: Person }).people,
    }))
    .sort((a, b) => a.person.last_name.localeCompare(b.person.last_name));

  return { ...(group as Group), members };
}

export async function listAllPeopleForExport(): Promise<
  (Person & { group_names: string })[]
> {
  const supabase = createAdminClient();
  const { data, error } = await supabase
    .from("people")
    .select("*, group_memberships(groups(name))")
    .order("last_name");
  if (error) throw error;

  return (data ?? []).map((p) => {
    const gm = (p as unknown as { group_memberships: { groups: { name: string } | null }[] })
      .group_memberships;
    const names = (gm ?? [])
      .map((m) => m.groups?.name)
      .filter(Boolean)
      .join(" | ");
    const { group_memberships, ...rest } = p as Person & { group_memberships: unknown };
    void group_memberships;
    return { ...(rest as Person), group_names: names };
  });
}

export type { GroupMembership };
