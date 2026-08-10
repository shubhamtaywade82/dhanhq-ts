---
title: DhanHQ Orders API — TypeScript & Node.js
description: Place, modify, cancel, and query orders using the DhanHQ TypeScript SDK. Supports equity, F&O, currency, and commodity segments.
---

# Orders API

Place, modify, cancel, and query orders across NSE, BSE, NSE F&O, currency, and MCX segments.

## Place Order

```ts
const order = await client.orders.place({
  dhanClientId: process.env.DHAN_CLIENT_ID!,
  transactionType: "BUY",
  exchangeSegment: "NSE_FNO",
  productType: "INTRADAY",
  orderType: "MARKET",
  validity: "DAY",
  securityId: "12345",
  quantity: 15,
  price: 0,                         // MARKET order
  afterMarket: false,
  boLegName: "NA",                  // not a bracket order
  disclosedQuantity: 0,
  correlationId: "strategy-entry-001",
});
```

### Correlation ID (Required)

Every trading order should include a `correlationId` for:
- **Idempotency** — prevents duplicate submissions
- **Recovery** — look up via `/orders/external/{id}`
- **Traceability** — correlates order placement with WebSocket execution updates

```ts
const order = await client.orders.place({
  // ...other params
  correlationId: `strat-${Date.now()}`,
});

// Track via WebSocket
client.ws.orders.on("order", (update) => {
  if (update.CorrelationId === correlationId) {
    console.log("Fill update:", update);
  }
});
```

### Order Types

| OrderType | Description |
|-----------|-------------|
| `MARKET` | Executes at current market price |
| `LIMIT` | Executes at specified `price` or better |
| `STOP_LOSS` | Stop-loss (trigger) order |
| `STOP_LOSS_MARKET` | Stop-loss that converts to market |

### Product Types

| ProductType | Description |
|-------------|-------------|
| `INTRADAY` | Intraday (MIS) — squared off by EOD |
| `DELIVERY` | Delivery (CNC) — held overnight |
| `CARRY_FORWARD` | NRML — F&O, currency, commodity |

## Modify Order

```ts
await client.orders.modify({
  orderId: "12345",
  orderType: "LIMIT",
  price: 150.50,
  quantity: 20,
  validity: "DAY",
});
```

## Cancel Order

```ts
await client.orders.cancel({ orderId: "12345" });
```

## Get Order by ID

```ts
const order = await client.orders.getById({ orderId: "12345" });
```

## Get Order by External ID

```ts
const order = await client.orders.getByExternalId({
  externalId: "strategy-entry-001",
});
```

## Get All Orders

```ts
const orders = await client.orders.getAll();
```

## Order History

```ts
const history = await client.orders.getHistory({ orderId: "12345" });
```

## Slice Order

Split a large order into smaller slices:

```ts
await client.orders.slice({
  dhanClientId: process.env.DHAN_CLIENT_ID!,
  exchangeSegment: "NSE_EQ",
  transactionType: "BUY",
  productType: "INTRADAY",
  orderType: "MARKET",
  securityId: "1333",
  quantity: 500,
  sliceQuantity: 100,
  validity: "DAY",
  correlationId: "slice-001",
});
```

## Super Orders

Multi-leg order structures:

```ts
// Bracket Order
await client.superOrders.placeBracket({
  // entry + stop loss + target legs
});

// Cover Order
await client.superOrders.placeCover({
  // entry + stop loss legs
});
```

## Order Slice

Split a large order into smaller slices:

```ts
await client.orders.slice({
  dhanClientId: process.env.DHAN_CLIENT_ID!,
  exchangeSegment: "NSE_EQ",
  transactionType: "BUY",
  productType: "INTRADAY",
  orderType: "MARKET",
  securityId: "1333",
  quantity: 500,
  sliceQuantity: 100,
  validity: "DAY",
  correlationId: "slice-001",
});
```
