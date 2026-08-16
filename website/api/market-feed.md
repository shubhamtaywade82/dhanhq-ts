---
title: DhanHQ Market Feed API — TypeScript & Node.js
description: Fetch LTP, quote, and OHLC data for equities, indices, F&O, and commodities using the DhanHQ TypeScript SDK REST endpoints.
---

# Market Feed (REST)

Snapshot market data for up to 1,000 instruments at once via REST, keyed by
exchange segment with numeric or string security IDs:

```ts
const instruments = { NSE_EQ: ["1333", "2885"], IDX_I: ["13", "25"] };
```

## LTP

```ts
const data = await client.marketFeed.ltp(instruments);
```

## OHLC

```ts
const ohlc = await client.marketFeed.ohlc(instruments);
```

## Quote

Full quote — LTP, volume, open interest, OHLC, and market depth:

```ts
const quote = await client.marketFeed.quote(instruments);
```

For real-time streaming data, use the [WebSocket market feed](/websocket/market-feed).
