import { buildCursor } from "../src/backtest/cursors";
import { Backtester } from "../src/backtest/runner";
import type {
  BacktestConfig,
  Strategy,
  StrategyContext,
  StrategySignal,
} from "../src/backtest/types";
import { Pipeline } from "../src/risk/Pipeline";
import type { Candle } from "../src/ta/candles";

function candle(
  timestamp: number,
  open: number,
  high: number,
  low: number,
  close: number,
  volume = 1000,
): Candle {
  return { timestamp, open, high, low, close, volume };
}

describe("buildCursor", () => {
  it("only exposes a higher-timeframe bar once it has fully closed", () => {
    const primary = [0, 300, 600, 900, 1200, 1500].map((ts) => candle(ts, 1, 1, 1, 1));
    // 15-minute bars (900s), covering [0,900) and [900,1800).
    const higherTf = [candle(0, 1, 1, 1, 1), candle(900, 1, 1, 1, 1)];

    expect(buildCursor(primary, higherTf, 900)).toEqual([-1, -1, -1, 0, 0, 0]);
  });

  it("returns an empty-series cursor (-1 everywhere) when nothing has closed yet", () => {
    const primary = [0, 60].map((ts) => candle(ts, 1, 1, 1, 1));
    expect(buildCursor(primary, [], 900)).toEqual([-1, -1]);
  });
});

