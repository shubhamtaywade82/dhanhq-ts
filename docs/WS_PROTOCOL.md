# WebSocket Protocol

## Streams

- `MarketFeedWS` connects to the Dhan market feed WebSocket
- `OrderUpdateWS` connects to the Dhan live order update WebSocket
- Do not merge these protocols into one socket abstraction

## Market feed rules

- Request messages are JSON
- Response messages are binary
- Binary packets are little-endian
- A single incoming message may contain multiple packets
- Reconnect must resubscribe tracked instruments automatically

## Current implementation assumptions

- Market feed subscriptions default to full packet mode
- Instrument batching is capped at 100 instruments per subscribe message
- Exchange segment names on inbound packets are resolved from active subscriptions when possible

## Order update rules

- Auth is a JSON login message sent on socket open
- Incoming order updates are JSON
- Order state should be keyed by order ID and correlation ID where available
