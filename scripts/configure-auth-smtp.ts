/**
 * Configure Supabase Auth to send email through Resend SMTP, and allow the
 * invite redirect target. Reads secrets from env (Bun auto-loads .env.local):
 *
 *   SUPABASE_ACCESS_TOKEN   Supabase Management API token (sbp_...)
 *   RESEND_API_KEY          Resend API key (used as the SMTP password)
 *   RESEND_FROM             Verified sender, e.g. "noreply@h2ocolumbus.org"
 *   NEXT_PUBLIC_SITE_URL    Production URL (default https://h2ochurch.vercel.app)
 *
 *   bun scripts/configure-auth-smtp.ts
 */
export {};

const PROJECT_REF = "gghzuksbyjnxcharilrj";

const token = process.env.SUPABASE_ACCESS_TOKEN;
const resendKey = process.env.RESEND_API_KEY;
const from = process.env.RESEND_FROM ?? "onboarding@resend.dev";
const site = process.env.NEXT_PUBLIC_SITE_URL ?? "https://h2ochurch.vercel.app";

if (!token || !resendKey) {
  console.error("Missing SUPABASE_ACCESS_TOKEN or RESEND_API_KEY in env (.env.local).");
  process.exit(1);
}

const body = {
  smtp_host: "smtp.resend.com",
  smtp_port: 465,
  smtp_user: "resend",
  smtp_pass: resendKey,
  smtp_admin_email: from,
  smtp_sender_name: "H2O Church",
  smtp_max_frequency: 1,
  site_url: site,
  uri_allow_list: `${site}/**,http://localhost:3000/**`,
};

const res = await fetch(`https://api.supabase.com/v1/projects/${PROJECT_REF}/config/auth`, {
  method: "PATCH",
  headers: {
    Authorization: `Bearer ${token}`,
    "Content-Type": "application/json",
  },
  body: JSON.stringify(body),
});

if (!res.ok) {
  console.error(`Failed (${res.status}):`, await res.text());
  process.exit(1);
}

const cfg = (await res.json()) as Record<string, unknown>;
console.log("✓ Supabase Auth SMTP configured.");
console.log("  smtp_host:", cfg.smtp_host);
console.log("  sender:", cfg.smtp_admin_email);
console.log("  site_url:", cfg.site_url);
console.log("  redirect allow list:", cfg.uri_allow_list);
