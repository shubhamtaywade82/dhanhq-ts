import { EventEmitter } from "events";
import WebSocket from "ws";

import type {
  InstrumentSubscription,
  TickEvent,
} from "../types/common.types";

interface DhanWSOptions {
  token: string;
  clientId: string;
  url?: string;
  webSocketFactory?: (url: string) => WebSocketLike;
}

interface WebSocketLike {
  on(event: string, listener: (...args: unknown[]) => void): unknown;
  send(data: string): unknown;
  close(): unknown;
}

type ConnectionState = "idle" | "connecting" | "open" | "closed";

export class DhanWS extends EventEmitter {
  private readonly token: string;
  private readonly clientId: string;
  private readonly url: string;
  private readonly webSocketFactory: (url: string) => WebSocketLike;
  private readonly subscriptions = new Map<string, InstrumentSubscription>();
  private connection?: WebSocketLike;
  private state: ConnectionState = "idle";

  constructor(options: DhanWSOptions) {
    super();
    this.token = options.token;
    this.clientId = options.clientId;
    this.url = options.url ?? "wss://api-feed.dhan.co";
    this.webSocketFactory =
      options.webSocketFactory ?? ((url) => new WebSocket(url));
  }

  public connect(): void {
    if (this.state === "connecting" || this.state === "open") {
      return;
    }

    this.state = "connecting";
    this.connection = this.webSocketFactory(this.url);
    this.bindConnection(this.connection);
  }

  public disconnect(): void {
    this.state = "closed";
    this.connection?.close();
  }

  public subscribe(instruments: InstrumentSubscription[]): void {
    for (const instrument of instruments) {
      this.subscriptions.set(this.subscriptionKey(instrument), instrument);
    }

    this.send({
      action: "subscribe",
      instruments,
    });
  }

  public unsubscribe(instruments: InstrumentSubscription[]): void {
    for (const instrument of instruments) {
      this.subscriptions.delete(this.subscriptionKey(instrument));
    }

    this.send({
      action: "unsubscribe",
      instruments,
    });
  }

  public getSubscriptions(): InstrumentSubscription[] {
    return Array.from(this.subscriptions.values());
  }

  private bindConnection(connection: WebSocketLike): void {
    connection.on("open", () => {
      this.state = "open";
      this.emit("open");
      this.send({
        action: "authenticate",
        token: this.token,
        clientId: this.clientId,
      });

      const subscriptions = this.getSubscriptions();
      if (subscriptions.length > 0) {
        this.send({
          action: "subscribe",
          instruments: subscriptions,
        });
      }
    });

    connection.on("message", (data: unknown) => {
      const tick = this.toTickEvent(data);
      this.emit("tick", tick);
    });

    connection.on("error", (error: unknown) => {
      this.emit("error", error);
    });

    connection.on("close", () => {
      this.state = "closed";
      this.emit("close");
    });
  }

  private send(payload: Record<string, unknown>): void {
    if (this.state !== "open" || !this.connection) {
      return;
    }

    this.connection.send(JSON.stringify(payload));
  }

  private toTickEvent(payload: unknown): TickEvent {
    if (
      typeof payload === "string" &&
      this.looksLikeJson(payload)
    ) {
      const parsed = JSON.parse(payload) as Record<string, unknown>;

      return {
        securityId: String(parsed.securityId ?? ""),
        exchangeSegment: String(parsed.exchangeSegment ?? ""),
        ltp:
          typeof parsed.ltp === "number"
            ? parsed.ltp
            : undefined,
        timestamp:
          typeof parsed.timestamp === "number"
            ? parsed.timestamp
            : undefined,
        raw: parsed,
      };
    }

    return {
      securityId: "",
      exchangeSegment: "",
      raw: payload,
    };
  }

  private looksLikeJson(value: string): boolean {
    return value.startsWith("{") && value.endsWith("}");
  }

  private subscriptionKey(instrument: InstrumentSubscription): string {
    return `${instrument.exchangeSegment}:${instrument.securityId}`;
  }
}
