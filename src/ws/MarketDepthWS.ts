import WebSocket from "ws";

import { AuthResolver } from "../auth";
import type { InstrumentSubscription } from "../types/common.types";
import type {
  MarketDepthEvent,
  MarketDepthMode,
  MarketDepthWSOptions,
  WebSocketLike,
} from "../types/ws.types";
import { BaseWS } from "./BaseWS";
import { parseMarketDepthPacket } from "./parsers/marketDepth200";

export class MarketDepthWS extends BaseWS {
  private readonly subscriptions = new Map<string, InstrumentSubscription>();
  private readonly mode: MarketDepthMode;

  constructor(options: MarketDepthWSOptions) {
    const authResolver = new AuthResolver({
      token: options.token,
      tokenProvider: options.tokenProvider,
      clientId: options.clientId,
    });

    const mode = options.mode ?? "twenty";

    super(
      async () =>
        options.url ??
        buildMarketDepthUrl(
          await authResolver.resolveAccessToken(),
          options.clientId,
          mode,
        ),
      options.reconnectDelayMs ?? 1000,
      options.webSocketFactory ?? defaultFactory,
      options.maxReconnectDelayMs,
      options.maxReconnectAttempts,
    );

    this.mode = mode;
  }

  public subscribe(instruments: InstrumentSubscription[]): void {
    for (const instrument of instruments) {
      this.subscriptions.set(this.subscriptionKey(instrument), instrument);
    }

    if (this.isConnected) {
      this.sendSubscription(instruments);
    }
  }

  public unsubscribe(instruments: InstrumentSubscription[]): void {
    for (const instrument of instruments) {
      this.subscriptions.delete(this.subscriptionKey(instrument));
    }
  }

  public getSubscriptions(): InstrumentSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  protected onOpen(): void {
    this.emit("open");
    const subscriptions = this.getSubscriptions();

    if (subscriptions.length > 0) {
      this.sendSubscription(subscriptions);
    }
  }

  protected onMessage(data: unknown): void {
    const buffer = toBuffer(data);
    if (!buffer) {
      return;
    }

    const events: MarketDepthEvent[] = parseMarketDepthPacket(
      buffer,
      this.mode,
      this.getSubscriptions(),
    );

    for (const event of events) {
      this.emit("depth", event);
      if (this.mode === "twenty") {
        this.emit("depth20", event);
      } else {
        this.emit("depth200", event);
      }
    }
  }

  protected onClose(): void {
    this.emit("close");
  }

  private sendSubscription(instruments: InstrumentSubscription[]): void {
    if (this.mode === "twenty") {
      const batchSize = 100;
      for (let index = 0; index < instruments.length; index += batchSize) {
        const batch = instruments.slice(index, index + batchSize);
        this.send(
          JSON.stringify({
            RequestCode: 23,
            InstrumentCount: batch.length,
            InstrumentList: batch.map((instrument) => ({
              ExchangeSegment: instrument.exchangeSegment,
              SecurityId: instrument.securityId,
            })),
          }),
        );
      }
    } else {
      // 200-level depth: 1 instrument per connection
      const single = instruments[0];
      if (single) {
        this.send(
          JSON.stringify({
            RequestCode: 23,
            ExchangeSegment: single.exchangeSegment,
            SecurityId: single.securityId,
          }),
        );
      }
    }
  }

  private subscriptionKey(instrument: InstrumentSubscription): string {
    return `${instrument.exchangeSegment}:${instrument.securityId}`;
  }
}

function buildMarketDepthUrl(
  token: string,
  clientId: string,
  mode: MarketDepthMode,
): string {
  const host =
    mode === "twenty"
      ? "wss://depth-api-feed.dhan.co/twentydepth"
      : "wss://full-depth-api.dhan.co/twohundreddepth";

  return `${host}?version=2&token=${encodeURIComponent(
    token,
  )}&clientId=${encodeURIComponent(clientId)}&authType=2`;
}

function defaultFactory(url: string): WebSocketLike {
  return new WebSocket(url);
}

function toBuffer(data: unknown): Buffer | null {
  if (Buffer.isBuffer(data)) {
    return data;
  }
  if (typeof data === "string") {
    return Buffer.from(data);
  }
  if (Array.isArray(data) && data.every((item) => Buffer.isBuffer(item))) {
    return Buffer.concat(data);
  }
  if (data instanceof ArrayBuffer) {
    return Buffer.from(data);
  }
  if (ArrayBuffer.isView(data)) {
    return Buffer.from(data.buffer, data.byteOffset, data.byteLength);
  }
  return null;
}
