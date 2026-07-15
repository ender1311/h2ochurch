/** Email domain allowed to self-register for staff access. */
export const STAFF_SIGNUP_DOMAIN = "@h2osu.org";

/** Whether an email may create a self-serve staff account. */
export function isStaffSignupEmail(email: string): boolean {
  return email.trim().toLowerCase().endsWith(STAFF_SIGNUP_DOMAIN);
}
