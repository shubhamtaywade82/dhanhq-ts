export interface DhanClientConfig {
  token?: string;
  clientId: string;
  tokenProvider?: () => Promise<string> | string;
  onTokenExpired?: (error: unknown) => Promise<void> | void;
  baseURL?: string;
  timeoutMs?: number;
  rateLimitMinTimeMs?: number;
  wsUrl?: string;
  marketFeedUrl?: string;
  orderUpdateUrl?: string;
  wsReconnectDelayMs?: number;
  wsOrderUserType?: "SELF" | "PARTNER";
  partnerId?: string;
  partnerSecret?: string;
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
