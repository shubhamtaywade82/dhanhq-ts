import type { OrderState } from "../../types/ws.types";

export class OrderStore {
  private readonly byOrderId = new Map<string, OrderState>();
  private readonly byCorrelationId = new Map<string, OrderState>();

  public upsert(state: OrderState): void {
    if (state.orderId) {
      this.byOrderId.set(state.orderId, state);
    }

    if (state.correlationId) {
      this.byCorrelationId.set(state.correlationId, state);
    }
  }

  public getByOrderId(orderId: string): OrderState | undefined {
    return this.byOrderId.get(orderId);
  }

  public getByCorrelationId(correlationId: string): OrderState | undefined {
    return this.byCorrelationId.get(correlationId);
  }

  public clear(): void {
    this.byOrderId.clear();
    this.byCorrelationId.clear();
  }
}
