import type { Candle } from "../ta/candles";

/**
 * For each bar in `primary`, the index into `higherTf` of the highest bar
 * that had fully *closed* by the time that primary bar closed — or `-1`
 * before any higher-timeframe bar has closed yet.
 *
 * A single forward-advancing pointer suffices because both series are sorted
 * ascending by timestamp and `higherTf` never has more bars than `primary`
 * over the same span — this is O(primary.length + higherTf.length), not
 * O(primary.length × higherTf.length).
 */
export function buildCursor(
  primary: Candle[],
  higherTf: Candle[],
  higherTfDurationSeconds: number,
): number[] {
  const cursor = new Array<number>(primary.length);
  let htfIndex = 0;

  for (let i = 0; i < primary.length; i += 1) {
    const asOf = primary[i].timestamp;

    while (
      htfIndex < higherTf.length &&
      higherTf[htfIndex].timestamp + higherTfDurationSeconds <= asOf
    ) {
      htfIndex += 1;
    }

    cursor[i] = htfIndex - 1;
  }

  return cursor;
}
