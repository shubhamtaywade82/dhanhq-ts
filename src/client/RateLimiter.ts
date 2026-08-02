import Bottleneck from "bottleneck";

import { RATE_LIMITS, type ApiTier } from "../constants";

export interface RateLimiterConfig {
  minTime?: number;
}

/** Spaces calls at least `1000 / perSecond` ms apart, e.g. option chain's 1-per-3s. */
function tierMinTime(perSecond: number): number {
  return Math.ceil(1000 / perSecond);
}

/**
 * Enforces Dhan's per-endpoint rate limits (`RATE_LIMITS`) on top of the
 * generic read/write queue. A request with a `tier` waits on both: the
 * generic queue first, then that tier's own, stricter spacing — so e.g. an
 * option-chain call is still at least 3s behind the *previous option-chain
 * call*, regardless of how many other requests are in flight.
 */
export class RateLimiter {
  private readonly readLimiter: Bottleneck;
  private readonly writeLimiter: Bottleneck;
  private readonly tierLimiters: Record<ApiTier, Bottleneck>;

  constructor(config: RateLimiterConfig = {}) {
    const minTime = config.minTime ?? 120;

    this.readLimiter = new Bottleneck({ minTime });
    this.writeLimiter = new Bottleneck({ minTime });

    this.tierLimiters = Object.fromEntries(
      (Object.keys(RATE_LIMITS) as ApiTier[]).map((tier) => [
        tier,
        new Bottleneck({ minTime: tierMinTime(RATE_LIMITS[tier].perSecond) }),
      ]),
    ) as Record<ApiTier, Bottleneck>;
  }

  public scheduleRead<T>(task: () => Promise<T>): Promise<T> {
    return this.readLimiter.schedule(task);
  }

  public scheduleWrite<T>(task: () => Promise<T>): Promise<T> {
    return this.writeLimiter.schedule(task);
  }

  public scheduleTier<T>(
    tier: ApiTier,
    isWrite: boolean,
    task: () => Promise<T>,
  ): Promise<T> {
    const generic = isWrite ? this.writeLimiter : this.readLimiter;
    return generic.schedule(() => this.tierLimiters[tier].schedule(task));
  }
}
