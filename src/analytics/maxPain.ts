import type { NormalizedOptionChain } from "../resources/OptionChain";

/** Open interest at one strike, both sides. */
export interface StrikeOpenInterest {
  strike: number;
  callOi: number;
  putOi: number;
}

export interface MaxPainDetail {
  maxPainStrike: number;
  totalPain: number;
  painDistribution: Array<{ strike: number; pain: number }>;
}

/**
 * Max pain: the expiry price at which option writers lose the least, i.e.
 * the strike where the most contracts expire worthless.
 */
export function maxPain(data: StrikeOpenInterest[]): number | undefined {
  return detailedMaxPain(data)?.maxPainStrike;
}

/** Max pain plus the full pain curve, for plotting or inspection. */
export function detailedMaxPain(
  data: StrikeOpenInterest[],
): MaxPainDetail | undefined {
  if (data.length === 0) {
    return undefined;
  }

  const painDistribution = data.map((entry) => ({
    strike: entry.strike,
    pain: data.reduce(
      (total, row) => total + painAtStrike(row, entry.strike),
      0,
    ),
  }));

  const minimum = painDistribution.reduce((best, entry) =>
    entry.pain < best.pain ? entry : best,
  );

  return {
    maxPainStrike: minimum.strike,
    totalPain: minimum.pain,
    painDistribution,
  };
}

/**
 * Writer loss at `expiryStrike` for the open interest sitting on `row`.
 * Call writers lose above their strike, put writers below it.
 */
function painAtStrike(row: StrikeOpenInterest, expiryStrike: number): number {
  const callPain =
    expiryStrike > row.strike ? (expiryStrike - row.strike) * row.callOi : 0;
  const putPain =
    expiryStrike < row.strike ? (row.strike - expiryStrike) * row.putOi : 0;

  return callPain + putPain;
}

/** Put-call ratio by open interest. Returns 0 when there is no call OI. */
export function putCallRatio(data: StrikeOpenInterest[]): number {
  const totalCallOi = data.reduce((total, entry) => total + entry.callOi, 0);
  const totalPutOi = data.reduce((total, entry) => total + entry.putOi, 0);

  return totalCallOi === 0 ? 0 : totalPutOi / totalCallOi;
}

/** Put-call ratio by traded volume. */
export function volumePutCallRatio(chain: NormalizedOptionChain): number {
  const totals = chain.strikes.reduce(
    (accumulator, entry) => ({
      call: accumulator.call + (entry.call?.volume ?? 0),
      put: accumulator.put + (entry.put?.volume ?? 0),
    }),
    { call: 0, put: 0 },
  );

  return totals.call === 0 ? 0 : totals.put / totals.call;
}

/** Extracts the open-interest view a max-pain calculation needs from a chain. */
export function openInterestFromChain(
  chain: NormalizedOptionChain,
): StrikeOpenInterest[] {
  return chain.strikes.map((entry) => ({
    strike: entry.strike,
    callOi: entry.call?.oi ?? 0,
    putOi: entry.put?.oi ?? 0,
  }));
}

export interface OiConcentration {
  strike: number;
  oi: number;
}

/** The `count` strikes carrying the most call open interest — resistance. */
export function highestCallOi(
  chain: NormalizedOptionChain,
  count = 3,
): OiConcentration[] {
  return chain.strikes
    .map((entry) => ({ strike: entry.strike, oi: entry.call?.oi ?? 0 }))
    .sort((a, b) => b.oi - a.oi)
    .slice(0, count);
}

/** The `count` strikes carrying the most put open interest — support. */
export function highestPutOi(
  chain: NormalizedOptionChain,
  count = 3,
): OiConcentration[] {
  return chain.strikes
    .map((entry) => ({ strike: entry.strike, oi: entry.put?.oi ?? 0 }))
    .sort((a, b) => b.oi - a.oi)
    .slice(0, count);
}
