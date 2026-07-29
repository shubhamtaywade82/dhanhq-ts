import { EventEmitter } from "events";

import { TrailManager } from "../risk/positionSizing";
import type { MarketFeedEvent } from "../types/ws.types";

export type ExitReason = "stop_loss" | "target" | "trailing_stop" | "manual";

export interface MonitoredPosition {
  securityId: string;
  exchangeSegment: string;
  /** Positive for a long, negative for a short. */
  quantity: number;
  entryPrice: number;
  stopLoss?: number;
  target?: number;
  /** Enables an ATR trailing stop that ratchets with the high-water mark. */
  trail?: { atr: number; multiplier?: number };
}

export interface ExitSignal {
  position: MonitoredPosition;
  reason: ExitReason;
  price: number;
  /** Signed P&L at the trigger price, in currency units. */
  pnl: number;
  triggeredAt: Date;
}

export interface PositionUpdate {
  position: MonitoredPosition;
  ltp: number;
  pnl: number;
  pnlPercent: number;
  /** The live trailing stop, when one is configured. */
  trailingStop?: number;
}

export interface PositionMonitorEvents {
  update: (update: PositionUpdate) => void;
  exit: (signal: ExitSignal) => void;
}

/**
 * Turns a market feed into exit signals.
 *
 * The WebSocket is the real-time truth source — polling REST for the price of
 * an open position is both slower and rate-limited, so exit logic belongs
 * here, driven by ticks.
 *
 * This class only *decides*. It never places an order, so a caller can wire
 * it to a live exit, a paper log, or an alert without changing it. See
 * `examples/ws-execution.ts` for the full loop.
 */
export class PositionMonitor extends EventEmitter {
  private readonly positions = new Map<string, MonitoredPosition>();
  private readonly trails = new Map<string, TrailManager>();
  private readonly exited = new Set<string>();

  /** Starts monitoring a position. Re-adding the same key resets its trail. */
  public track(position: MonitoredPosition): this {
    const key = keyFor(position.exchangeSegment, position.securityId);
    this.positions.set(key, position);
    this.exited.delete(key);

    if (position.trail) {
      this.trails.set(
        key,
        new TrailManager(
          position.entryPrice,
          position.stopLoss ?? position.entryPrice - position.trail.atr,
          position.trail.atr,
          position.trail.multiplier ?? 2,
        ),
      );
    }

    return this;
  }

  public untrack(exchangeSegment: string, securityId: string): this {
    const key = keyFor(exchangeSegment, securityId);
    this.positions.delete(key);
    this.trails.delete(key);
    this.exited.delete(key);
    return this;
  }

  public tracked(): MonitoredPosition[] {
    return [...this.positions.values()];
  }

  /**
   * Feeds one market tick in. Wire this to `client.ws.market.on("tick", …)`.
   * Ticks for untracked instruments are ignored.
   */
  public onTick(event: MarketFeedEvent): void {
    const ltp = "ltp" in event ? event.ltp : undefined;
    if (typeof ltp !== "number" || !Number.isFinite(ltp)) {
      return;
    }

    const key = keyFor(event.exchangeSegment, event.securityId);
    const position = this.positions.get(key);

    // An exited position keeps receiving ticks until the caller untracks it;
    // emitting a second exit would double-send the closing order.
    if (!position || this.exited.has(key)) {
      return;
    }

    const isLong = position.quantity > 0;
    const pnl = (ltp - position.entryPrice) * position.quantity;
    const pnlPercent =
      position.entryPrice === 0
        ? 0
        : ((ltp - position.entryPrice) / position.entryPrice) *
          100 *
          (isLong ? 1 : -1);

    const trail = this.trails.get(key);
    const trailState = trail?.update(ltp);

    this.emit("update", {
      position,
      ltp,
      pnl,
      pnlPercent,
      trailingStop: trailState?.stop,
    } satisfies PositionUpdate);

    const reason = this.exitReason(position, ltp, isLong, trailState?.stop);
    if (!reason) {
      return;
    }

    this.exited.add(key);
    this.emit("exit", {
      position,
      reason,
      price: ltp,
      pnl,
      triggeredAt: new Date(),
    } satisfies ExitSignal);
  }

  /**
   * Stop loss is checked before target: if a single tick gaps through both
   * levels, assuming the worse fill is the safer reconciliation.
   */
  private exitReason(
    position: MonitoredPosition,
    ltp: number,
    isLong: boolean,
    trailingStop?: number,
  ): ExitReason | undefined {
    if (position.stopLoss !== undefined) {
      const hit = isLong ? ltp <= position.stopLoss : ltp >= position.stopLoss;
      if (hit) {
        return "stop_loss";
      }
    }

    // The trailing stop only applies to longs — TrailManager ratchets upward
    // from a high-water mark, which has no meaning for a short.
    if (trailingStop !== undefined && isLong && ltp <= trailingStop) {
      return "trailing_stop";
    }

    if (position.target !== undefined) {
      const hit = isLong ? ltp >= position.target : ltp <= position.target;
      if (hit) {
        return "target";
      }
    }

    return undefined;
  }

  public override on<K extends keyof PositionMonitorEvents>(
    event: K,
    listener: PositionMonitorEvents[K],
  ): this {
    return super.on(event, listener);
  }

  public override emit<K extends keyof PositionMonitorEvents>(
    event: K,
    ...args: Parameters<PositionMonitorEvents[K]>
  ): boolean {
    return super.emit(event, ...args);
  }
}

function keyFor(exchangeSegment: string, securityId: string): string {
  return `${exchangeSegment}:${securityId}`;
}
