---
title: DhanHQ Option Chain API — TypeScript & Node.js
description: Fetch option chains, expiry lists, compute Greeks (delta, gamma, theta, vega), implied volatility, max pain, and PCR using the DhanHQ TypeScript SDK.
---

# Option Chain

Fetch option chains, expiry lists, and compute options analytics including Greeks, implied volatility, max pain, and put-call ratio.

## Option Chain

### Expiry List

```ts
const expiries = await client.optionChain.expiryList({
  underlyingScrip: 13,
  underlyingSeg: "IDX_I",
});
```

### Raw Option Chain

```ts
const chain = await client.optionChain.fetch({
  underlyingScrip: 13,
  underlyingSeg: "IDX_I",
  expiry: "2026-08-04",
});
```

### Normalized Option Chain

Returns a flattened, sorted array of strikes with call/put legs:

```ts
const chain = await client.optionChain.fetchNormalized({
  underlyingScrip: 13,
  underlyingSeg: "IDX_I",
  expiry: "2026-08-04",
});

// Access individual strikes
chain.strikes.forEach((strike) => {
  console.log(strike.strike, strike.call?.last_price, strike.put?.last_price);
});

// Find ATM strike
const atm = chain.strikes.find(
  (s) => s.strike >= (chain.lastPrice ?? 0)
);
```

## Option Greeks

Compute Black-Scholes Greeks for any option:

```ts
import { greeks } from "@shubhamtaywade82/dhanhq-ts";

const result = greeks({
  spot: 24_000,
  strike: 24_200,
  timeToExpiry: 10 / 365,  // 10 days
  riskFreeRate: 0.065,     // 6.5%
  volatility: 0.15,        // 15% IV
  optionType: "call",      // "call" | "put"
});

console.log(result.delta);  // option delta
console.log(result.gamma);  // option gamma
console.log(result.theta);  // option theta (daily)
console.log(result.vega);   // option vega
```

## Implied Volatility

Back-solve volatility from market price:

```ts
import { impliedVolatility } from "@shubhamtaywade82/dhanhq-ts";

const iv = impliedVolatility({
  spot: 24_000,
  strike: 24_200,
  timeToExpiry: 10 / 365,
  riskFreeRate: 0.065,
  marketPrice: 150,
  optionType: "call",
});
```

## Max Pain

Compute the max pain strike from the option chain:

```ts
import { maxPain, openInterestFromChain } from "@shubhamtaywade82/dhanhq-ts";

const pain = maxPain(openInterestFromChain(chain));
console.log("Max pain strike:", pain.strike);
console.log("Max pain value:", pain.value);
```

## Put-Call Ratio

```ts
import { putCallRatio } from "@shubhamtaywade82/dhanhq-ts";

const pcr = putCallRatio(chain);
console.log("PCR (OI):", pcr.oi);
console.log("PCR (Volume):", pcr.volume);
```

## Open Interest Walls

```ts
import { oiWalls } from "@shubhamtaywade82/dhanhq-ts";

const walls = oiWalls(chain);
console.log("Support (PE OI wall):", walls.support);
console.log("Resistance (CE OI wall):", walls.resistance);
```
