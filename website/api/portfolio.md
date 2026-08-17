---
title: DhanHQ Portfolio API — TypeScript & Node.js
description: Query holdings, positions, funds, and statements using the DhanHQ TypeScript SDK for portfolio management.
---

# Portfolio & Funds

## Holdings

```ts
const holdings = await client.positions.listHoldings();
```

## Positions

```ts
const positions = await client.positions.list();

// Convert an intraday position to delivery, or vice versa
await client.positions.convert({
  dhanClientId: process.env.DHAN_CLIENT_ID!,
  fromProductType: "INTRADAY",
  exchangeSegment: "NSE_EQ",
  positionType: "LONG",
  securityId: "1333",
  convertQty: 10,
  toProductType: "CNC",
});

// Square off every open position
await client.positions.exitAll();
```

## Funds

```ts
const limit = await client.funds.getLimit();
// availabelBalance (sic — the upstream API's own spelling), utilizedAmount, etc.
```

## Statements

```ts
// Ledger — no separate trade-book endpoint; use client.orders.getTradeHistory()
// or client.orders.listTrades() for fills.
const ledger = await client.statements.ledger({
  fromDate: "2026-07-01",
  toDate: "2026-07-30",
});
```

## Account-Level Risk Controls

```ts
// Set P&L auto-exit
await client.traderControls.setPnlExit({
  profitValue: 5_000,
  lossValue: 2_500,
  enableKillSwitch: true,
});

await client.traderControls.getPnlExit();
await client.traderControls.stopPnlExit();

// Emergency kill switch
await client.traderControls.setKillSwitch("ACTIVATE");
await client.traderControls.getKillSwitchStatus();
```
