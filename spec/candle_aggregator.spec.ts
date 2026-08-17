import { CandleAggregator } from "../src";
import type { MarketFullEvent, MarketTickerEvent } from "../src/types/ws.types";

const EXCHANGE_SEGMENT = "NSE_FNO";
const SECURITY_ID = "12345";

function ticker(ltp: number, ltt: number): MarketTickerEvent {
  return {
    type: "ticker",
    responseCode: 2,
    messageLength: 16,
    exchangeSegmentCode: 2,
    exchangeSegment: EXCHANGE_SEGMENT,
    securityId: SECURITY_ID,
    ltp,
    ltt,
    raw: Buffer.alloc(0),
  };
}

function full(ltp: number, ltt: number, volume: number, openInterest = 0): MarketFullEvent {
  return {
    type: "full",
    responseCode: 8,
    messageLength: 0,
    exchangeSegmentCode: 2,
    exchangeSegment: EXCHANGE_SEGMENT,
    securityId: SECURITY_ID,
    ltp,
    ltq: 1,
    ltt,
    atp: ltp,
    volume,
    totalSellQuantity: 0,
    totalBuyQuantity: 0,
    openInterest,
    highestOpenInterest: openInterest,
    lowestOpenInterest: openInterest,
    dayOpen: ltp,
    dayClose: ltp,
    dayHigh: ltp,
    dayLow: ltp,
    depth: [],
    raw: Buffer.alloc(0),
  };
}

describe("CandleAggregator", () => {
  it("builds OHLC from ticker ticks within one bucket", () => {
    const agg = new CandleAggregator({ intervalMinutes: 1 });

    agg.handleTick(ticker(100, 0));
    agg.handleTick(ticker(105, 10));
    agg.handleTick(ticker(95, 20));
    agg.handleTick(ticker(102, 59));

    const candle = agg.getCandle(EXCHANGE_SEGMENT, SECURITY_ID);
    expect(candle).toEqual(
      expect.objectContaining({ timestamp: 0, open: 100, high: 105, low: 95, close: 102 }),
    );
  });

  it("closes the previous bucket and starts a new one on interval rollover", () => {
    const agg = new CandleAggregator({ intervalMinutes: 1 });
    const closed: unknown[] = [];
    agg.on("close", (_key, candle) => closed.push(candle));

    agg.handleTick(ticker(100, 0));
    agg.handleTick(ticker(110, 59));
    agg.handleTick(ticker(90, 60));

    expect(closed).toHaveLength(1);
    expect(closed[0]).toEqual(expect.objectContaining({ timestamp: 0, open: 100, high: 110, close: 110 }));
    expect(agg.getCandle(EXCHANGE_SEGMENT, SECURITY_ID)).toEqual(
      expect.objectContaining({ timestamp: 60, open: 90, close: 90 }),
    );
  });

  it("derives per-bar volume as a delta from Dhan's cumulative day volume", () => {
    const agg = new CandleAggregator({ intervalMinutes: 1 });

    agg.handleTick(full(100, 0, 1000));
    agg.handleTick(full(101, 30, 1150));

    expect(agg.getCandle(EXCHANGE_SEGMENT, SECURITY_ID)?.volume).toBe(150);
  });

  it("re-bases volume instead of going negative when cumulative volume drops", () => {
    const agg = new CandleAggregator({ intervalMinutes: 1 });

    agg.handleTick(full(100, 0, 5000));
    agg.handleTick(full(101, 10, 200)); // e.g. feed restart / new session mid-bucket

    expect(agg.getCandle(EXCHANGE_SEGMENT, SECURITY_ID)?.volume).toBe(0);

    agg.handleTick(full(102, 20, 350));
    expect(agg.getCandle(EXCHANGE_SEGMENT, SECURITY_ID)?.volume).toBe(150);
  });

  it("seed() primes a bucket so a mid-bar attach doesn't restart from flat", () => {
    const agg = new CandleAggregator({ intervalMinutes: 1 });

    agg.seed(EXCHANGE_SEGMENT, SECURITY_ID, {
      timestamp: 0,
      open: 100,
      high: 108,
      low: 99,
      close: 104,
      volume: 500,
    });

    agg.handleTick(ticker(110, 30));

    expect(agg.getCandle(EXCHANGE_SEGMENT, SECURITY_ID)).toEqual(
      expect.objectContaining({ open: 100, high: 110, low: 99, close: 110 }),
    );
  });

  it("flush emits close and removes the in-progress candle", () => {
    const agg = new CandleAggregator({ intervalMinutes: 1 });
    const closed: unknown[] = [];
    agg.on("close", (_key, candle) => closed.push(candle));

    agg.handleTick(ticker(100, 0));
    agg.flush(EXCHANGE_SEGMENT, SECURITY_ID);

    expect(closed).toHaveLength(1);
    expect(agg.getCandle(EXCHANGE_SEGMENT, SECURITY_ID)).toBeUndefined();
  });

  it("ignores packet types without a price", () => {
    const agg = new CandleAggregator();
    agg.handleTick({
      type: "disconnect",
      responseCode: 50,
      messageLength: 0,
      exchangeSegmentCode: 2,
      exchangeSegment: EXCHANGE_SEGMENT,
      securityId: SECURITY_ID,
      reasonCode: 1,
      raw: Buffer.alloc(0),
    });

    expect(agg.getCandle(EXCHANGE_SEGMENT, SECURITY_ID)).toBeUndefined();
  });
});
