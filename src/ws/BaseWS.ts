import { EventEmitter } from "events";

import type { WebSocketLike } from "../types/ws.types";

export abstract class BaseWS extends EventEmitter {
  private reconnectTimer?: NodeJS.Timeout;
  protected connection?: WebSocketLike;
  protected manuallyClosed = false;
  protected reconnectAttempts = 0;
  public isConnected = false;

  private readonly maxReconnectDelayMs: number;
  private readonly maxReconnectAttempts: number;

  constructor(
    private readonly urlFactory: () => Promise<string> | string,
    private readonly reconnectDelayMs: number,
    private readonly webSocketFactory: (url: string) => WebSocketLike,
    maxReconnectDelayMs?: number,
    maxReconnectAttempts?: number,
  ) {
    super();
    this.maxReconnectDelayMs = maxReconnectDelayMs ?? 30000;
    this.maxReconnectAttempts = maxReconnectAttempts ?? Infinity;
  }

  public async connect(): Promise<void> {
    this.manuallyClosed = false;
    try {
      const url = await this.urlFactory();
      this.connection = this.webSocketFactory(url);
      this.bindConnection(this.connection);
    } catch (error) {
      this.emit("error", error);
      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    }
  }

  public disconnect(): void {
    this.manuallyClosed = true;
    if (this.reconnectTimer) {
      clearTimeout(this.reconnectTimer);
      this.reconnectTimer = undefined;
    }
    this.connection?.close();
  }

  protected send(payload: string | Buffer): void {
    this.connection?.send(payload);
  }

  private bindConnection(connection: WebSocketLike): void {
    connection.on("open", () => {
      this.reconnectAttempts = 0;
      this.isConnected = true;
      void this.onOpen();
    });

    connection.on("message", (data: unknown) => {
      this.onMessage(data);
    });

    connection.on("error", (error: unknown) => {
      this.emit("error", error);
    });

    connection.on("close", () => {
      this.isConnected = false;
      this.onClose();
      if (!this.manuallyClosed) {
        this.scheduleReconnect();
      }
    });
  }

  private scheduleReconnect(): void {
    if (this.reconnectAttempts >= this.maxReconnectAttempts) {
      this.emit("reconnect_failed", {
        attempts: this.reconnectAttempts,
        maxAttempts: this.maxReconnectAttempts,
      });
      return;
    }

    const exponentialFactor = Math.pow(2, Math.min(this.reconnectAttempts, 5));
    const baseDelay = this.reconnectDelayMs * exponentialFactor;
    const jitter = Math.floor(Math.random() * 500);
    const delay = Math.min(this.maxReconnectDelayMs, baseDelay + jitter);

    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      void this.connect();
    }, delay);
  }

  protected abstract onOpen(): Promise<void> | void;
  protected abstract onMessage(data: unknown): void;
  protected abstract onClose(): void;
}
