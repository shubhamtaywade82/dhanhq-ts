import type { InstrumentSubscription } from "./common.types";

export type MarketFeedMode = "ticker" | "quote" | "full";

export interface MarketDepthLevel {
  bidQuantity: number;
  askQuantity: number;
  bidOrders: number;
  askOrders: number;
  bidPrice: number;
  askPrice: number;
}

export interface MarketPacketHeader {
  responseCode: number;
  messageLength: number;
  exchangeSegmentCode: number;
  exchangeSegment: string;
  securityId: string;
}

export interface MarketTickerEvent extends MarketPacketHeader {
  type: "ticker";
  ltp: number;
  ltt: number;
  raw: Buffer;
}

export interface MarketPrevCloseEvent extends MarketPacketHeader {
  type: "prev-close";
  previousClose: number;
  previousOpenInterest: number;
  raw: Buffer;
}

export interface MarketQuoteEvent extends MarketPacketHeader {
  type: "quote";
  ltp: number;
  ltq: number;
  ltt: number;
  atp: number;
  volume: number;
  totalSellQuantity: number;
  totalBuyQuantity: number;
  dayOpen: number;
  dayClose: number;
  dayHigh: number;
  dayLow: number;
  raw: Buffer;
}

export interface MarketOiEvent extends MarketPacketHeader {
  type: "oi";
  openInterest: number;
  raw: Buffer;
}

export interface MarketFullEvent extends MarketPacketHeader {
  type: "full";
  ltp: number;
  ltq: number;
  ltt: number;
  atp: number;
  volume: number;
  totalSellQuantity: number;
  totalBuyQuantity: number;
  openInterest: number;
  highestOpenInterest: number;
  lowestOpenInterest: number;
  dayOpen: number;
  dayClose: number;
  dayHigh: number;
  dayLow: number;
  depth: MarketDepthLevel[];
  raw: Buffer;
}

export interface MarketDisconnectEvent extends MarketPacketHeader {
  type: "disconnect";
  reasonCode: number;
  raw: Buffer;
}

export type MarketFeedEvent =
  | MarketTickerEvent
  | MarketPrevCloseEvent
  | MarketQuoteEvent
  | MarketOiEvent
  | MarketFullEvent
  | MarketDisconnectEvent;

export interface OrderUpdateEvent {
  type: "order_alert";
  data: Record<string, unknown>;
  raw: string;
}

export interface OrderState {
  orderId?: string;
  correlationId?: string;
  status?: string;
  tradedQty?: number;
  averageTradedPrice?: number;
  securityId?: string;
  raw: Record<string, unknown>;
}

export interface MarketDepth20Level {
  price: number;
  qty: number;
  orders: number;
}

export interface MarketDepth20Event {
  type: "depth-20-bid" | "depth-20-ask";
  securityId: string;
  exchangeSegment: string;
  levels: MarketDepth20Level[];
  raw: Buffer;
}

export interface MarketDepth200Event {
  type: "depth-200-bid" | "depth-200-ask";
  securityId: string;
  exchangeSegment: string;
  numRows: number;
  levels: MarketDepth20Level[];
  raw: Buffer;
}

export type MarketDepthEvent = MarketDepth20Event | MarketDepth200Event;
export type MarketDepthMode = "twenty" | "twohundred";

export interface MarketFeedWSOptions {
  token?: string;
  clientId: string;
  url?: string;
  reconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  maxReconnectAttempts?: number;
  mode?: MarketFeedMode;
  webSocketFactory?: (url: string) => WebSocketLike;
  tokenProvider?: () => Promise<string> | string;
}

export interface MarketDepthWSOptions {
  token?: string;
  clientId: string;
  url?: string;
  reconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  maxReconnectAttempts?: number;
  mode?: MarketDepthMode;
  webSocketFactory?: (url: string) => WebSocketLike;
  tokenProvider?: () => Promise<string> | string;
}

export interface OrderUpdateWSOptions {
  token?: string;
  clientId: string;
  url?: string;
  reconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  maxReconnectAttempts?: number;
  webSocketFactory?: (url: string) => WebSocketLike;
  tokenProvider?: () => Promise<string> | string;
  userType?: "SELF" | "PARTNER";
  partnerId?: string;
  partnerSecret?: string;
}

export interface DhanWSOptions {
  token?: string;
  clientId: string;
  marketFeedUrl?: string;
  orderUpdateUrl?: string;
  depthUrl?: string;
  reconnectDelayMs?: number;
  maxReconnectDelayMs?: number;
  maxReconnectAttempts?: number;
  marketSocketFactory?: (url: string) => WebSocketLike;
  orderSocketFactory?: (url: string) => WebSocketLike;
  depthSocketFactory?: (url: string) => WebSocketLike;
  tokenProvider?: () => Promise<string> | string;
  orderUserType?: "SELF" | "PARTNER";
  partnerId?: string;
  partnerSecret?: string;
}

export interface WebSocketLike {
  on(event: string, listener: (...args: unknown[]) => void): unknown;
  send(data: string | Buffer): unknown;
  close(): unknown;
}

export interface StoredSubscription extends InstrumentSubscription {
  mode: MarketFeedMode;
}
