# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

## [0.4.1] — 2026-08-02

### Fixed

- **`RATE_LIMITS` (option chain 1 req/3s, orders 10/s, etc.) was dead data.**
  `HttpClient` applied one flat Bottleneck queue per GET/write regardless of
  endpoint, so nothing stopped back-to-back `getOptionChain()` calls from
  blowing through Dhan's real 3-second limit and drawing error 805.
  `RateLimiter` now keeps a Bottleneck per tier alongside the generic
  read/write queues; a request layers its tier's stricter spacing on top via
  an optional `tier` field on `RequestOptions`. Wired into
  `OptionChain.fetch()`/`expiryList()` (hard 3s lock) and every
  `Orders`/`SuperOrders`/`ForeverOrders` call (10/s). Other resources keep
  the prior generic-only behavior. 8 new tests; 237 total.

## [0.4.0] — 2026-08-02

### Added

- **Live tick-to-candle aggregator** (`CandleAggregator`, `src/ws`) — builds
  OHLCV bars in real time from `ticker`/`full` WS packets, the missing piece
  between the parsed market feed and the REST-only `candlesFromSeries()`.
  Per-bar volume is derived as a delta against Dhan's cumulative day volume
  and self-corrects (re-bases instead of going negative) on a day rollover or
  feed restart. `seed()` primes a bucket from historical data on connect;
  `flush()`/`flushAll()` close out in-progress bars on the caller's own
  schedule — the aggregator itself holds no timers. 7 new tests; 232 total.
- **Authentication** — `TokenResponse` with `isExpired`, `expiresIn`,
  `needsRefresh` and the account fields (`clientName`, `ucc`,
  `powerOfAttorney`); `AuthenticationError` carrying the broker's own
  `errorMessage`; `DhanClient.fromEnv()`; `totpProvider` for supplying a code
  from a hardware token or MFA service instead of storing a TOTP secret;
  `DhanAuth.totpSecondsRemaining()`; and `TokenManager` gained `getToken()`,
  `clear()` and an `onToken` callback. Documented in `docs/AUTHENTICATION.md`.

### Fixed

- **Concurrent token refresh started one login per caller.** `TokenManager`
  now coalesces in-flight logins. Generating a token can invalidate the
  previous one, so a burst of traffic could leave the SDK holding a token the
  broker had already replaced.
- **Expiry timestamps without a timezone were parsed as local time.** Dhan
  returns IST, and the ECMAScript spec parses an offset-less date-time as
  local — on a UTC server that read an expiry 5.5 hours late, so a token
  looked valid well after the API began rejecting it. Offset-less timestamps
  are now pinned to IST, and an unparseable expiry fails closed.
- **Auth failures threw a raw `AxiosError`.** They now raise
  `AuthenticationError`, consistent with every other path in the SDK, and no
  longer discard the broker's `errorMessage`.

### Added

- **Global Stocks** (`/v2/globalstocks/*`) — the US equities book as
  `client.globalStocks`, with orders, holdings, trades, USD funds, market
  status and a margin/charges estimator. Fractional quantities and `AMOUNT`
  (notional) orders are supported, with a zod contract enforcing the
  quantity-vs-amount rule and bracket levels on the correct side of entry.
  `costSummary()` combines charges and margin into one affordability decision.
  Kept in its own namespace so USD and INR positions never blend.
- **Execution helpers** (`src/execution`) — `OrderTracker` resolves a placed
  order to its fill from order-update events rather than polling, keyed by
  correlation id or order id; `PositionMonitor` turns market ticks into exit
  signals for stop loss, target and an ATR trailing stop. Both are
  decision-only and never place orders.
- **Trader control tools** — `dhan_kill_switch`, `dhan_kill_switch_status`,
  `dhan_set_pnl_exit`, `dhan_stop_pnl_exit`, `dhan_pnl_exit_status`. These are
  the only users of the `risk:write` scope, which is deliberately separate
  from `orders:write`.
- **Global Stocks tools** — nine `dhan_global_*` tools. The registry now
  exposes 46 tools in total.
