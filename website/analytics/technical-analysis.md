---
title: DhanHQ Technical Analysis — TypeScript & Node.js
description: Compute SMA, EMA, RSI, MACD, Bollinger Bands, ATR, ADX, Stochastic, Supertrend, VWAP, OBV and multi-timeframe bias with the DhanHQ TypeScript SDK.
---

# Technical Analysis

Built-in technical indicators for algorithmic trading — pure functions over number arrays, plus a multi-timeframe bias engine.

## Indicators

All indicators are pure functions:

```ts
import { rsi, sma, ema, macd, bollinger, atr, adx, stochastic, supertrend, vwap, obv, latest } from "@shubhamtaywade82/dhanhq-ts";

// RSI
const values = [100, 102, 101, 105, 103, 107, /* ... */];
const rsiValues = rsi(values, 14);
console.log(latest(rsiValues)); // most recent value

// Moving averages
sma(values, 20);
ema(values, 20);

// MACD
const macdResult = macd(values);
// macdResult.macd, macdResult.signal, macdResult.histogram

// Bollinger Bands
const bands = bollinger(values, 20, 2);
// bands.upper, bands.middle, bands.lower

// ATR (needs high/low/close arrays)
atr(highs, lows, closes, 14);

// ADX
adx(highs, lows, closes, 14);

// Stochastic
stochastic(highs, lows, closes, 14, 3, 3);

// Supertrend
supertrend(highs, lows, closes, 10, 3);

// VWAP (needs high/low/close/volume)
vwap(highs, lows, closes, volumes);

// OBV
obv(closes, volumes);
```

Every indicator returns an array the same length as its input, with `null` where there is not yet enough data — so indicator output can be indexed by bar without re-aligning it.

## Multi-Timeframe Bias

Compute every timeframe at once and blend them into one trading bias:

```ts
import { TechnicalAnalysis, analyzeMultiTimeframe } from "@shubhamtaywade82/dhanhq-ts";

const analysis = new TechnicalAnalysis(client.charts);

const result = await analysis.compute({
  securityId: "13",
  exchangeSegment: "IDX_I",
  instrument: "INDEX",
  intervals: [5, 15, 60],
});

const { summary } = analyzeMultiTimeframe(result);
// { bias: "bullish" | "bearish" | "neutral",
//   setup: "buy_on_dip" | "sell_on_rally" | ...,
//   confidence: 0.81, ... }
```

## Historical Data

```ts
// Intraday candles
const candles = await client.charts.intraday({
  securityId: "1333",
  exchangeSegment: "NSE_EQ",
  instrument: "EQUITY",
  interval: "5",       // 1, 5, 15, 25, 60 minutes
  fromDate: "2026-07-28",
  toDate: "2026-07-29",
});

// Daily candles
const daily = await client.charts.daily({
  securityId: "13",
  exchangeSegment: "IDX_I",
  instrument: "INDEX",
  fromDate: "2026-06-01",
  toDate: "2026-07-29",
});
```
