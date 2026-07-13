import "server-only";

export function isEmailConfigured(): boolean {
  return Boolean(process.env.RESEND_API_KEY);
}

function fromAddress(): string {
  return process.env.RESEND_FROM ?? "H2O Church <onboarding@resend.dev>";
}

export async function sendEmail(input: {
  to: string;
  subject: string;
  html: string;
}): Promise<{ id: string }> {
  const key = process.env.RESEND_API_KEY;
  if (!key) throw new Error("Email is not configured (missing RESEND_API_KEY)");

  const res = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${key}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: fromAddress(),
      to: [input.to],
      subject: input.subject,
      html: input.html,
    }),
  });

  const json = (await res.json()) as { id?: string; message?: string };
  if (!res.ok || !json.id) {
    throw new Error(json.message ?? `Email send failed (${res.status})`);
  }
  return { id: json.id };
}

export function inviteEmailHtml(actionLink: string, role: string): string {
  return `<!doctype html>
<html>
  <body style="margin:0;padding:0;background:#f2f5f8;font-family:Helvetica,Arial,sans-serif;">
    <table role="presentation" width="100%" cellpadding="0" cellspacing="0" style="padding:32px 16px;">
      <tr><td align="center">
        <table role="presentation" width="480" cellpadding="0" cellspacing="0" style="background:#ffffff;border-radius:12px;overflow:hidden;">
          <tr>
            <td style="background:#434b56;padding:28px 40px;text-align:center;">
              <div style="color:#ffffff;font-size:26px;font-weight:800;letter-spacing:1px;">H2O</div>
              <div style="color:rgba(255,255,255,0.7);font-size:10px;letter-spacing:6px;margin-top:4px;">CHURCH · HUB</div>
            </td>
          </tr>
          <tr>
            <td style="padding:36px 40px;">
              <h1 style="margin:0;font-size:22px;color:#2b333c;">You're invited to the H2O Hub</h1>
              <p style="margin:14px 0 0;font-size:15px;line-height:1.6;color:#4a5560;">
                You've been added to H2O Church's ministry hub as
                <strong style="color:#2379b6;">${role}</strong>.
                Click below to set your password and get started.
              </p>
              <p style="margin:28px 0;text-align:center;">
                <a href="${actionLink}"
                   style="display:inline-block;background:#2379b6;color:#ffffff;text-decoration:none;font-size:14px;font-weight:700;letter-spacing:1px;padding:14px 34px;border-radius:999px;">
                  ACCEPT INVITE
                </a>
              </p>
              <p style="margin:0;font-size:12px;line-height:1.6;color:#8a939c;">
                This link expires after 24 hours. If you weren't expecting this invite, you can ignore this email.
              </p>
            </td>
          </tr>
          <tr>
            <td style="padding:18px 40px;border-top:1px solid #eef1f4;font-size:11px;color:#a2aab2;">
              H2O Church · 1385 Neil Ave, Columbus, OH 43201
            </td>
          </tr>
        </table>
      </td></tr>
    </table>
  </body>
</html>`;
}
