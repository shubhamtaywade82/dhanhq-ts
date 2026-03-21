# DhanHQ TS — TypeScript SDK for Dhan API (v2)

Production-grade TypeScript SDK for DhanHQ APIs with **WebSocket market feed**, **order execution safety**, and **Node-first support with browser-safe read-only usage where transport limits allow**.

---

## Why This SDK

- Typed API generated from OpenAPI
- Real-time market data with binary WebSocket parsing
- Safe order execution with validation, `correlationId`, and no blind retries
- Built for Node.js trading systems, bots, and backend services
- Exposes both ergonomic resources and the low-level generated client

---

## Installation

Install from GitHub until the package is published to npm:

```bash
npm install git+https://github.com/shubhamtaywade82/dhanhq-ts.git
```

Local development install also works:

```bash
npm install /absolute/path/to/dhanhq-ts
```

When the package is published, the install command will be:

```bash
npm install @dhanhq/client
```

---

## Quick Start

### 1. Initialize Client

```ts
import { DhanClient } from "@dhanhq/client";

const client = new DhanClient({
  token: process.env.DHAN_TOKEN!,
  clientId: process.env.DHAN_CLIENT_ID!,
});
```

---

### 2. Place Order

```ts
await client.orders.place({
  dhanClientId: process.env.DHAN_CLIENT_ID!,
  transactionType: "BUY",
  exchangeSegment: "NSE_FNO",
  productType: "INTRADAY",
  orderType: "MARKET",
  validity: "DAY",
  securityId: "12345",
  quantity: 15,
  correlationId: "strategy-entry-001",
});
```

---

### 3. Start WebSocket Market Feed

```ts
await client.ws.connect();

client.ws.market.subscribe([
  { exchangeSegment: "NSE_FNO", securityId: "12345" },
]);

client.ws.market.on("tick", (tick) => {
  console.log(tick.ltp);
});
```

---

### 4. Listen for Real-time Order Updates

```ts
client.ws.orders.on("order", (order) => {
  console.log(order.Status, order.AvgTradedPrice);
});
```

---

## Architecture

```text
REST (OpenAPI Generated)
    ↓
Resources Layer
    ↓
Validation + Safe Transport
    ↓
WebSocket Engine (real-time)
```

---

## Key Concepts

### 1. Correlation ID (MANDATORY)

Every trading order should include a `correlationId` for:

- idempotency
- recovery via `/orders/external/{id}`
- traceability across order placement and execution updates

---

### 2. WebSocket is the Real-time Truth Source

- LTP should come from WebSocket, not REST polling
- execution and exit logic should react to WS events
- REST is for placement, reconciliation, and history

---

### 3. No Blind Retries

Order placement is **never auto-retried**.

Only safe retries are allowed for non-order operations such as:

- transient network failures
- selected `5xx` responses
- auth refresh on `401` when a token provider is configured

---

## Environment Support

| Feature | Node | Browser |
| --- | --- | --- |
| REST API | ✅ | ⚠️ |
| WebSocket Feed | ✅ | ⚠️ |
| Order Placement | ✅ | ⚠️ backend recommended |
| Trading Automation | ✅ | ❌ |

Browser use should be limited to read-only or carefully proxied scenarios. Do not expose trading credentials in frontend applications.

---

## Examples

See `/examples`:

- `place-order.ts`
- `ws-feed.ts`
- `full-bot.ts`
- `basic.ts`

---

## Development

```bash
npm install
npm run build
npm test -- --runInBand
```

Repository:

```text
https://github.com/shubhamtaywade82/dhanhq-ts
```

---

## Generate API Client

```bash
npm run generate
```

This uses `openapi.json` to regenerate the typed API layer under `src/generated`.

---

## Project Structure

```text
src/
  auth/          # token helpers, TOTP, token lifecycle
  client/        # DhanClient, transport coordination, generated bootstrap
  resources/     # public SDK resource surface
  contracts/     # runtime validation for trading-critical requests
  errors/        # normalized SDK error types
  generated/     # OpenAPI-generated low-level client
  types/         # shared TypeScript types
  ws/            # market feed, order updates, packet parsers, stores
```

---

## Safety Notes (READ THIS)

- Do not expose API tokens in frontend code
- Do not retry order placement automatically
- Always validate trading inputs before transport
- Use WebSocket for exit logic and execution-time state
- Prefer `correlationId` on every strategy-originated order

---

## Advanced Auth

The SDK supports:

- static `token`
- dynamic `tokenProvider`
- `onTokenExpired` hook
- TOTP generation helpers
- web-token renewal helpers
- order-update WebSocket auth for `SELF` and `PARTNER`

See `docs/` and `AGENTS.md` for repo-level architecture and trading constraints.

---

## Roadmap

- [ ] Expand higher-level trading helpers beyond raw resource wrappers
- [ ] Add deeper WebSocket examples for execution orchestration
- [ ] Improve browser-safe read-only integration guidance
- [ ] Add advanced risk management examples around pnl exit and kill switch

---

## License

MIT