- `docs/BROWSER.md` covering why browser use fails (credential exposure and
  the absence of CORS headers on `api.dhan.co`), the backend-proxy pattern
  that works, and which modules are genuinely browser-safe.
- Examples: `ws-execution.ts` (fill tracking and tick-driven exits),
  `risk-controls.ts` (pipeline, P&L exit, kill switch) and `global-stocks.ts`.
- 36 further tests; 177 total.

### Changed

- The published `exports` map, `README` and docs reflect the new surface.


## [0.2.0] — 2026-07-29

First release published to npm, as `@shubhamtaywade82/dhanhq-ts`.

> This is a community SDK. It is not affiliated with or endorsed by Dhan.
> Dhan publishes its own official clients as `dhanhq` and `dhanhq-ts`.

### Added

- **Resources** — `Profile`, `MarketFeed` (ltp/ohlc/quote), `OptionChain`
  (raw plus a normalized, strike-sorted view) and `Instruments`, which caches
  parsed scrip-master segments in memory and shares one download between
  concurrent cold reads.
- **Constants** — exchange segments, product/order types, feed codes,
  rate-limit tiers and the scrip-master segment map, exported as `Constants`.
- **Technical analysis** (`src/ta`) — SMA, EMA, WMA, RSI, MACD, Bollinger
  Bands, ATR, ADX, Stochastic, Supertrend, VWAP and OBV; candle resampling;
  the NSE trading calendar; and a multi-timeframe bias engine that weights
  higher timeframes more heavily. Indicator output is aligned to its input,
  with `null` in the leading positions.
- **Option analytics** (`src/analytics`) — Black-Scholes pricing, Greeks,
  implied volatility, max pain, put-call ratios and OI concentration.
- **Risk pipeline** (`src/risk`) — pre-trade checks for trading permission,
  ASM/GSM restrictions, product support, order type, quantity and notional,
  market hours, position count, single-symbol concentration, daily loss and
  options-specific rules; plus position sizing, stop placement and a trailing
  stop manager.
- **Skills** (`src/skills`) — eleven composable strategies over a shared
  context. Option structures stop at a reviewable intent and never place
  orders.
- **Agent tools** (`src/agent`) — `Policy`, the tool catalogue and
  `AgentToolRegistry`. Writes require both the declared scope and
  `DHANHQ_MCP_ENABLE_WRITES=true` with `LIVE_TRADING=true`.
- **MCP server** (`src/mcp`, `src/bin`) — JSON-RPC 2.0 over stdio, exposing
  the tool registry, six account resources and five prompt templates.
  Published as the `dhanhq-mcp` binary and importable from
  `@shubhamtaywade82/dhanhq-ts/mcp`.
- **Prompt helpers** (`src/ai`) — portfolio, risk and market-analysis prompts
  for LLM assistants.
- 126 tests across six new spec files.

### Changed

- `Constants` and the agent tool schemas (`ToolSchemas`) are exported under
  namespaces, so the constant enums no longer collide with the string-literal
  types in `types/order.types` and the zod contracts in `contracts/`.
- `DhanClient` gained `profile`, `marketFeed`, `optionChain` and `instruments`.
- `DhanClientConfig` gained `instrumentCacheTtlMs`.

### Removed

- The unused `uuid` dependency. Order correlation ids come from the Node
  built-in `crypto.randomUUID`.

### Fixed

- A stray `examples` entry in `.gitignore` that shadowed the tracked example
  files.

## [0.1.0]

Initial pre-release: REST resources, contracts, WebSocket market feed and
order updates, auth helpers, and the OpenAPI-generated transport layer.

[Unreleased]: https://github.com/shubhamtaywade82/dhanhq-ts/compare/v0.4.1...HEAD
[0.4.1]: https://github.com/shubhamtaywade82/dhanhq-ts/compare/v0.4.0...v0.4.1
[0.4.0]: https://github.com/shubhamtaywade82/dhanhq-ts/compare/v0.2.0...v0.4.0
[0.2.0]: https://github.com/shubhamtaywade82/dhanhq-ts/releases/tag/v0.2.0
[0.1.0]: https://github.com/shubhamtaywade82/dhanhq-ts/releases/tag/v0.1.0
