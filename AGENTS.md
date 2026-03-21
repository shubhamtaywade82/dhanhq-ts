# AGENTS.md

## Project
TypeScript SDK for DhanHQ trading APIs with WebSocket support.

## Core Rules
- Never place orders without validation
- Never retry order placement automatically
- Always use correlationId for order tracking
- WebSocket drives real-time state; do not replace it with REST polling for exits

## Architecture
- `src/generated` = OpenAPI-generated transport surface, do not edit manually
- `src/resources` = public API wrappers
- `src/ws` = market feed and order update infrastructure
- `src/contracts` = runtime validation for trading-critical inputs
- `src/client` = package entrypoint and shared HTTP/rate-limit logic

## Commands
- `build`: `npm run build`
- `test`: `npm test -- --runInBand`
- `generate`: `npm run generate`

## Boundaries
- Prefer editing `src/resources/*`, `src/ws/*`, `src/contracts/*`, and tests
- Avoid changing `src/generated/*` except via `npm run generate`
- Do not relax validation or retry rules in trading paths without explicit approval

## References
- See `docs/ARCHITECTURE.md`
- See `docs/TRADING_RULES.md`
- See `docs/WS_PROTOCOL.md`
