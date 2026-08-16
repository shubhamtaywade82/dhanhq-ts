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

`maxPain()` returns just the strike; `detailedMaxPain()` also returns the
full pain curve, for plotting:

```ts
import { detailedMaxPain, maxPain, openInterestFromChain } from "@shubhamtaywade82/dhanhq-ts";

const chain = await client.optionChain.fetchNormalized({
  underlyingScrip: 13,
  underlyingSeg: "IDX_I",
  expiry: "2026-08-04",
});

const oi = openInterestFromChain(chain);
console.log("Max pain strike:", maxPain(oi));

const detail = detailedMaxPain(oi);
console.log("Total pain at max pain:", detail?.totalPain);
```

## Put-Call Ratio

By open interest, and separately by traded volume:

```ts
import { openInterestFromChain, putCallRatio, volumePutCallRatio } from "@shubhamtaywade82/dhanhq-ts";

console.log("PCR (OI):", putCallRatio(openInterestFromChain(chain)));
console.log("PCR (Volume):", volumePutCallRatio(chain));
```

## Open Interest Concentration

The strikes carrying the most OI on each side — support (put OI) and
resistance (call OI):

```ts
import { highestCallOi, highestPutOi } from "@shubhamtaywade82/dhanhq-ts";

console.log("Resistance (highest call OI):", highestCallOi(chain, 3));
console.log("Support (highest put OI):", highestPutOi(chain, 3));
```
