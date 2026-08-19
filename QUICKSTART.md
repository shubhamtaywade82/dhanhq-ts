# Quickstart

The five things you'll do first. Full detail: [README](README.md),
[docs/](docs/), or the [generated reference](https://shubhamtaywade82.github.io/dhanhq-ts/reference/).

```bash
npm install @nemesis-oss/dhanhq-sdk
```

## 1. Connect

```ts
import { DhanClient } from "@nemesis-oss/dhanhq-sdk";

const client = new DhanClient({
  clientId: process.env.DHAN_CLIENT_ID!,
  token: process.env.DHAN_ACCESS_TOKEN!,
});
```

Four other ways to supply a token — provider callback, auto-renewal via
PIN+TOTP, `.fromEnv()`, `.fromTokenEndpoint()` — in
[`docs/AUTHENTICATION.md`](docs/AUTHENTICATION.md).

## 2. Place an order

```ts
const order = await client.orders.place({
  dhanClientId: process.env.DHAN_CLIENT_ID!,
  transactionType: "BUY",
  exchangeSegment: "NSE_EQ",
  productType: "CNC",
  orderType: "MARKET",
  validity: "DAY",
  securityId: "1333", // HDFC Bank
  quantity: 1,
  correlationId: "my-strategy-1",
});
console.log(order.data.orderId);
```

## 3. Check positions and funds

```ts
const positions = await client.positions.list();
const funds = await client.funds.getLimit();
```

## 4. Stream live prices

```ts
client.ws.market.subscribe([{ securityId: "1333", exchangeSegment: "NSE_EQ" }]);
client.ws.market.on("tick", (tick) => {
  if ("ltp" in tick) console.log(tick.ltp);
});
await client.ws.connect();
```

## 5. Option chain and Greeks

```ts
import { greeks, yearsToExpiry } from "@nemesis-oss/dhanhq-sdk";

const nifty = await client.instruments.find("IDX_I", "NIFTY", { exactMatch: true });
const expiries = await client.optionChain.expiryList({
  underlyingScrip: Number(nifty!.securityId),
  underlyingSeg: "IDX_I",
});
const chain = await client.optionChain.fetchNormalized({
  underlyingScrip: Number(nifty!.securityId),
  underlyingSeg: "IDX_I",
  expiry: expiries.data![0],
});

const atm = chain.strikes[0];
const delta = greeks({
  spot: chain.lastPrice ?? 0,
  strike: atm.strike,
  timeToExpiry: yearsToExpiry(expiries.data![0]),
  riskFreeRate: 0.065,
  volatility: 0.15, // from your own IV estimate or a vol surface
  optionType: "call",
}).delta;
```

## Next

- [`/examples`](examples) — runnable end-to-end scripts (order placement,
  WS execution, risk controls, a full bot skeleton)
- [`docs/BROWSER.md`](docs/BROWSER.md) — the read-only-dashboard pattern,
  via `@nemesis-oss/dhanhq-sdk/browser`
- [README § Less Common Features](README.md#less-common-features) — Forever
  Orders, Conditional Triggers, eDIS, IP whitelisting
