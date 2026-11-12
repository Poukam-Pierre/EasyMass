import { applyDecorators, UseGuards } from '@nestjs/common';
import { Throttle, ThrottlerGuard } from '@nestjs/throttler';

/** Per-client-IP rate limit for a public route whose security rests on a
 * secret that must not be brute-forceable (a password, an emailed token,
 * an unguessable reference). Opt-in per route — the throttler is not a
 * global guard, so authenticated routes are unaffected. Relies on
 * `trust proxy` (see main.ts) so the IP is the caller's, not Caddy's. */
export function RateLimited(limit: number, ttlMs = 60_000) {
  return applyDecorators(
    UseGuards(ThrottlerGuard),
    Throttle({ default: { limit, ttl: ttlMs } })
  );
}
