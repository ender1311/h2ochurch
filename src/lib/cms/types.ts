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
  household_id: string | null;
  address: string | null;
  birthdate: string | null;
  tags: string[];
  created_at: string;
  updated_at: string;
};

export type Household = {
  id: string;
  name: string;
  created_at: string;
};

export type FieldDefinition = {
  id: string;
  key: string;
  label: string;
  kind: string;
  created_at: string;
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

export type EventRow = {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
  starts_at: string | null;
  ends_at: string | null;
  location: string | null;
  capacity: number | null;
  cost_cents: number;
  registration_open: boolean;
  visibility: GroupVisibility;
  created_at: string;
  updated_at: string;
};

export type EventRegistration = {
  id: string;
  event_id: string;
  person_id: string | null;
  first_name: string;
  last_name: string;
  email: string | null;
  phone: string | null;
  responses: Record<string, unknown>;
  status: string;
  created_at: string;
};

export type Fund = {
  id: string;
  name: string;
  created_at: string;
};

export type Donation = {
  id: string;
  person_id: string | null;
  fund_id: string | null;
  amount_cents: number;
  method: string;
  note: string | null;
  donated_on: string;
  created_at: string;
};

export type CheckinSession = {
  id: string;
  name: string;
  group_id: string | null;
  event_id: string | null;
  session_date: string;
  created_at: string;
};

export type CalendarEvent = {
  id: string;
  title: string;
  description: string | null;
  starts_at: string;
  ends_at: string | null;
  all_day: boolean;
  location: string | null;
  created_at: string;
  updated_at: string;
};
