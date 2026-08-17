# Introducing DhanHQ TS: A Production-Grade TypeScript SDK for DhanHQ API v2

**A batteries-included TypeScript trading SDK with binary WebSocket market data, option analytics, technical indicators, a pre-trade risk pipeline, and an MCP server for AI trading agents.**

---

## The Problem

If you trade on NSE or BSE through [Dhan](https://dhan.co) and you build in TypeScript or Node.js, your options have been limited. Dhan publishes an official Python SDK (`dhanhq`) and a lightweight JavaScript client (`dhanhq-ts`), but neither gives you what a production trading system actually needs:

- End-to-end type safety from API request to WebSocket tick
- A binary WebSocket parser that doesn't make you reverse-engineer byte offsets
- Option Greeks, implied volatility, and max pain computed locally
- Technical indicators that don't require a separate `ta-lib` dependency
- Pre-trade risk checks that encode actual NSE/BSE rules
- A way to expose your trading infrastructure to an LLM agent safely

You end up stitching together five libraries, writing your own WebSocket parser, and hoping your risk checks don't have a gap at 3:29 PM on expiry day.

[DhanHQ TS](https://github.com/shubhamtaywade82/dhanhq-ts) is my attempt to close that gap. It's a single, typed, production-grade SDK that covers the full lifecycle: authentication, order placement, real-time data, analytics, risk management, and AI agent integration.

```bash
npm install @shubhamtaywade82/dhanhq-ts
```

**Links:**
- GitHub: [github.com/shubhamtaywade82/dhanhq-ts](https://github.com/shubhamtaywade82/dhanhq-ts)
- npm: [npmjs.com/package/@shubhamtaywade82/dhanhq-ts](https://www.npmjs.com/package/@shubhamtaywade82/dhanhq-ts)
- Documentation: [shubhamtaywade82.github.io/dhanhq-ts](https://shubhamtaywade82.github.io/dhanhq-ts/)

---

## What's Inside

The SDK is organized around a single `DhanClient` instance that exposes typed resource clients:

```typescript
import { DhanClient } from "@shubhamtaywade82/dhanhq-ts";

const client = new DhanClient({
  token: process.env.DHAN_TOKEN!,
  clientId: process.env.DHAN_CLIENT_ID!,
});
```

From that one object, you get:

| Namespace | What it does |
|---|---|
| `client.orders` | Place, modify, cancel, track orders |
| `client.portfolio` | Holdings, positions, DP holdings |
| `client.funds` | Margin, limits, charges |
| `client.marketData` | LTP, quotes, OHLC, option chain |
| `client.charts` | Intraday and historical candles |
| `client.ws` | WebSocket market feed + order updates |
| `client.ws.depth` | 20-level market depth |
| `client.globalStocks` | US equities (fractional shares, USD) |
| `client.traderControls` | Kill switch, P&L auto-exit |
| `client.auth` | Token generation, auto-renewal |

Every method returns typed responses generated from DhanHQ's OpenAPI specification. No `any`. No guessing field names. Your IDE autocompletes the entire API surface.

---

## Authentication: Five Methods, One Interface

Trading systems have different secret-management requirements. A weekend backtester wants a static token in `.env`. A production bot wants vault-backed rotation. An autonomous agent wants auto-generated tokens from a TOTP secret.

The SDK supports all five:

```typescript
// 1. Static token
const client = new DhanClient({ token, clientId });

// 2. Provider callback (vault, AWS Secrets Manager, etc.)
const client = new DhanClient({
  clientId,
  tokenProvider: () => vault.read("dhan/token"),
});

// 3. Auto token management (generates from PIN + TOTP)
const client = new DhanClient({ clientId });
client.auth.enableAutoTokenManagement({
  clientId,
  pin: "1234",
  totpSecret: "JBSWY3DPEHPK3PXP",
});

// 4. Environment variables (DHAN_CLIENT_ID, DHAN_ACCESS_TOKEN)
const client = DhanClient.fromEnv();

// 5. Token endpoint (your own auth microservice)
const client = await DhanClient.fromTokenEndpoint({
  endpointBaseUrl: "https://auth.internal.example.com",
  bearerToken: "service-token",
});
```

Two implementation details that matter in production:

- **Concurrent callers share one login.** Parallel token generation can invalidate the previous session. The SDK serializes this internally.
- **Offset-less expiry timestamps are read as IST.** Dhan returns expiry times without timezone offsets. On a UTC server, naive parsing introduces a 5.5-hour drift that can cause premature token refresh or, worse, expired-token errors mid-trade. The SDK handles this correctly.

Full details in the [authentication docs](https://shubhamtaywade82.github.io/dhanhq-ts/getting-started/authentication).

---

## WebSocket: Binary Protocol, Parsed for You

This is where the SDK earns its "production-grade" label.

DhanHQ's market feed uses a compact binary WebSocket protocol. The official JavaScript client gives you raw buffers. DhanHQ TS gives you typed tick objects:

```typescript
await client.ws.connect();

client.ws.market.subscribe([
  { exchangeSegment: "NSE_FNO", securityId: "44321" },
  { exchangeSegment: "NSE_EQ", securityId: "1333" },
]);

client.ws.market.on("tick", (tick) => {
  console.log(tick.ltp);              // Last traded price
  console.log(tick.volumeTradedToday); // Cumulative volume
  console.log(tick.openInterest);      // OI for F&O
});
```

For order execution feedback:

```typescript
client.ws.orders.on("order", (update) => {
  console.log(update.Status);          // "TRADED", "PENDING", etc.
  console.log(update.AvgTradedPrice);
  console.log(update.CumulativeQty);
});
```

For 20-level depth (five bids + five asks, with quantities at each level):

```typescript
client.ws.enableDepth("twenty");
await client.ws.connect();

client.ws.depth?.subscribe([
  { exchangeSegment: "NSE_EQ", securityId: "1333" },
]);

client.ws.depth?.on("depth", (event) => {
  // event.levels: { bids: [...], asks: [...] }
});
```

The binary parser handles all the byte-level work: field extraction, endianness, variable-length encoding. You never touch a `Buffer` directly.

The design principle: **the WebSocket is the real-time truth source.** Use it for LTP, exit logic, and execution-time state. Use REST for placement, reconciliation, and history. The SDK makes both paths equally ergonomic.

---

## Technical Analysis: No External Dependencies

The SDK includes a pure-function technical analysis module. No `ta-lib` bindings. No Python subprocess. No WASM. Just TypeScript functions over number arrays:

```typescript
import {
  sma, ema, rsi, macd, bollingerBands,
  atr, adx, stochastic, supertrend, vwap, obv,
  latest,
} from "@shubhamtaywade82/dhanhq-ts";

const closes = [/* your OHLC close array */];

const rsiValues = rsi(closes, 14);
const currentRsi = latest(rsiValues); // last non-null value

const { macdLine, signalLine, histogram } = macd(closes, 12, 26, 9);

const { upper, middle, lower } = bollingerBands(closes, 20, 2);
```

Every indicator returns an array the same length as its input, with `null` where there isn't enough lookback data. This makes it trivial to align with your candle arrays.

### Multi-Timeframe Bias Engine

This is the feature I use most in my own systems. It computes indicators across multiple intervals and produces a blended directional bias:

```typescript
import { TechnicalAnalysis, analyzeMultiTimeframe } from "@shubhamtaywade82/dhanhq-ts";

const ta = new TechnicalAnalysis(client.charts);

const result = await ta.compute({
  securityId: "13",
  exchangeSegment: "IDX_I",
  instrument: "INDEX",
  intervals: [5, 15, 60], // 5m, 15m, 1h
});

const bias = analyzeMultiTimeframe(result);
console.log(bias.summary);
// {
//   bias: "bullish",
//   setup: "buy_on_dip",
//   confidence: 0.81,
//   signals: { "5": "neutral", "15": "bullish", "60": "bullish" }
// }
```

Higher timeframes are weighted more heavily. A 60-minute bullish signal outweighs a 5-minute bearish one. The confidence score reflects agreement across timeframes.

---

## Option Analytics: Greeks, IV, Max Pain, PCR

For options traders, the SDK computes everything locally from the option chain data:

```typescript
import {
  blackScholes, greeks, impliedVolatility,
  maxPain, putCallRatio, openInterestFromChain,
} from "@shubhamtaywade82/dhanhq-ts";

// Fetch the chain from DhanHQ
const chain = await client.optionChain.fetchNormalized({
  underlyingScrip: 13,
  underlyingSeg: "IDX_I",
  expiry: "2026-08-28",
});

// Compute analytics
const oiData = openInterestFromChain(chain);
const pain = maxPain(oiData);       // Strike with least total OI pain
const pcr = putCallRatio(oiData);   // Put OI / Call OI

// Price a specific option
const price = blackScholes({
  spot: 24_000,
  strike: 24_200,
  timeToExpiry: 10 / 365,
  riskFreeRate: 0.065,
  volatility: 0.15,
  optionType: "call",
});

// Get all Greeks
const g = greeks({
  spot: 24_000,
  strike: 24_200,
  timeToExpiry: 10 / 365,
  riskFreeRate: 0.065,
  volatility: 0.15,
  optionType: "call",
});
// g.delta, g.gamma, g.theta, g.vega, g.rho

// Back out IV from market price
const iv = impliedVolatility({
  marketPrice: 185.50,
  spot: 24_000,
  strike: 24_200,
  timeToExpiry: 10 / 365,
  riskFreeRate: 0.065,
  optionType: "call",
});
```

This means you can build an options dashboard, a volatility scanner, or a max-pain-based expiry strategy without leaving the TypeScript runtime.

---

## Risk Pipeline: Pre-Trade Safety Rails

This is the part most SDKs skip entirely. DhanHQ TS includes a configurable pre-trade risk pipeline that runs before every order hits the exchange:

```typescript
import { Pipeline, riskProviderFor } from "@shubhamtaywade82/dhanhq-ts";

const pipeline = new Pipeline({
  provider: riskProviderFor(client),
  limits: {
    maxQuantity: 50,
    dailyMaxLoss: 25_000,
    maxPositions: 10,
    maxConcentrationPct: 30,
  },
});

// Throws RiskViolationError on first failure
await pipeline.run({ args: order, instrument });

// Or collect all violations for a preview/report
const { passed, violations } = await pipeline.report({ args: order, instrument });
```

The checks encode actual exchange rules:

- **Market hours** — rejects orders outside NSE/BSE sessions
- **ASM/GSM surveillance** — flags restricted securities
- **Concentration** — prevents single-symbol overexposure
- **Daily loss** — halts trading after your max loss threshold
- **Position limits** — caps total open positions
- **Options rules** — validates strike/expiry combinations
- **Product/exchange compatibility** — catches invalid segment+product combos

For account-level controls:

```typescript
// P&L auto-exit (Dhan's built-in feature, configured via API)
await client.traderControls.setPnlExit({
  profitValue: 5_000,
  lossValue: 2_500,
  enableKillSwitch: true,
  productType: ["INTRADAY"],
});

// Emergency kill switch
await client.traderControls.setKillSwitch("ACTIVATE");
```

---

## MCP Server: Your Trading SDK as AI Agent Tools

This is the feature that makes DhanHQ TS different from every other broker SDK I've seen.

The package ships a [Model Context Protocol](https://modelcontextprotocol.io/) server that exposes the entire SDK as tools consumable by Claude, GPT, or any MCP-compatible LLM client:

```bash
DHAN_CLIENT_ID=... DHAN_ACCESS_TOKEN=... npx dhanhq-mcp
```

Claude Desktop configuration:

```json
{
  "mcpServers": {
    "dhanhq": {
      "command": "npx",
      "args": ["-y", "@shubhamtaywade82/dhanhq-ts", "dhanhq-mcp"],
      "env": {
        "DHAN_CLIENT_ID": "your-client-id",
        "DHAN_ACCESS_TOKEN": "your-token",
        "DHANHQ_AGENT_SCOPES": "portfolio:read,market:read,orders:read"
      }
    }
  }
}
```

The security model has two independent gates:

1. **Scope gate** — the policy must hold the required scope (`orders:write`, `risk:write`)
2. **Environment gate** — both `DHANHQ_MCP_ENABLE_WRITES=true` AND `LIVE_TRADING=true` must be explicitly set

An agent with `orders:write` scope still cannot place a trade unless you've explicitly opted into live trading via environment variables. And it can never touch the kill switch or P&L controls — those require a separate `risk:write` scope.

Available tools include instrument search, LTP snapshots, option chains, order preview (validates + risk-checks without placing), order placement, holdings, funds, and emergency controls.

This means you can say to Claude: *"Check my NIFTY positions, compute the current P&L, and if I'm down more than ₹5,000, show me the order I'd need to place to flatten."* The agent uses the SDK tools, hits the risk pipeline, and shows you the preview — but cannot execute without your explicit environment configuration.

---

## Architecture Decisions

A few choices worth calling out:

**Generated from OpenAPI.** The REST types are generated from DhanHQ's published OpenAPI spec (`openapi.json` in the repo). When Dhan updates their API, regenerating types is a script run, not a manual audit.

**Dual ESM/CJS output.** Built with `tsup`. Works with `import` and `require`. Per-format `.d.ts` and `.d.mts` declarations. No `"type": "module"` headaches.

**Rate limiting built in.** Uses `bottleneck` internally. You won't accidentally hammer Dhan's rate limits during a burst of order modifications.

**Zero runtime dependencies beyond essentials.** `axios`, `ws`, `zod`, `bottleneck`, `events`, `form-data`. No 200-package dependency tree.

**Composable trading skills.** Eleven pre-built strategy primitives (momentum entry, mean reversion, breakout, etc.) that compose with the risk pipeline and order tracker.

---

## What It's Not

Let me be direct about boundaries:

- **Not affiliated with Dhan.** This is an independent community project. Dhan publishes its own official clients.
- **Not a backtesting framework.** It's an execution and data SDK. Bring your own backtester.
- **Not financial advice.** The analytics compute numbers. What you do with them is your responsibility.
- **Not battle-tested at institutional scale.** It's production-grade in the sense that it handles errors, retries, rate limits, and edge cases correctly. It's not been running a ₹100 crore book for three years.

---

## Getting Started

```bash
npm install @shubhamtaywade82/dhanhq-ts
```

```typescript
import { DhanClient } from "@shubhamtaywade82/dhanhq-ts";

const client = new DhanClient({
  token: process.env.DHAN_TOKEN!,
  clientId: process.env.DHAN_CLIENT_ID!,
});

// Place an order
await client.orders.place({
  dhanClientId: process.env.DHAN_CLIENT_ID!,
  transactionType: "BUY",
  exchangeSegment: "NSE_FNO",
  productType: "INTRADAY",
  orderType: "MARKET",
  validity: "DAY",
  securityId: "44321",
  quantity: 15,
  correlationId: "my-strategy-001",
});

// Stream real-time data
await client.ws.connect();
client.ws.market.subscribe([
  { exchangeSegment: "NSE_FNO", securityId: "44321" },
]);
client.ws.market.on("tick", (t) => console.log(t.ltp));
```

Full documentation with guides for every module: [shubhamtaywade82.github.io/dhanhq-ts](https://shubhamtaywade82.github.io/dhanhq-ts/)

---

## Links

- **GitHub:** [github.com/shubhamtaywade82/dhanhq-ts](https://github.com/shubhamtaywade82/dhanhq-ts)
- **npm:** [npmjs.com/package/@shubhamtaywade82/dhanhq-ts](https://www.npmjs.com/package/@shubhamtaywade82/dhanhq-ts)
- **Documentation:** [shubhamtaywade82.github.io/dhanhq-ts](https://shubhamtaywade82.github.io/dhanhq-ts/)
- **DhanHQ Official API Docs:** [dhanhq.co/docs/v2](https://dhanhq.co/docs/v2/)
- **DhanHQ API Community:** [community.dhanhq.co](https://community.dhanhq.co/)

---

## What's Next

The current version is **0.3.1**. The roadmap includes:

- Expanded global stocks coverage (US options)
- WebSocket reconnection with exponential backoff and state recovery
- Additional trading skills (pairs trading, volatility arbitrage)
- A React hooks package for dashboard builders
- OpenTelemetry instrumentation for order latency tracking

If you build algo trading systems in TypeScript and use Dhan as your broker, I'd genuinely appreciate a star on the [GitHub repo](https://github.com/shubhamtaywade82/dhanhq-ts), an install from [npm](https://www.npmjs.com/package/@shubhamtaywade82/dhanhq-ts), or a question in the issues. The SDK improves fastest when real trading systems stress-test its edges.

---

*Shubham Taywade builds trading infrastructure in TypeScript and Ruby. He maintains the [DhanHQ TypeScript SDK](https://github.com/shubhamtaywade82/dhanhq-ts) and the [DhanHQ Ruby SDK](https://github.com/shubhamtaywade82/dhanhq-client).*
