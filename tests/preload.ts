import { mock } from "bun:test";

// `server-only` throws outside a React Server Component graph. Tests exercise
// server modules directly, so neutralize the guard (it still protects prod).
mock.module("server-only", () => ({}));
