# Architecture

The SDK has two layers:

1. Generated layer
- `src/generated` is produced from `openapi.json`
- it mirrors the full REST API surface
- it should never be edited manually

2. Custom layer
- `src/resources` exposes the ergonomic SDK API
- `src/contracts` validates trading-critical requests
- `src/client/HttpClient.ts` centralizes rate limiting and safe retry behavior
- `src/ws` contains real-time market and order update infrastructure

## Runtime target

- Primary target: Node-based automation trading
- Secondary target: browser-safe read-only consumers where transport limits allow

## Public package surface

- `DhanClient` for normal SDK use
- `Generated` namespace for low-level direct access
- `client.ws.market` for binary market feed
- `client.ws.orders` for live order updates
