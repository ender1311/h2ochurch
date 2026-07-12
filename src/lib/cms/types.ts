export type PersonStatus = "active" | "inactive" | "prospect";
export type GroupVisibility = "listed" | "unlisted";
export type MembershipRole = "leader" | "member";

export type Person = {
  id: string;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  status: PersonStatus;
  campus: string | null;
  notes: string | null;
  created_at: string;
  updated_at: string;
};

export type Group = {
  id: string;
  name: string;
  slug: string | null;
  group_type_id: string | null;
  description: string | null;
  schedule: string | null;
  location: string | null;
  visibility: GroupVisibility;
  image_url: string | null;
  created_at: string;
  updated_at: string;
};

export type GroupType = {
  id: string;
  name: string;
  created_at: string;
};

export type GroupMembership = {
  id: string;
  group_id: string;
  person_id: string;
  role: MembershipRole;
  joined_at: string;
};
