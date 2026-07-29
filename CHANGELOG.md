# Changelog

All notable changes to this project are documented here. The format follows
[Keep a Changelog](https://keepachangelog.com/en/1.1.0/) and this project
adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html).

## [Unreleased]

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

[Unreleased]: https://github.com/shubhamtaywade82/dhanhq-ts/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/shubhamtaywade82/dhanhq-ts/releases/tag/v0.2.0
[0.1.0]: https://github.com/shubhamtaywade82/dhanhq-ts/releases/tag/v0.1.0