describe("Backtester", () => {
  const initialCapital = 100_000;

  it("fills at the next bar's open and exits on an intrabar stop loss", async () => {
    const candles = [
      candle(0, 100, 101, 99, 100),
      candle(60, 100, 102, 98, 101), // fill happens here: open = 100
      candle(120, 101, 103, 85, 88), // low breaches stopLoss(90) -> stop-out at 90
      candle(180, 88, 90, 80, 85),
    ];

    let entered = false;
    const strategy: Strategy = (context: StrategyContext): StrategySignal => {
      if (!entered && context.index === 0) {
        entered = true;
        return { type: "enter", signal: { side: "LONG", stopLoss: 90, quantity: 10 } };
      }
      return { type: "hold" };
    };

    const result = await new Backtester().run({ candles, initialCapital, strategy });

    expect(result.trades).toHaveLength(1);
    const [trade] = result.trades;
    expect(trade).toMatchObject({
      side: "LONG",
      entryPrice: 100,
      entryIndex: 1,
      quantity: 10,
      exitPrice: 90,
      exitIndex: 2,
      exitReason: "stop_loss",
      fees: 0,
      pnl: -100,
    });

    expect(result.equityCurve).toHaveLength(4);
    expect(result.equityCurve[0].equity).toBe(initialCapital);
    expect(result.equityCurve[3].equity).toBe(initialCapital - 100);
    expect(result.metrics.totalTrades).toBe(1);
    expect(result.metrics.totalPnl).toBe(-100);
    expect(result.skippedSignals).toHaveLength(0);
  });

  it("applies slippage and fees from the cost model to both legs", async () => {
    const candles = [
      candle(0, 100, 101, 99, 100),
      candle(60, 100, 102, 98, 101),
      candle(120, 101, 103, 85, 88),
      candle(180, 88, 90, 80, 85),
    ];

    const strategy: Strategy = (context) =>
      context.index === 0
        ? { type: "enter", signal: { side: "LONG", stopLoss: 90, quantity: 10 } }
        : { type: "hold" };

    const config: BacktestConfig = {
      candles,
      initialCapital,
      strategy,
      costModel: {
        slippage: (raw, direction) => (direction === "buy" ? raw + 1 : raw - 1),
        fees: () => 2,
      },
    };

    const result = await new Backtester().run(config);

    expect(result.trades).toHaveLength(1);
    const [trade] = result.trades;
    expect(trade.entryPrice).toBe(101); // buy fill worsened by +1
    expect(trade.exitPrice).toBe(89); // sell fill worsened by -1
    expect(trade.fees).toBe(4); // 2 on entry + 2 on exit
    expect(trade.pnl).toBe((89 - 101) * 10 - 4);
  });

  it("drops an entry signal on the last bar instead of phantom-filling it", async () => {
    const candles = [candle(0, 100, 101, 99, 100), candle(60, 100, 102, 98, 101)];

    const strategy: Strategy = (context) =>
      context.index === candles.length - 1
        ? { type: "enter", signal: { side: "LONG", stopLoss: 90, quantity: 10 } }
        : { type: "hold" };

    const result = await new Backtester().run({ candles, initialCapital, strategy });

    expect(result.trades).toHaveLength(0);
    expect(result.skippedSignals).toEqual([
      { index: 1, reason: "no_fill_window" },
    ]);
  });

  it("ignores a second entry while a position is already open", async () => {
    const candles = [
      candle(0, 100, 101, 99, 100),
      candle(60, 100, 105, 99, 101),
      candle(120, 101, 106, 100, 105),
      candle(180, 105, 107, 104, 106),
    ];

    // Deliberately naive: enters on bar 0 and bar 1 regardless of `context.position`.
    const strategy: Strategy = (context) =>
      context.index === 0 || context.index === 1
        ? { type: "enter", signal: { side: "LONG", stopLoss: 50, quantity: 10 } }
        : { type: "hold" };

    const result = await new Backtester().run({ candles, initialCapital, strategy });

    // The first entry (decided at bar 0) opens and rides to end-of-data; the
    // second entry (decided at bar 1, while that position is still open) is
    // the one that gets rejected.
    expect(result.trades).toHaveLength(1);
    expect(result.trades[0].entryIndex).toBe(1);
    expect(result.skippedSignals).toContainEqual({ index: 1, reason: "position_open" });
  });

  it("skips a signal that sets neither quantity nor riskPercent", async () => {
    const candles = [candle(0, 100, 101, 99, 100), candle(60, 100, 102, 98, 101), candle(120, 101, 103, 100, 102)];

    const strategy: Strategy = (context) =>
      context.index === 0
        ? { type: "enter", signal: { side: "LONG", stopLoss: 90 } }
        : { type: "hold" };

    const result = await new Backtester().run({ candles, initialCapital, strategy });

    expect(result.trades).toHaveLength(0);
    expect(result.skippedSignals).toEqual([
      { index: 0, reason: "invalid_signal", detail: "signal must set quantity or riskPercent" },
    ]);
  });

  it("rejects an entry the risk pipeline flags, without opening a position", async () => {
    const candles = [candle(0, 100, 101, 99, 100), candle(60, 100, 102, 98, 101), candle(120, 101, 103, 100, 102)];

    const strategy: Strategy = (context) =>
      context.index === 0
        ? { type: "enter", signal: { side: "LONG", stopLoss: 90, quantity: 10 } }
        : { type: "hold" };

    const riskPipeline = new Pipeline({ limits: { maxQuantity: 1 } });

    const result = await new Backtester().run({ candles, initialCapital, strategy, riskPipeline });

    expect(result.trades).toHaveLength(0);
    expect(result.skippedSignals).toHaveLength(1);
    expect(result.skippedSignals[0].reason).toBe("risk_violation");
  });

  it("force-closes a position still open when the data runs out", async () => {
    const candles = [
      candle(0, 100, 101, 99, 100),
      candle(60, 100, 105, 99, 101),
      candle(120, 101, 106, 100, 105),
    ];

    const strategy: Strategy = (context) =>
      context.index === 0
        ? { type: "enter", signal: { side: "LONG", stopLoss: 10, quantity: 10 } }
        : { type: "hold" };

    const result = await new Backtester().run({ candles, initialCapital, strategy });

    expect(result.trades).toHaveLength(1);
    expect(result.trades[0].exitReason).toBe("end_of_data");
    expect(result.trades[0].exitPrice).toBe(candles[candles.length - 1].close);
  });

  it("keeps higher-timeframe indicators lookahead-safe and readable via timeframe()/bias()", async () => {
    const candles = Array.from({ length: 20 }, (_, i) =>
      candle(i * 300, 100 + i, 100 + i + 1, 100 + i - 1, 100 + i),
    );

    const readings: Array<{ index: number; htfClose: number | null }> = [];
    const strategy: Strategy = (context) => {
      readings.push({ index: context.index, htfClose: context.indicators.timeframe(15).sma(1) });
      if (context.index === 5) {
        // Exercise bias() without asserting a specific direction — just that
        // it runs against the same lookahead-safe data and returns a shape.
        const bias = context.indicators.bias();
        expect(["bullish", "bearish", "neutral"]).toContain(bias.summary.bias);
      }
      return { type: "hold" };
    };

    const result = await new Backtester().run({
      candles,
      initialCapital,
      strategy,
      higherTimeframesMinutes: [15],
    });

    expect(result.trades).toHaveLength(0);
    // The first 15-minute bar (3 primary bars) hasn't closed yet at index 0/1/2.
    expect(readings[0].htfClose).toBeNull();
    expect(readings[1].htfClose).toBeNull();
    // By the time 15 minutes of primary bars have elapsed, it has.
    const laterReading = readings.find((r) => r.index === 10);
    expect(laterReading?.htfClose).not.toBeNull();
  });

  it("throws from timeframe() for a minutes value that wasn't configured", async () => {
    const candles = [candle(0, 100, 101, 99, 100), candle(60, 100, 102, 98, 101)];
    let threw: unknown;

    const strategy: Strategy = (context) => {
      try {
        context.indicators.timeframe(60);
      } catch (error) {
        threw = error;
      }
      return { type: "hold" };
    };

    await new Backtester().run({ candles, initialCapital, strategy });
    expect(threw).toBeInstanceOf(Error);
  });
});
