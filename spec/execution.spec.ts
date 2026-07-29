import {
  OrderTracker,
  PositionMonitor,
  TERMINAL_ORDER_STATUSES,
  type ExitSignal,
  type MonitoredPosition,
} from "../src";
import type { MarketFeedEvent, OrderState } from "../src";

function tick(securityId: string, ltp: number): MarketFeedEvent {
  return {
    type: "ticker",
    responseCode: 2,
    messageLength: 16,
    exchangeSegmentCode: 1,
    exchangeSegment: "NSE_EQ",
    securityId,
    ltp,
    ltt: Math.floor(Date.now() / 1000),
    raw: Buffer.alloc(0),
  };
}

const longPosition: MonitoredPosition = {
  securityId: "2885",
  exchangeSegment: "NSE_EQ",
  quantity: 10,
  entryPrice: 100,
  stopLoss: 95,
  target: 110,
};

describe("PositionMonitor", () => {
  it("emits an update carrying P&L on every tracked tick", () => {
    const monitor = new PositionMonitor().track(longPosition);
    const updates: number[] = [];
    monitor.on("update", (update) => updates.push(update.pnl));

    monitor.onTick(tick("2885", 102));
    monitor.onTick(tick("2885", 104));

    expect(updates).toEqual([20, 40]);
  });

  it("ignores ticks for instruments it is not tracking", () => {
    const monitor = new PositionMonitor().track(longPosition);
    const updates = jest.fn();
    monitor.on("update", updates);

    monitor.onTick(tick("9999", 102));

    expect(updates).not.toHaveBeenCalled();
  });

  it("exits a long at the stop loss and at the target", () => {
    const stopped: ExitSignal[] = [];
    const stopMonitor = new PositionMonitor().track(longPosition);
    stopMonitor.on("exit", (signal) => stopped.push(signal));
    stopMonitor.onTick(tick("2885", 94));

    expect(stopped[0]).toMatchObject({ reason: "stop_loss", price: 94, pnl: -60 });

    const won: ExitSignal[] = [];
    const targetMonitor = new PositionMonitor().track(longPosition);
    targetMonitor.on("exit", (signal) => won.push(signal));
    targetMonitor.onTick(tick("2885", 111));

    expect(won[0]).toMatchObject({ reason: "target", pnl: 110 });
  });

  it("inverts stop and target for a short position", () => {
    const monitor = new PositionMonitor().track({
      ...longPosition,
      quantity: -10,
      stopLoss: 105,
      target: 90,
    });
    const signals: ExitSignal[] = [];
    monitor.on("exit", (signal) => signals.push(signal));

    monitor.onTick(tick("2885", 106));

    // A short loses as price rises, so 106 against a 105 stop is a stop-out.
    expect(signals[0]).toMatchObject({ reason: "stop_loss", pnl: -60 });
  });

  it("prefers the stop loss when one tick gaps through both levels", () => {
    const monitor = new PositionMonitor().track({
      ...longPosition,
      stopLoss: 105,
      target: 105,
    });
    const signals: ExitSignal[] = [];
    monitor.on("exit", (signal) => signals.push(signal));

    monitor.onTick(tick("2885", 105));

    expect(signals[0].reason).toBe("stop_loss");
  });

  it("emits exactly one exit even as ticks keep arriving", () => {
    const monitor = new PositionMonitor().track(longPosition);
    const exits = jest.fn();
    monitor.on("exit", exits);

    monitor.onTick(tick("2885", 94));
    monitor.onTick(tick("2885", 93));
    monitor.onTick(tick("2885", 92));

    expect(exits).toHaveBeenCalledTimes(1);
  });

  it("ratchets a trailing stop up and exits when price falls back through it", () => {
    const monitor = new PositionMonitor().track({
      securityId: "2885",
      exchangeSegment: "NSE_EQ",
      quantity: 10,
      entryPrice: 100,
      stopLoss: 90,
      trail: { atr: 5, multiplier: 1 },
    });

    const trails: Array<number | undefined> = [];
    const signals: ExitSignal[] = [];
    monitor.on("update", (update) => trails.push(update.trailingStop));
    monitor.on("exit", (signal) => signals.push(signal));

    monitor.onTick(tick("2885", 110)); // trail → 105
    monitor.onTick(tick("2885", 120)); // trail → 115
    monitor.onTick(tick("2885", 118)); // trail holds at 115

    expect(trails).toEqual([105, 115, 115]);
    expect(signals).toHaveLength(0);

    monitor.onTick(tick("2885", 114));

    expect(signals[0]).toMatchObject({ reason: "trailing_stop", price: 114 });
  });

  it("resumes emitting after an exited position is re-tracked", () => {
    const monitor = new PositionMonitor().track(longPosition);
    const exits = jest.fn();
    monitor.on("exit", exits);

    monitor.onTick(tick("2885", 94));
    monitor.track(longPosition);
    monitor.onTick(tick("2885", 94));

    expect(exits).toHaveBeenCalledTimes(2);
  });

  it("stops emitting once untracked", () => {
    const monitor = new PositionMonitor().track(longPosition);
    const exits = jest.fn();
    monitor.on("exit", exits);

    monitor.untrack("NSE_EQ", "2885");
    monitor.onTick(tick("2885", 94));

    expect(exits).not.toHaveBeenCalled();
    expect(monitor.tracked()).toEqual([]);
  });
});

