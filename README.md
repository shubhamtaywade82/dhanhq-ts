# @dhanhq/client

TypeScript SDK for DhanHQ REST and WebSocket APIs, built for trading automation.

## What it includes
- OpenAPI-generated low-level REST client under `Generated`
- typed resource wrappers via `DhanClient`
- order and super-order validation with `zod`
- controlled retry and rate limiting
- market feed and order update WebSocket clients

## Commands
- `npm run generate`
- `npm run build`
- `npm test -- --runInBand`

## Where to look
- `src/client` for package entry and transport
- `src/resources` for the public SDK surface
- `src/ws` for market and order update streams
- `docs/` for architecture and trading rules
