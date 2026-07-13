import { test, expect, describe } from "bun:test";
import "./helpers"; // loads .env.local
import { POST } from "../../src/app/api/webhooks/stripe/route";

function webhookRequest(body: string, headers: Record<string, string> = {}): Request {
  return new Request("http://localhost/api/webhooks/stripe", {
    method: "POST",
    headers,
    body,
  });
}

describe("stripe webhook route", () => {
  test("503 when Stripe is not configured", async () => {
    const savedKey = process.env.STRIPE_SECRET_KEY;
    const savedSecret = process.env.STRIPE_WEBHOOK_SECRET;
    delete process.env.STRIPE_SECRET_KEY;
    delete process.env.STRIPE_WEBHOOK_SECRET;
    try {
      const res = await POST(webhookRequest("{}"));
      expect(res.status).toBe(503);
    } finally {
      if (savedKey) process.env.STRIPE_SECRET_KEY = savedKey;
      if (savedSecret) process.env.STRIPE_WEBHOOK_SECRET = savedSecret;
    }
  });

  test.skipIf(!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)(
    "400 when the signature header is missing",
    async () => {
      const res = await POST(webhookRequest("{}"));
      expect(res.status).toBe(400);
    },
  );

  test.skipIf(!process.env.STRIPE_SECRET_KEY || !process.env.STRIPE_WEBHOOK_SECRET)(
    "400 for a forged signature",
    async () => {
      const res = await POST(
        webhookRequest(JSON.stringify({ type: "checkout.session.completed" }), {
          "stripe-signature": "t=123,v1=deadbeef",
        }),
      );
      expect(res.status).toBe(400);
    },
  );
});
