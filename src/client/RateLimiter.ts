import Bottleneck from "bottleneck";

export interface RateLimiterConfig {
  minTime?: number;
}

export class RateLimiter {
  private readonly readLimiter: Bottleneck;
  private readonly writeLimiter: Bottleneck;

  constructor(config: RateLimiterConfig = {}) {
    const minTime = config.minTime ?? 120;

    this.readLimiter = new Bottleneck({ minTime });
    this.writeLimiter = new Bottleneck({ minTime });
  }

  public scheduleRead<T>(task: () => Promise<T>): Promise<T> {
    return this.readLimiter.schedule(task);
  }

  public scheduleWrite<T>(task: () => Promise<T>): Promise<T> {
    return this.writeLimiter.schedule(task);
  }
}
