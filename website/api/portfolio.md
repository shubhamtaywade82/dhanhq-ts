---
title: DhanHQ Portfolio API — TypeScript & Node.js
description: Query holdings, positions, funds, and statements using the DhanHQ TypeScript SDK for portfolio management.
---

# Portfolio & Funds

## Holdings

```ts
const holdings = await client.positions.holdings();
```

## Positions

```ts
const positions = await client.positions.getAll();
```

## Funds

```ts
const limits = await client.funds.getLimits();
// Available balance, margin used, etc.
```

## Statements

```ts
// Trade book
const trades = await client.statements.tradeBook({
  fromDate: "2026-07-01",
  toDate: "2026-07-30",
});

// Ledger
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

// Emergency kill switch
await client.traderControls.setKillSwitch("ACTIVATE");

// Stop auto-exit
await client.traderControls.stopPnlExit();
```
