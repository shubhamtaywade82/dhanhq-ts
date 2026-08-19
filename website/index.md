---
title: DhanHQ TypeScript SDK — Node.js Trading API Client
description: Production-grade TypeScript SDK for DhanHQ API v2 with WebSocket market data, option analytics, technical analysis, risk management and MCP server tools.
---

# DhanHQ TS <small>TypeScript SDK for DhanHQ API v2</small>

A production-grade **TypeScript SDK and Node.js client** for the [DhanHQ](https://dhanhq.co) trading API. Build algorithmic trading systems for Indian markets (NSE, BSE, MCX) with typed REST APIs, real-time WebSocket market data, options analytics, technical indicators, risk management, and MCP tools for AI trading agents.

<div class="npm-install">

```bash
npm install @nemesis-oss/dhanhq-sdk
```

</div>

<div class="buttons">
  <a href="/getting-started" class="btn btn-primary">Get Started</a>
  <a href="https://github.com/shubhamtaywade82/dhanhq-sdk" class="btn btn-secondary">GitHub</a>
  <a href="https://www.npmjs.com/package/@nemesis-oss/dhanhq-sdk" class="btn btn-secondary">npm</a>
</div>

## Features

- **Typed REST API** — Every endpoint, parameter, and response fully typed from OpenAPI
- **Real-Time WebSocket Market Data** — LTP, OHLCV, 5-level depth, binary packet parsing
- **Order Update Stream** — Real-time order execution events over WebSocket
- **Option Chain & Greeks** — Black-Scholes pricing, Greeks, implied volatility, max pain, PCR
- **Technical Analysis** — SMA, EMA, RSI, MACD, Bollinger, ATR, ADX, Stochastic, Supertrend, VWAP, OBV, multi-timeframe bias
- **Pre-Trade Risk Pipeline** — Market hours, position limits, daily loss, concentration checks
- **Composable Trading Skills** — 11 built-in strategies (iron condor, straddle, covered call, etc.)
- **MCP Server & Agent Tools** — Expose the SDK as tools for LLMs and AI agents

## Quick Example

```ts
import { DhanClient } from "@nemesis-oss/dhanhq-sdk";

const client = new DhanClient({
  token: process.env.DHAN_TOKEN!,
  clientId: process.env.DHAN_CLIENT_ID!,
});

// Place an order
const order = await client.orders.place({
  dhanClientId: "YOUR_CLIENT_ID",
  transactionType: "BUY",
  exchangeSegment: "NSE_FNO",
  productType: "INTRADAY",
  orderType: "MARKET",
  validity: "DAY",
  securityId: "12345",
  quantity: 15,
  correlationId: "entry-001",
});
```

## Next Steps

| Guide | Description |
|-------|-------------|
| [Installation & Setup](/getting-started) | Configure the SDK and authenticate |
| [Orders API](/api/orders) | Place, modify, cancel orders |
| [WebSocket Market Feed](/websocket/market-feed) | Stream live market data |
| [Option Chain & Greeks](/api/option-chain) | Resolve option chains and compute Greeks |
| [Technical Analysis](/analytics/technical-analysis) | Indicators and multi-timeframe bias |
| [MCP Server](/ai/mcp-server) | AI trading agent integration |
| [GitHub](https://github.com/shubhamtaywade82/dhanhq-sdk) | Source code and issues |
| [npm](https://www.npmjs.com/package/@nemesis-oss/dhanhq-sdk) | Package registry |

<hr />

<div class="disclaimer">

**Community project.** This is an independent SDK and is not affiliated with, endorsed by, or supported by Dhan.
Dhan publishes its own official clients as [`dhanhq`](https://www.npmjs.com/package/dhanhq) and [`dhanhq-ts`](https://www.npmjs.com/package/dhanhq-ts).

</div>
