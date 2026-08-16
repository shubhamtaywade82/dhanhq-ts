---
title: DhanHQ Order Update WebSocket — TypeScript & Node.js
description: Receive real-time order execution updates over WebSocket with the DhanHQ TypeScript SDK. Track fills, rejections, and status changes as they happen.
---

# Order Update WebSocket

Receive real-time order execution events — fills, rejections, modifications, and status changes — over a persistent WebSocket connection.

## Connection

Order updates connect automatically when you call `client.ws.connect()`:

```ts
await client.ws.connect();
```

## Listen for Updates

```ts
client.ws.orders.on("order", (order) => {
  console.log(order.status, order.averageTradedPrice, order.tradedQty);
});
```

## Order Tracking

The `OrderTracker` resolves a placed order to its fill using order-update events instead of polling:

```ts
import { OrderTracker } from "@shubhamtaywade82/dhanhq-ts";

const tracker = new OrderTracker();

client.ws.orders.on("order", (state) => tracker.onOrderUpdate(state));

// Register the waiter before placing
const correlationId = "entry-001";
const settled = tracker.waitFor(correlationId, { timeoutMs: 60_000 });

await client.orders.place({ correlationId, /* ... */ });

const fill = await settled;
console.log(fill.status, fill.filledQuantity, fill.averagePrice);
```

## Full Example

See [`examples/ws-execution.ts`](https://github.com/shubhamtaywade82/dhanhq-ts/blob/main/examples/ws-execution.ts) for the complete order placement → fill tracking → exit signal loop.
