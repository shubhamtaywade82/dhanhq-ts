export interface DhanClientConfig {
  token: string;
  clientId: string;
  baseURL?: string;
  timeoutMs?: number;
  rateLimitMinTimeMs?: number;
  wsUrl?: string;
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
