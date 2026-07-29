# DhanHQ TS — TypeScript SDK for Dhan API (v2)

Production-grade TypeScript SDK for DhanHQ APIs with **WebSocket market feed**, **order execution safety**, and **Node-first support with browser-safe read-only usage where transport limits allow**.

---

## Why This SDK

- Typed API generated from OpenAPI
- Real-time market data with binary WebSocket parsing
- Safe order execution with validation, `correlationId`, and no blind retries
- Built for Node.js trading systems, bots, and backend services
- Exposes both ergonomic resources and the low-level generated client
- Batteries included above the transport layer:
  - **Technical analysis** — SMA/EMA/WMA, RSI, MACD, Bollinger, ATR, ADX, Stochastic, Supertrend, VWAP, OBV, plus a multi-timeframe bias engine
  - **Option analytics** — Black-Scholes pricing, Greeks, implied volatility, max pain, PCR, OI walls
  - **Risk pipeline** — pre-trade checks wired into every agent order path
  - **Skills** — eleven composable trading strategies that stop at a reviewable intent
  - **Agent tools + MCP server** — the whole SDK exposed to LLM clients behind a scope and live-trading gate

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

### 5. Market Data, Instruments and Option Chains

```ts
// Resolve a symbol to a security id (scrip master, cached in memory)
const [reliance] = await client.instruments.search("RELIANCE");

// Snapshot prices for up to 1000 instruments at once
await client.marketFeed.ltp({ NSE_EQ: [reliance.securityId] });
await client.marketFeed.quote({ IDX_I: [13] });

// Option chain, flattened into a sorted list of strikes
const chain = await client.optionChain.fetchNormalized({
  underlyingScrip: 13,
  underlyingSeg: "IDX_I",
  expiry: "2026-02-26",
});
```

---

### 6. Technical Analysis

```ts
import { TechnicalAnalysis, analyzeMultiTimeframe, rsi, latest } from "@dhanhq/client";

// Indicators are pure functions over number arrays
latest(rsi([100, 102, 101, 105 /* … */], 14));

// Or compute every timeframe at once and blend them into one bias
const analysis = new TechnicalAnalysis(client.charts);
const result = await analysis.compute({
  securityId: "13",
  exchangeSegment: "IDX_I",
  instrument: "INDEX",
  intervals: [5, 15, 60],
});

analyzeMultiTimeframe(result).summary;
// { bias: "bullish", setup: "buy_on_dip", confidence: 0.81, … }
```

Every indicator returns an array the same length as its input, with `null`
where there is not yet enough data — so indicator output can be indexed by bar
without re-aligning it.

---

### 7. Option Analytics

```ts
import { greeks, impliedVolatility, maxPain, openInterestFromChain } from "@dhanhq/client";

greeks({
  spot: 24_000,
  strike: 24_200,
  timeToExpiry: 10 / 365,
  riskFreeRate: 0.065,
  volatility: 0.15,
  optionType: "call",
});

maxPain(openInterestFromChain(chain));
```

---

### 8. Risk Pipeline

```ts
import { Pipeline, riskProviderFor } from "@dhanhq/client";

const pipeline = new Pipeline({
  provider: riskProviderFor(client),
  limits: { maxQuantity: 50, dailyMaxLoss: 25_000 },
});

// Throws RiskViolationError on the first failure …
await pipeline.run({ args: order, instrument });

// … or collect every violation for a preview
const { passed, violations } = await pipeline.report({ args: order, instrument });
```

Checks cover trading permission, ASM/GSM restrictions, product support,
order type, quantity and notional, market hours, position count,
single-symbol concentration, daily loss, and options-specific rules. Account
checks are skipped — not failed — when no data provider is configured, so the
pipeline stays usable offline for order-shape validation.

These checks encode NSE/BSE rules and resolve instruments from the Indian
scrip master; they do not apply to non-Indian books.

---

### 9. Skills

Skills are named sequences of steps over a shared context. The structure
skills stop at an `intent` — they resolve strikes and premiums but never place
orders, leaving execution to an explicit, separately-gated call.

