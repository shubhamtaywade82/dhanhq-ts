---
title: DhanHQ Risk Management — TypeScript & Node.js
description: Pre-trade risk pipeline, position sizing, trailing stops, and account-level risk controls for algorithmic trading with the DhanHQ TypeScript SDK.
---

# Risk Management

Multi-layer risk management: pre-trade checks, position monitoring, and account-level controls.

## Pre-Trade Pipeline

Validates every order before it reaches the exchange:

```ts
import { Pipeline, riskProviderFor } from "@shubhamtaywade82/dhanhq-ts";

const pipeline = new Pipeline({
  provider: riskProviderFor(client),
  limits: { maxQuantity: 50, dailyMaxLoss: 25_000 },
});

// Throws RiskViolationError on first failure
await pipeline.run({ args: order, instrument });

// Collect all violations for preview
const { passed, violations } = await pipeline.report({ args: order, instrument });
```

Checks cover:
- Trading permission (exchange open/close)
- ASM/GSM restriction status
- Product support for the instrument
- Order type validity
- Quantity and notional limits
- Market hours (NSE/BSE)
- Position count limits
- Single-symbol concentration
- Daily loss threshold
- Options-specific rules (lot size, strike validity)

These checks are NSE/BSE-specific and do not apply to Global Stocks.

## Position Monitor

Real-time exit signals driven by WebSocket ticks:

```ts
import { PositionMonitor } from "@shubhamtaywade82/dhanhq-ts";

const monitor = new PositionMonitor();

client.ws.market.on("tick", (tick) => monitor.onTick(tick));

monitor.track({
  securityId: "2885",
  exchangeSegment: "NSE_EQ",
  quantity: 100,
  entryPrice: 1400,
  stopLoss: 1386,
  target: 1428,
  trail: { atr: 7, multiplier: 2 },
});

monitor.on("exit", (signal) => {
  console.log(signal.reason, signal.pnl);
  // reason: "stop_loss" | "target" | "trailing_stop"
});
```

`PositionMonitor` only decides — it never places an order.

## Account-Level Controls

```ts
// Auto-square-off at profit/loss thresholds
await client.traderControls.setPnlExit({
  profitValue: 5_000,
  lossValue: 2_500,
  enableKillSwitch: true,
});

// Emergency block
await client.traderControls.setKillSwitch("ACTIVATE");
```

## Position Sizing

```ts
import { positionSizing } from "@shubhamtaywade82/dhanhq-ts";

const size = positionSizing({
  accountSize: 1_000_000,
  riskPerTrade: 0.02,   // 2%
  stopLossPoints: 50,
  entryPrice: 100,
});
```

## Trailing Stops

```ts
import { trailingStop } from "@shubhamtaywade82/dhanhq-ts";

// ATR-based trailing stop
const stop = trailingStop.atr({ atr: 7, multiplier: 2, highestHigh: 1428 });
// Fixed percentage
const stop2 = trailingStop.percent({ trailPercent: 0.02, highestHigh: 1428 });
```
