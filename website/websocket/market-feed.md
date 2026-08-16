---
title: DhanHQ WebSocket Market Feed — TypeScript & Node.js
description: Stream real-time market data (LTP, OHLCV, depth) over WebSocket with the DhanHQ TypeScript SDK. Subscribe to equities, indices, F&O, and commodities.
---

# WebSocket Market Feed

Stream real-time LTP, OHLCV, and market depth over WebSocket — the low-latency alternative to REST polling.

## Connection

```ts
await client.ws.connect();

// Wait for the market feed socket to open
client.ws.market.once("open", () => {
  console.log("Market feed connected");
});
```

## Subscribe to Instruments

Subscribe **before** connecting — subscriptions queue up and auto-send on open:

```ts
client.ws.market.subscribe([
  { exchangeSegment: "NSE_EQ", securityId: "1333" },   // HDFCBANK
  { exchangeSegment: "NSE_FNO", securityId: "58072" }, // NIFTY FUT
  { exchangeSegment: "IDX_I", securityId: "13" },      // NIFTY 50
  { exchangeSegment: "MCX_COMM", securityId: "466583" }, // GOLD FUT
]);

await client.ws.connect();
```

## Tick Events

```ts
client.ws.market.on("tick", (tick) => {
  console.log(tick.exchangeSegment, tick.securityId, tick.ltp);
  // Full payload:
  //   ltp, volume, openInterest
  //   dayHigh, dayLow, dayOpen, dayClose
  //   5-level bid/ask (depth)
});
```

## Market Depth

Enable 20-level (default) or 200-level depth:

```ts
client.ws.enableDepth("twenty");    // default: 20 levels
client.ws.enableDepth("twohundred"); // 200 levels, one instrument per connection

client.ws.depth?.subscribe([
  { exchangeSegment: "NSE_EQ", securityId: "1333" },
]);

client.ws.depth?.on("depth", (event) => {
  console.log(event.levels); // top bid/ask levels
});
```

## Unsubscribe

```ts
client.ws.market.unsubscribe([
  { exchangeSegment: "NSE_EQ", securityId: "1333" },
]);
```

## Subscription Modes

| Mode | Description |
|------|-------------|
| `ticker` | LTP only (lightest) |
| `quote` | LTP + OHLCV + depth |
| `full` | Everything (default) |

```ts
// Set mode in DhanWS options, or use enableDepth()
```

## All Segments

The SDK supports all DhanHQ exchange segments:

| Segment | Description |
|---------|-------------|
| `NSE_EQ` | NSE Equities |
| `BSE_EQ` | BSE Equities |
| `NSE_FNO` | NSE F&O (Futures & Options) |
| `NSE_CURRENCY` | NSE Currency Derivatives |
| `BSE_CURRENCY` | BSE Currency Derivatives |
| `MCX_COMM` | MCX Commodities |
| `IDX_I` | Indices (NIFTY, BANKNIFTY, etc.) |
| `BSE_IDX_I` | BSE Indices |

## LTP Store

The SDK maintains an in-memory LTP store updated by the WebSocket feed:

```ts
const ltp = client.ws.ltpStore.get("NSE_EQ:1333");
console.log("Latest LTP:", ltp);
```

For the binary protocol reference, see the [WS Protocol docs](https://github.com/shubhamtaywade82/dhanhq-ts/blob/main/docs/WS_PROTOCOL.md).
