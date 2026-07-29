import {
  adx,
  analyzeMultiTimeframe,
  atr,
  bollingerBands,
  candlesFromSeries,
  ema,
  isTradingDay,
  latest,
  macd,
  obv,
  parseTimestamp,
  resample,
  rsi,
  sma,
  stochastic,
  tradingDaysAgo,
  vwap,
  type Candle,
  type OhlcBar,
} from "../src";

function trendingBars(count: number, start = 100, step = 1): OhlcBar[] {
  return Array.from({ length: count }, (_, index) => {
    const close = start + index * step;
    return {
      open: close - step / 2,
      high: close + 1,
      low: close - 1,
      close,
      volume: 1000 + index,
    };
  });
}

describe("indicators", () => {
  it("computes SMA with nulls until the window fills", () => {
    const result = sma([1, 2, 3, 4, 5], 3);

    expect(result).toEqual([null, null, 2, 3, 4]);
  });

  it("seeds EMA with the SMA of the first window", () => {
    const data = [1, 2, 3, 4, 5];
    const result = ema(data, 3);

    expect(result.slice(0, 2)).toEqual([null, null]);
    expect(result[2]).toBe(2);
    // (4 - 2) * 0.5 + 2
    expect(result[3]).toBe(3);
  });

  it("returns RSI of 100 for an unbroken advance", () => {
    const data = Array.from({ length: 20 }, (_, index) => 100 + index);

    expect(latest(rsi(data, 14))).toBe(100);
  });

  it("returns RSI of 0 for an unbroken decline", () => {
    const data = Array.from({ length: 20 }, (_, index) => 100 - index);

    expect(latest(rsi(data, 14))).toBe(0);
  });

  it("keeps RSI mid-range for an oscillating series", () => {
    const data = Array.from({ length: 60 }, (_, index) =>
      100 + Math.sin(index / 2) * 5,
    );
    const value = latest(rsi(data, 14));

    expect(value).toBeGreaterThan(20);
    expect(value).toBeLessThan(80);
  });

  it("aligns the MACD signal line with the MACD line", () => {
    const data = Array.from({ length: 80 }, (_, index) => 100 + index * 0.5);
    const result = macd(data);

    expect(result.macdLine).toHaveLength(data.length);
    expect(result.signalLine).toHaveLength(data.length);
    expect(result.histogram).toHaveLength(data.length);
    // A steady uptrend keeps the fast EMA above the slow one.
    expect(latest(result.macdLine)).toBeGreaterThan(0);
  });

  it("brackets price between the Bollinger bands", () => {
    const data = Array.from({ length: 40 }, (_, index) =>
      100 + Math.sin(index) * 3,
    );
    const bands = bollingerBands(data, { period: 20 });

    const upper = latest(bands.upper) as number;
    const middle = latest(bands.middle) as number;
    const lower = latest(bands.lower) as number;

    expect(upper).toBeGreaterThan(middle);
    expect(middle).toBeGreaterThan(lower);
  });

  it("computes a positive ATR for bars with real range", () => {
    const value = latest(atr(trendingBars(40), 14));

    expect(value).toBeGreaterThan(0);
  });

  it("reports a strong ADX for a persistent trend", () => {
    const result = adx(trendingBars(80, 100, 2), 14);
    const value = latest(result.adx) as number;

    expect(value).toBeGreaterThan(25);
    expect(latest(result.plusDi)).toBeGreaterThan(latest(result.minusDi) as number);
  });

  it("pins stochastic %K near 100 at the top of the range", () => {
    const value = latest(stochastic(trendingBars(30)).k);

    expect(value).toBeGreaterThan(90);
  });

  it("computes VWAP within the traded range", () => {
    const bars = trendingBars(10);
    const value = latest(vwap(bars)) as number;

    expect(value).toBeGreaterThan(bars[0].low);
    expect(value).toBeLessThan(bars[bars.length - 1].high);
  });

  it("accumulates OBV on up closes", () => {
    const bars: OhlcBar[] = [
      { high: 2, low: 0, close: 1, volume: 100 },
      { high: 3, low: 1, close: 2, volume: 200 },
      { high: 2, low: 0, close: 1, volume: 150 },
    ];

    expect(obv(bars)).toEqual([0, 200, 50]);
  });

  it("returns empty series for insufficient data", () => {
    expect(sma([], 5)).toEqual([]);
    expect(rsi([1, 2], 14)).toEqual([]);
    expect(atr([], 14)).toEqual([]);
  });
});

