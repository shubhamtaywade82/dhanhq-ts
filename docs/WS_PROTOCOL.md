# WebSocket Protocol

## Streams

- `MarketFeedWS` connects to the Dhan market feed WebSocket (`wss://api-feed.dhan.co`)
- `MarketDepthWS` connects to the 20-level (`wss://depth-api-feed.dhan.co/twentydepth`) or 200-level (`wss://full-depth-api.dhan.co/twohundreddepth`) full market depth WebSocket
- `OrderUpdateWS` connects to the Dhan live order update WebSocket (`wss://api-order-update.dhan.co`)
- `DhanWS` provides a unified entrypoint for managing all three sockets (`market`, `orders`, and optional `depth`).

## Market feed rules (`MarketFeedWS`)

- Request messages are JSON (`RequestCode` 15 for Ticker, 17 for Quote, 21 for Full)
- Response messages are binary
- Binary packets are little-endian (8-byte header: packet code, length, segment, security ID)
- A single incoming message may contain multiple packets
- Exchange segment names on inbound packets are resolved from active subscriptions when possible
- Instrument batching is capped at 100 instruments per subscribe message

## Market depth rules (`MarketDepthWS`)

- **20-Level Depth**: `wss://depth-api-feed.dhan.co/twentydepth` (up to 50 instruments: NSE_EQ and NSE_FNO)
- **200-Level Depth**: `wss://full-depth-api.dhan.co/twohundreddepth` (1 instrument per connection)
- Subscription requests use `RequestCode: 23` JSON format
- Binary response packets use a **12-byte header** + 16-byte level payload:
  - Header: `int16 LE messageLength`, `uint8 responseCode` (41 = Bid, 51 = Ask), `uint8 exchangeSegmentCode`, `int32 LE securityId`, `uint32 LE seq/rowCount`
  - Levels (16 bytes each): `float64 LE price`, `uint32 LE quantity`, `uint32 LE orderCount`
- Emits `"depth"`, `"depth20"`, and `"depth200"` events with typed `MarketDepthEvent` payloads.

## Order update rules (`OrderUpdateWS`)

- Auth is a JSON login message sent on socket open
- Incoming order updates are JSON
- Order state is stored in `OrderStore` keyed by order ID and correlation ID

## Reconnect & Resilience

- All WS classes inherit from `BaseWS` and support exponential backoff with jitter (`reconnectDelayMs`, `maxReconnectDelayMs`)
- Optional `maxReconnectAttempts` parameter stops retries when a limit is exceeded and emits a `"reconnect_failed"` event
- Automatic token resolution via `tokenProvider` handles re-authentication before reconnection
