---
title: DhanHQ Option Greeks & Implied Volatility — TypeScript & Node.js
description: Compute Black-Scholes Greeks, implied volatility, max pain, and put-call ratio using the DhanHQ TypeScript SDK for options trading analytics.
---

# Option Greeks & Implied Volatility

Quantitative options analytics for Indian markets including Black-Scholes pricing, Greeks, implied volatility, max pain, and put-call ratio.

## Greeks

```ts
import { greeks } from "@shubhamtaywade82/dhanhq-ts";

const result = greeks({
  spot: 24_000,
  strike: 24_200,
  timeToExpiry: 10 / 365,
  riskFreeRate: 0.065,
  volatility: 0.15,
  optionType: "call",
});

console.log("Delta:", result.delta);
console.log("Gamma:", result.gamma);
console.log("Theta:", result.theta);
console.log("Vega:", result.vega);
```

## Implied Volatility

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

```ts
import { maxPain, openInterestFromChain } from "@shubhamtaywade82/dhanhq-ts";

const chain = await client.optionChain.fetchNormalized({
  underlyingScrip: 13,
  underlyingSeg: "IDX_I",
  expiry: "2026-08-04",
});

const pain = maxPain(openInterestFromChain(chain));
```

## Put-Call Ratio

```ts
import { putCallRatio } from "@shubhamtaywade82/dhanhq-ts";

const pcr = putCallRatio(chain);
console.log("PCR by OI:", pcr.oi);
console.log("PCR by Volume:", pcr.volume);
```

## Open Interest Walls

```ts
import { oiWalls, nearestStrike, findStrike } from "@shubhamtaywade82/dhanhq-ts";

const walls = oiWalls(chain);
console.log("Support (max PE OI):", walls.support);
console.log("Resistance (max CE OI):", walls.resistance);
```
