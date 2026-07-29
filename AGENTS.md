# AGENTS.md

## Project
TypeScript SDK for the DhanHQ v2 API: REST, WebSocket, technical analysis,
option analytics, a pre-trade risk pipeline, composable trading skills, agent
tools and an MCP server.

## Core Rules
- Never place orders without validation
- Never retry order placement automatically
- Always use correlationId for order tracking
- WebSocket drives real-time state; do not replace it with REST polling for exits
- Agent and MCP writes need both the policy scope and the live-trading gate
  (`DHANHQ_MCP_ENABLE_WRITES=true` **and** `LIVE_TRADING=true`)
- Skills that build option structures stop at an intent; they never place orders
- `PositionMonitor` decides exits but never places orders; the caller acts on the signal
- Global Stocks is a separate book — never blend USD and INR positions in one response
- The risk pipeline is NSE/BSE-specific and does not apply to Global Stocks

## Architecture
- `src/generated` = OpenAPI-generated transport surface, do not edit manually
- `src/resources` = public API wrappers
- `src/ws` = market feed and order update infrastructure
- `src/contracts` = runtime validation for trading-critical inputs
- `src/client` = package entrypoint and shared HTTP/rate-limit logic
- `src/constants.ts` = exchange segments, product/order types, rate limits
- `src/ta` = indicators, candle handling, market calendar, multi-timeframe bias
- `src/analytics` = Black-Scholes, Greeks, implied volatility, max pain, PCR
- `src/risk` = pre-trade check pipeline, position sizing, trailing stops
- `src/skills` = composable strategies over a shared context
- `src/agent` = policy, tool catalogue, registry, order preview
- `src/mcp` + `src/bin` = JSON-RPC 2.0 stdio server and its executable
- `src/ai` = prompt helpers for LLM assistants
- `src/execution` = order fill tracking and tick-driven exit signals

Dependency flow is one-directional: `resources → ta/analytics/risk/execution →
skills → agent → mcp`. Nothing below the agent layer knows about policy or MCP.

## Commands
- `build`: `npm run build`
- `test`: `npm test -- --runInBand`
- `typecheck`: `npm run typecheck`
- `generate`: `npm run generate`
- `mcp`: `npm run mcp` (needs `DHAN_CLIENT_ID` and `DHAN_ACCESS_TOKEN`)

## Boundaries
- Prefer editing `src/resources/*`, `src/ws/*`, `src/contracts/*`, and tests
- Avoid changing `src/generated/*` except via `npm run generate`
- Do not relax validation or retry rules in trading paths without explicit approval
- Do not weaken `Policy`, the risk pipeline defaults, or the live-trading gate
- Adding an agent tool means: a schema in `src/agent/schemas.ts` and an entry in
  `src/agent/catalogue.ts`. Handlers carry no permission checks — enforcement
  lives in `AgentToolRegistry` alone.

## References
- See `docs/ARCHITECTURE.md`
- See `docs/TRADING_RULES.md`
- See `docs/WS_PROTOCOL.md`
- See `docs/AGENT_TOOLS.md`
- See `docs/BROWSER.md`
- See `docs/RELEASING.md`
