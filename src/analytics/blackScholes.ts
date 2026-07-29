/**
 * Black-Scholes pricing, Greeks and implied volatility.
 *
 * Time to expiry is in years and rates/volatilities are annualized decimals
 * (`0.065` for 6.5%), matching the convention in the Ruby gem.
 */

export type OptionKind = "call" | "put";

export interface BlackScholesInput {
  spot: number;
  strike: number;
  timeToExpiry: number;
  riskFreeRate: number;
  volatility: number;
  optionType: OptionKind;
}

export interface Greeks {
  delta: number;
  gamma: number;
  /** Per-day theta, i.e. the annual figure divided by 365. */
  theta: number;
  /** Per 1% change in volatility. */
  vega: number;
  /** Per 1% change in the risk-free rate. */
  rho: number;
}

/** Theoretical option price. Returns 0 at or past expiry. */
export function price(input: BlackScholesInput): number {
  const { spot, strike, timeToExpiry, riskFreeRate, volatility, optionType } =
    input;

  if (timeToExpiry <= 0 || volatility <= 0) {
    return 0;
  }

  const d1Value = d1(spot, strike, timeToExpiry, riskFreeRate, volatility);
  const d2Value = d1Value - volatility * Math.sqrt(timeToExpiry);
  const discount = Math.exp(-riskFreeRate * timeToExpiry);

  if (optionType === "call") {
    return spot * normalCdf(d1Value) - strike * discount * normalCdf(d2Value);
  }

  return strike * discount * normalCdf(-d2Value) - spot * normalCdf(-d1Value);
}

/** Delta, gamma, theta, vega and rho. All zero at or past expiry. */
export function greeks(input: BlackScholesInput): Greeks {
  const { spot, strike, timeToExpiry, riskFreeRate, volatility, optionType } =
    input;

  if (timeToExpiry <= 0 || volatility <= 0) {
    return { delta: 0, gamma: 0, theta: 0, vega: 0, rho: 0 };
  }

  const sqrtTime = Math.sqrt(timeToExpiry);
  const d1Value = d1(spot, strike, timeToExpiry, riskFreeRate, volatility);
  const d2Value = d1Value - volatility * sqrtTime;
  const discount = Math.exp(-riskFreeRate * timeToExpiry);
  const pdf = normalPdf(d1Value);

  const delta =
    optionType === "call" ? normalCdf(d1Value) : normalCdf(d1Value) - 1;
  const gamma = pdf / (spot * volatility * sqrtTime);
  const vega = (spot * pdf * sqrtTime) / 100;

  const decay = -(spot * pdf * volatility) / (2 * sqrtTime);
  const theta =
    optionType === "call"
      ? decay - riskFreeRate * strike * discount * normalCdf(d2Value)
      : decay + riskFreeRate * strike * discount * normalCdf(-d2Value);

  const rho =
    optionType === "call"
      ? strike * timeToExpiry * discount * normalCdf(d2Value)
      : -strike * timeToExpiry * discount * normalCdf(-d2Value);

  return {
    delta,
    gamma,
    theta: theta / 365,
    vega,
    rho: rho / 100,
  };
}

export interface ImpliedVolatilityInput {
  marketPrice: number;
  spot: number;
  strike: number;
  timeToExpiry: number;
  riskFreeRate: number;
  optionType: OptionKind;
  tolerance?: number;
  maxIterations?: number;
}

/**
 * Implied volatility by Newton-Raphson from a 20% seed.
 *
 * Returns the best estimate reached within `maxIterations`; deep in- or
 * out-of-the-money options where vega collapses may not converge, in which
 * case the last iterate is returned rather than throwing.
 */
export function impliedVolatility(input: ImpliedVolatilityInput): number {
  const {
    marketPrice,
    spot,
    strike,
    timeToExpiry,
    riskFreeRate,
    optionType,
    tolerance = 0.0001,
    maxIterations = 100,
  } = input;

  if (timeToExpiry <= 0 || marketPrice <= 0) {
    return 0;
  }

  let iv = 0.2;

  for (let iteration = 0; iteration < maxIterations; iteration += 1) {
    const theoretical = price({
      spot,
      strike,
      timeToExpiry,
      riskFreeRate,
      volatility: iv,
      optionType,
    });

    const difference = theoretical - marketPrice;
    if (Math.abs(difference) < tolerance) {
      return iv;
    }

    const vega =
      spot *
      normalPdf(d1(spot, strike, timeToExpiry, riskFreeRate, iv)) *
      Math.sqrt(timeToExpiry);

    // Vega near zero makes the Newton step explode; stop and return what we have.
    if (vega < 1e-10) {
      return iv;
    }

    iv = Math.max(iv - difference / vega, 0.001);
  }

  return iv;
}

function d1(
  spot: number,
  strike: number,
  timeToExpiry: number,
  riskFreeRate: number,
  volatility: number,
): number {
  return (
    (Math.log(spot / strike) +
      (riskFreeRate + volatility ** 2 / 2) * timeToExpiry) /
    (volatility * Math.sqrt(timeToExpiry))
  );
}

/** Standard normal CDF. */
export function normalCdf(x: number): number {
  return 0.5 * (1 + erf(x / Math.SQRT2));
}

/** Standard normal PDF. */
export function normalPdf(x: number): number {
  return Math.exp(-0.5 * x ** 2) / Math.sqrt(2 * Math.PI);
}

/** Abramowitz & Stegun 7.1.26 error function approximation. */
export function erf(value: number): number {
  const sign = value < 0 ? -1 : 1;
  const x = Math.abs(value);

  const t = 1 / (1 + 0.3275911 * x);
  const y =
    1 -
    ((((1.061405429 * t - 1.453152027) * t + 1.421413741) * t - 0.284496736) *
      t +
      0.254829592) *
      t *
      Math.exp(-x * x);

  return sign * y;
}

/** Years between now and an expiry date, floored at zero. */
export function yearsToExpiry(
  expiry: Date | string,
  now: Date = new Date(),
): number {
  const expiryDate = expiry instanceof Date ? expiry : new Date(expiry);
  const millis = expiryDate.getTime() - now.getTime();
  return Math.max(millis / (365 * 24 * 60 * 60 * 1000), 0);
}
