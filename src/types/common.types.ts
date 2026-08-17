import type { CircuitBreakerOptions } from "../client/CircuitBreaker";

export interface DhanClientConfig {
  token?: string;
  clientId: string;
  tokenProvider?: () => Promise<string> | string;
  onTokenExpired?: (error: unknown) => Promise<void> | void;
  baseURL?: string;
  timeoutMs?: number;
  rateLimitMinTimeMs?: number;
  /**
   * Trips after consecutive network/5xx failures so a struggling backend
   * doesn't get hammered by every in-flight caller. Pass `false` to disable.
   */
  circuitBreaker?: CircuitBreakerOptions | false;
  wsUrl?: string;
  marketFeedUrl?: string;
  orderUpdateUrl?: string;
  wsReconnectDelayMs?: number;
  wsOrderUserType?: "SELF" | "PARTNER";
  partnerId?: string;
  partnerSecret?: string;
  /** How long a parsed scrip-master segment stays cached. Defaults to 1 hour. */
  instrumentCacheTtlMs?: number;
}

export interface CorrelatedRequest {
  correlationId?: string;
}

export interface OrderOperationResult<T> {
  correlationId: string;
  data: T;
}

export interface InstrumentSubscription {
  securityId: string;
  exchangeSegment: string;
}

export interface TickEvent extends InstrumentSubscription {
  ltp?: number;
  timestamp?: number;
  raw: unknown;
}