```ts
import { createSkillRegistry } from "@dhanhq/client";

const skills = createSkillRegistry();

const { intent } = await skills.call(
  "iron_condor",
  { symbol: "NIFTY", expiry: "2026-02-26", wingWidth: 200 },
  client,
);
```

| Skill | Risk | Scope |
| --- | --- | --- |
| `buy_atm_call`, `straddle`, `strangle` | `trade_adjacent_read` | `orders:read` |
| `iron_condor`, `bull_put_spread`, `bear_call_spread` | `trade_adjacent_read` | `orders:read` |
| `covered_call`, `protective_put` | `trade_adjacent_read` | `orders:read` |
| `market_data_summarizer` | `read_only` | `market:read` |
| `square_off_all`, `square_off_position` | `destructive_write` | `orders:write` |

---

### 10. Agent Tools and MCP

Every resource, analysis helper and skill is exposed as a tool behind a
permission policy.

```ts
import { AgentToolRegistry, Policy } from "@dhanhq/client";

const tools = new AgentToolRegistry({ client, policy: Policy.readOnly() });

await tools.execute("dhan_search_instruments", { query: "NIFTY" });
await tools.execute("dhan_order_preview", order); // validation + risk, places nothing
```

Two independent gates guard writes: the policy must hold the scope, **and**
both `DHANHQ_MCP_ENABLE_WRITES=true` and `LIVE_TRADING=true` must be set.
Read tools need only the scope.

Run the MCP server over stdio:

```bash
DHAN_CLIENT_ID=... DHAN_ACCESS_TOKEN=... npx dhanhq-mcp
```

Claude Desktop / MCP client configuration:

```json
{
  "mcpServers": {
    "dhanhq": {
      "command": "npx",
      "args": ["-y", "@dhanhq/client", "dhanhq-mcp"],
      "env": {
        "DHAN_CLIENT_ID": "...",
        "DHAN_ACCESS_TOKEN": "...",
        "DHANHQ_AGENT_SCOPES": "portfolio:read,market:read,orders:read"
      }
    }
  }
}
```

The server exposes tools, six account resources (`dhanhq://account/*`,
`dhanhq://market/capabilities`) and five prompt templates.

---

## Architecture

```text
REST (OpenAPI Generated)
    ↓
Resources Layer  ──────────────┐
    ↓                          │
Validation + Safe Transport    │
    ↓                          ↓
WebSocket Engine        TA / Analytics / Risk
                               ↓
                        Skills → Agent Tools → MCP Server
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

### Smoke Test

```bash
npm run smoke
```

Relies on `.env` carrying `DHAN_TOKEN` and `DHAN_CLIENT_ID`.

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
  agent/         # Policy, tool catalogue, registry, order preview
  ai/            # prompt helpers for LLM assistants
  analytics/     # Black-Scholes, Greeks, IV, max pain, PCR
  auth/          # token helpers, TOTP, token lifecycle
  bin/           # dhanhq-mcp executable
  client/        # DhanClient, transport coordination, generated bootstrap
  contracts/     # runtime validation for trading-critical requests
  errors/        # normalized SDK error types
  generated/     # OpenAPI-generated low-level client
  mcp/           # JSON-RPC 2.0 stdio MCP server
  resources/     # public SDK resource surface
  risk/          # pre-trade check pipeline, position sizing, trailing stops
  skills/        # composable trading strategies (11 builtins)
  ta/            # indicators, candles, market calendar, multi-timeframe bias
  types/         # shared TypeScript types
  ws/            # market feed, order updates, packet parsers, stores
  constants.ts   # exchange segments, product/order types, rate limits
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

- [x] Expand higher-level trading helpers beyond raw resource wrappers
- [x] Technical analysis, option analytics and a pre-trade risk pipeline
- [x] Composable skills, agent tools and an MCP server
- [ ] Add deeper WebSocket examples for execution orchestration
- [ ] Improve browser-safe read-only integration guidance
- [ ] Add advanced risk management examples around pnl exit and kill switch
- [ ] Global Stocks (US equities) book under `/v2/globalstocks/*`

---

## License

MIT
