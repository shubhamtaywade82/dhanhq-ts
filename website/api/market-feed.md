---
title: DhanHQ Market Feed API — TypeScript & Node.js
description: Fetch LTP, quote, and OHLC data for equities, indices, F&O, and commodities using the DhanHQ TypeScript SDK REST endpoints.
---

# Market Feed (REST)

Snapshot market data for up to 1,000 instruments at once via REST.

## LTP

```ts
const data = await client.marketFeed.ltp({
  NSE_EQ: ["1333", "2885"],
  IDX_I: ["13", "25"],
});
```

## Quote

Returns LTP, volume, OI, OHLC, and 5-level depth:

```ts
const quote = await client.marketFeed.quote({
  NSE_EQ: ["1333"],
});
```

## Full Market Data

```ts
const full = await client.marketFeed.full({
  NSE_FNO: ["58072"],
});
```

For real-time streaming data, use the [WebSocket market feed](/websocket/market-feed).