describe("OrderTracker", () => {
  function state(overrides: Partial<OrderState> = {}): OrderState {
    return {
      orderId: "order-1",
      correlationId: "corr-1",
      status: "TRADED",
      tradedQty: 10,
      averageTradedPrice: 100.5,
      raw: {},
      ...overrides,
    };
  }

  it("resolves a waiter keyed by correlation id", async () => {
    const tracker = new OrderTracker();
    const settled = tracker.waitFor("corr-1");

    tracker.onOrderUpdate(state());

    await expect(settled).resolves.toMatchObject({
      status: "TRADED",
      filledQuantity: 10,
      averagePrice: 100.5,
    });
  });

  it("resolves a waiter keyed by order id from the same event", async () => {
    const tracker = new OrderTracker();
    const settled = tracker.waitFor("order-1");

    tracker.onOrderUpdate(state());

    await expect(settled).resolves.toMatchObject({ orderId: "order-1" });
  });

  it("resolves rather than throws on rejection and cancellation", async () => {
    const tracker = new OrderTracker();

    const rejectedWait = tracker.waitFor("corr-1");
    tracker.onOrderUpdate(state({ status: "REJECTED", tradedQty: 0 }));
    await expect(rejectedWait).resolves.toMatchObject({ status: "REJECTED" });

    const cancelledWait = tracker.waitFor("corr-2");
    tracker.onOrderUpdate(
      state({ correlationId: "corr-2", status: "CANCELLED", tradedQty: 0 }),
    );
    await expect(cancelledWait).resolves.toMatchObject({ status: "CANCELLED" });
  });

  it("emits the matching lifecycle event for each terminal status", () => {
    const tracker = new OrderTracker();
    const filled = jest.fn();
    const rejected = jest.fn();
    const cancelled = jest.fn();

    tracker.on("filled", filled);
    tracker.on("rejected", rejected);
    tracker.on("cancelled", cancelled);

    tracker.onOrderUpdate(state());
    tracker.onOrderUpdate(state({ status: "REJECTED" }));
    tracker.onOrderUpdate(state({ status: "EXPIRED" }));

    expect(filled).toHaveBeenCalledTimes(1);
    expect(rejected).toHaveBeenCalledTimes(1);
    expect(cancelled).toHaveBeenCalledTimes(1);
  });

  it("reports partial fills without settling the waiter", async () => {
    const tracker = new OrderTracker();
    const partial = jest.fn();
    tracker.on("partial", partial);

    const settled = tracker.waitFor("corr-1", { timeoutMs: 200 });
    tracker.onOrderUpdate(state({ status: "PART_TRADED", tradedQty: 5 }));

    expect(partial).toHaveBeenCalledTimes(1);
    await expect(settled).rejects.toThrow(/Timed out/);
  });

  it("times out when no terminal update arrives", async () => {
    const tracker = new OrderTracker();

    await expect(tracker.waitFor("corr-x", { timeoutMs: 50 })).rejects.toThrow(
      /Timed out after 50ms/,
    );
  });

  it("rejects outstanding waiters when cleared", async () => {
    const tracker = new OrderTracker();
    const settled = tracker.waitFor("corr-1", { timeoutMs: 5000 });

    tracker.clear();

    await expect(settled).rejects.toThrow(/cancelled/);
  });

  it("treats exactly the non-recoverable statuses as terminal", () => {
    expect([...TERMINAL_ORDER_STATUSES].sort()).toEqual([
      "CANCELLED",
      "EXPIRED",
      "REJECTED",
      "TRADED",
    ]);
  });
});
