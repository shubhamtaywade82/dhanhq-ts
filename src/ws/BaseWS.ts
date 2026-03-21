import { EventEmitter } from "events";

import type { WebSocketLike } from "../types/ws.types";

export abstract class BaseWS extends EventEmitter {
  private reconnectTimer?: NodeJS.Timeout;
  protected connection?: WebSocketLike;
  protected manuallyClosed = false;
  protected reconnectAttempts = 0;
  public isConnected = false;

  constructor(
    private readonly urlFactory: () => Promise<string> | string,
    private readonly reconnectDelayMs: number,
    private readonly webSocketFactory: (url: string) => WebSocketLike,
  ) {
    super();
  }

  public async connect(): Promise<void> {
    this.manuallyClosed = false;
    const url = await this.urlFactory();
    this.connection = this.webSocketFactory(url);
    this.bindConnection(this.connection);
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
    const delay = Math.min(
      5000,
      this.reconnectDelayMs * Math.max(1, this.reconnectAttempts + 1),
    );
    this.reconnectAttempts += 1;
    this.reconnectTimer = setTimeout(() => {
      void this.connect();
    }, delay);
  }

  protected abstract onOpen(): Promise<void> | void;
  protected abstract onMessage(data: unknown): void;
  protected abstract onClose(): void;
}
