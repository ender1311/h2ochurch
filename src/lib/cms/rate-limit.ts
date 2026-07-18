import "server-only";
import { headers } from "next/headers";
import { createAdminClient } from "@/utils/supabase/admin";

/**
 * Fixed-window per-IP rate limit for public (unauthenticated) writes, backed by
 * the rate_limit_hit DB function. Fails OPEN if the limiter itself errors — a
 * limiter outage should never block legitimate giving/registration.
 */
export async function enforceRateLimit(
  action: string,
  limit: number,
  windowSeconds: number,
): Promise<void> {
  let ip = "unknown";
  try {
    const h = await headers();
    ip = (h.get("x-forwarded-for")?.split(",")[0] ?? h.get("x-real-ip") ?? "unknown").trim() || "unknown";
  } catch {
    // headers() unavailable outside a request scope — skip limiting.
    return;
  }
  const supabase = createAdminClient();
  const { data, error } = await supabase.rpc("rate_limit_hit", {
    p_key: `${action}:${ip}`,
    p_limit: limit,
    p_window_seconds: windowSeconds,
  });
  if (error) return;
  if (data === false) {
    throw new Error("Too many requests. Please slow down and try again shortly.");
  }
}
