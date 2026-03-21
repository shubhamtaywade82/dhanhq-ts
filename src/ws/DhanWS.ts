import type { InstrumentSubscription } from "../types/common.types";
import type { DhanWSOptions } from "../types/ws.types";
import { MarketFeedWS } from "./MarketFeedWS";
import { OrderUpdateWS } from "./OrderUpdateWS";
import { LTPStore } from "./store/LTPStore";
import { OrderStore } from "./store/OrderStore";

export class DhanWS {
  public readonly ltpStore = new LTPStore();
  public readonly orderStore = new OrderStore();
  public readonly market: MarketFeedWS;
  public readonly orders: OrderUpdateWS;

  constructor(options: DhanWSOptions) {
    this.market = new MarketFeedWS(
      {
        token: options.token,
        clientId: options.clientId,
        url: options.marketFeedUrl,
        reconnectDelayMs: options.reconnectDelayMs,
        webSocketFactory: options.marketSocketFactory,
      },
      this.ltpStore,
    );
    this.orders = new OrderUpdateWS(
      {
        token: options.token,
        clientId: options.clientId,
        url: options.orderUpdateUrl,
        reconnectDelayMs: options.reconnectDelayMs,
        webSocketFactory: options.orderSocketFactory,
      },
      this.orderStore,
    );
  }

  public connect(): void {
    this.market.connect();
    this.orders.connect();
  }

  public disconnect(): void {
    this.market.disconnect();
    this.orders.disconnect();
  }

  public subscribe(instruments: InstrumentSubscription[]): void {
    this.market.subscribe(instruments);
  }
}
