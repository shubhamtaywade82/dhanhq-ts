# Trading Rules

- All order and super-order placement requests must include `correlationId`
- The SDK may generate `correlationId`, but it must always send one
- Do not retry order placement, modification, cancellation, or super-order writes automatically
- Validate trading-critical payloads before transport
- Use WebSocket state for low-latency market and order updates
- Keep LTP data in a single source of truth store
- Generated REST types are not a substitute for runtime validation

Failure to follow these rules creates duplicate-order and stale-state risk.
