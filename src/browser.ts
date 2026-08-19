/**
 * Browser-safe subset of the SDK — pure computation, no credentials, no
 * network calls. See `docs/BROWSER.md` for why the rest of the package
 * can't follow and the backend-proxy pattern for using this alongside it.
 *
 * This isn't just tree-shakeable from the main entry point — every export
 * here is structurally unreachable from `src/client`, `src/resources`,
 * `src/ws`, `src/agent`, and `src/mcp`, so nothing that touches a token or
 * makes a request can end up in a bundle that imports only
 * `@nemesis-oss/dhanhq-sdk/browser`, regardless of how the consumer's
 * bundler tree-shakes.
 */

// Technical analysis — pure functions over arrays. `TechnicalAnalysis` (the
// class that fetches candles itself) is deliberately not re-exported here:
// it takes a `Charts` instance, which needs a token, which has no place in
// a browser.
export * from "./ta/candles";
export * from "./ta/indicators";
export * from "./ta/marketCalendar";
export * from "./ta/multiTimeframe";

// Option analytics — Black-Scholes, Greeks, implied volatility, max pain, PCR.
export * from "./analytics";

// Position sizing, stop placement, and the pre-trade risk pipeline.
// Account-state checks (position limits, concentration, daily loss) are
// no-ops without a `RiskDataProvider` — a browser has no legitimate way to
// supply one — but order-shape checks (quantity, notional, market hours,
// options rules) still run against the numbers you pass in.
export * from "./risk";

// Turns fills and ticks into positions, exposure, and exit signals. Decides,
// never executes — feed it data from your own WebSocket and let your
// backend act on what it emits.
export * from "./execution";

// Order- and contract-shape validation — useful for validating a form
// before it ever reaches your backend.
export * from "./contracts/charts.schema";
export * from "./contracts/expired-options.schema";
export * from "./contracts/global-stocks.schema";
export * from "./contracts/option-chain.schema";
export * from "./contracts/order.schema";
export * from "./contracts/super-order.schema";

export * as Constants from "./constants";
