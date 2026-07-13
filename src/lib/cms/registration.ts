export type RegistrationStatus = "registered" | "waitlisted";

/**
 * Planning Center-style capacity behavior: once active registrations reach
 * capacity, new signups are waitlisted instead of rejected. Null/0 capacity
 * means unlimited.
 */
export function decideRegistrationStatus(
  capacity: number | null,
  activeCount: number,
): RegistrationStatus {
  if (!capacity || capacity <= 0) return "registered";
  return activeCount >= capacity ? "waitlisted" : "registered";
}

export function spotsLeft(capacity: number | null, activeCount: number): number | null {
  if (!capacity || capacity <= 0) return null;
  return Math.max(0, capacity - activeCount);
}