describe("candles", () => {
  it("parses epoch seconds, epoch millis and ISO strings", () => {
    expect(parseTimestamp(1_700_000_000)).toBe(1_700_000_000);
    expect(parseTimestamp("1700000000")).toBe(1_700_000_000);
    expect(parseTimestamp("1700000000000")).toBe(1_700_000_000);
    expect(parseTimestamp("2024-01-01T00:00:00Z")).toBe(1_704_067_200);
  });

  it("builds candles from a columnar chart response", () => {
    const candles = candlesFromSeries({
      timestamp: [60, 120],
      open: [10, 11],
      high: [12, 13],
      low: [9, 10],
      close: [11, 12],
      volume: [100, 200],
    });

    expect(candles).toHaveLength(2);
    expect(candles[1]).toMatchObject({ timestamp: 120, close: 12, volume: 200 });
  });

  it("returns no candles when a required column is missing", () => {
    expect(
      candlesFromSeries({ timestamp: [60], open: [1], high: [2], low: [0] }),
    ).toEqual([]);
    expect(candlesFromSeries(undefined)).toEqual([]);
  });

  it("aggregates one-minute candles into five-minute buckets", () => {
    const candles: Candle[] = Array.from({ length: 10 }, (_, index) => ({
      timestamp: index * 60,
      open: 100 + index,
      high: 101 + index,
      low: 99 + index,
      close: 100.5 + index,
      volume: 10,
    }));

    const resampled = resample(candles, 5);

    expect(resampled).toHaveLength(2);
    expect(resampled[0]).toMatchObject({
      timestamp: 0,
      open: 100,
      high: 105,
      low: 99,
      volume: 50,
    });
    expect(resampled[1].close).toBe(109.5);
  });

  it("leaves one-minute candles untouched", () => {
    const candles: Candle[] = [
      { timestamp: 0, open: 1, high: 2, low: 0, close: 1.5, volume: 1 },
    ];

    expect(resample(candles, 1)).toBe(candles);
  });
});

describe("market calendar", () => {
  it("treats weekends and listed holidays as non-trading", () => {
    // 2026-01-24 is a Saturday, 2026-01-26 a listed holiday.
    expect(isTradingDay("2026-01-24")).toBe(false);
    expect(isTradingDay("2026-01-25")).toBe(false);
    expect(isTradingDay("2026-01-26")).toBe(false);
    expect(isTradingDay("2026-01-27")).toBe(true);
  });

  it("walks back whole trading sessions", () => {
    // Monday 2026-01-19 back three sessions lands on Wednesday 2026-01-14.
    expect(tradingDaysAgo("2026-01-19", 3)).toBe("2026-01-14");
    expect(tradingDaysAgo("2026-01-19", 0)).toBe("2026-01-19");
  });

  it("rejects a negative lookback", () => {
    expect(() => tradingDaysAgo("2026-01-19", -1)).toThrow(RangeError);
  });
});

describe("multi-timeframe analysis", () => {
  const bullish = {
    rsi: 62,
    adx: 30,
    atr: 12,
    sma: 100,
    ema: 101,
    vwap: 100,
    macd: { macd: 5, signal: 3, hist: 2 },
    bollinger: { upper: 110, middle: 100, lower: 90 },
    stochastic: { k: 80, d: 75 },
    supertrend: { value: 95, direction: 1 as const },
    lastClose: 105,
    candleCount: 100,
  };

  it("reports a bullish bias when momentum and MACD agree", () => {
    const result = analyzeMultiTimeframe({
      indicators: { m15: bullish, m60: bullish },
    });

    expect(result.summary.bias).toBe("bullish");
    expect(result.summary.setup).toBe("buy_on_dip");
    expect(result.summary.confidence).toBe(1);
    expect(result.summary.trendStrength).toBe("strong");
  });

  it("reports a bearish bias when both point down", () => {
    const bearish = {
      ...bullish,
      rsi: 35,
      macd: { macd: -5, signal: -3, hist: -2 },
    };

    const result = analyzeMultiTimeframe({
      indicators: { m15: bearish, m60: bearish },
    });

    expect(result.summary.bias).toBe("bearish");
    expect(result.summary.setup).toBe("sell_on_rise");
  });

  it("stays neutral when momentum and MACD disagree", () => {
    const conflicted = { ...bullish, rsi: 35 };

    const result = analyzeMultiTimeframe({
      indicators: { m15: conflicted, m60: conflicted },
    });

    expect(result.summary.bias).toBe("neutral");
    expect(result.summary.setup).toBe("range_trade");
  });

  it("weights higher timeframes more heavily", () => {
    const bearish = {
      ...bullish,
      rsi: 35,
      macd: { macd: -5, signal: -3, hist: -2 },
    };

    // m1 weighs 1, m60 weighs 4 — the hourly reading should dominate.
    const result = analyzeMultiTimeframe({
      indicators: { m1: bearish, m60: bullish },
    });

    expect(result.summary.confidence).toBeGreaterThan(0.5);
  });

  it("defaults to neutral with no timeframes", () => {
    const result = analyzeMultiTimeframe({ indicators: {} });

    expect(result.summary.bias).toBe("neutral");
    expect(result.summary.confidence).toBe(0.5);
  });
});
