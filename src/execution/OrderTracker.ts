import { EventEmitter } from "events";

import { OrderStatus } from "../constants";
import type { OrderState } from "../types/ws.types";

/** Statuses after which an order will receive no further updates. */
export const TERMINAL_ORDER_STATUSES: readonly string[] = [
  OrderStatus.TRADED,
  OrderStatus.CANCELLED,
  OrderStatus.REJECTED,
  OrderStatus.EXPIRED,
];

export interface OrderOutcome {
  orderId?: string;
  correlationId?: string;
  status: string;
  filledQuantity: number;
  averagePrice?: number;
  state: OrderState;
}

export interface OrderTrackerEvents {
  filled: (outcome: OrderOutcome) => void;
  rejected: (outcome: OrderOutcome) => void;
  cancelled: (outcome: OrderOutcome) => void;
  partial: (outcome: OrderOutcome) => void;
}

export interface WaitOptions {
  timeoutMs?: number;
}

/**
 * Resolves a placed order to its final state using order-update events.
 *
 * Order placement returns an id, not a fill. Polling `GET /orders/{id}` to
 * find out what happened is slower and burns rate limit, so this listens on
 * the order-update socket instead and settles a promise when the order
 * reaches a terminal status.
 *
 * Correlation ids are the join key: an order is tracked from the moment it is
 * submitted, which closes the race where the fill event arrives before the
 * REST response does.
 */
export class OrderTracker extends EventEmitter {
  private readonly pending = new Map<
    string,
    {
      resolve: (outcome: OrderOutcome) => void;
      reject: (error: Error) => void;
      timer?: NodeJS.Timeout;
    }
  >();

  /** Feeds one order update in. Wire to `client.ws.orders.on("order", …)`. */
  public onOrderUpdate(state: OrderState): void {
    const outcome = toOutcome(state);

    if (!TERMINAL_ORDER_STATUSES.includes(outcome.status)) {
      if (outcome.filledQuantity > 0) {
        this.emit("partial", outcome);
      }
      return;
    }

    if (outcome.status === OrderStatus.TRADED) {
      this.emit("filled", outcome);
    } else if (outcome.status === OrderStatus.REJECTED) {
      this.emit("rejected", outcome);
    } else {
      this.emit("cancelled", outcome);
    }

    // Settle whichever key the caller is waiting on. Both are registered, so
    // a waiter keyed by correlation id resolves even when only the order id
    // came back on the event, and vice versa.
    for (const key of [outcome.orderId, outcome.correlationId]) {
      if (!key) {
        continue;
      }

      const waiter = this.pending.get(key);
      if (waiter) {
        clearTimeout(waiter.timer);
        this.pending.delete(key);
        waiter.resolve(outcome);
      }
    }
  }

  /**
   * Resolves when the order reaches a terminal status.
   *
   * Rejection and cancellation resolve rather than throw — they are outcomes,
   * not errors. Only the timeout rejects.
   */
  public waitFor(
    key: string,
    options: WaitOptions = {},
  ): Promise<OrderOutcome> {
    return new Promise<OrderOutcome>((resolve, reject) => {
      const timeoutMs = options.timeoutMs ?? 30_000;

      const timer = setTimeout(() => {
        this.pending.delete(key);
        reject(
          new Error(
            `Timed out after ${timeoutMs}ms waiting for order ${key} to reach a terminal status`,
          ),
        );
      }, timeoutMs);

      // Never hold the process open purely to wait on a fill.
      timer.unref?.();

      this.pending.set(key, { resolve, reject, timer });
    });
  }

  /** Drops every pending waiter — call on disconnect or shutdown. */
  public clear(): void {
    for (const waiter of this.pending.values()) {
      clearTimeout(waiter.timer);
      waiter.reject(new Error("Order tracking cancelled"));
    }

    this.pending.clear();
  }

  public override on<K extends keyof OrderTrackerEvents>(
    event: K,
    listener: OrderTrackerEvents[K],
  ): this {
    return super.on(event, listener);
  }

  public override emit<K extends keyof OrderTrackerEvents>(
    event: K,
    ...args: Parameters<OrderTrackerEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}

function toOutcome(state: OrderState): OrderOutcome {
  return {
    orderId: state.orderId,
    correlationId: state.correlationId,
    status: String(state.status ?? ""),
    filledQuantity: Number(state.tradedQty ?? 0),
    averagePrice: state.averageTradedPrice,
    state,
  };
}
