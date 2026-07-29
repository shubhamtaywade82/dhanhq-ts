import type {
  MarketDepth20Event,
  MarketDepth20Level,
  MarketDepth200Event,
  MarketDepthEvent,
} from "../../types/ws.types";

const SEGMENT_CODE_MAP: Record<number, string> = {
  1: "NSE_EQ",
  2: "NSE_FNO",
  3: "BSE_EQ",
  4: "BSE_FNO",
  5: "MCX_COMM",
  6: "NSE_CURRENCY",
  7: "IDX_I",
};

/**
 * Parses a 20-level market depth packet stream from `wss://depth-api-feed.dhan.co/twentydepth`.
 *
 * Packet format:
 * - 12-byte header:
 *   - [0-1]: int16 LE messageLength
 *   - [2]: uint8 responseCode (41 = Bid, 51 = Ask)
 *   - [3]: uint8 exchangeSegmentCode
 *   - [4-7]: int32 LE securityId
 *   - [8-11]: uint32 LE sequence number
 * - Payload: up to 20 levels × 16 bytes:
 *   - [+0-7]: float64 LE price
 *   - [+8-11]: uint32 LE quantity
 *   - [+12-15]: uint32 LE order count
 */
export function parseMarketDepth20Packet(
  buf: Buffer,
  subscriptions?: Array<{ securityId: string; exchangeSegment: string }>,
): MarketDepth20Event[] {
  const results: MarketDepth20Event[] = [];
  let offset = 0;

  while (offset + 12 <= buf.length) {
    const msgLen = buf.readInt16LE(offset);
    const responseCode = buf.readUInt8(offset + 2);
    const segCode = buf.readUInt8(offset + 3);
    const secId = String(buf.readInt32LE(offset + 4));

    if (msgLen < 12 || offset + msgLen > buf.length) {
      break;
    }

    if (responseCode !== 41 && responseCode !== 51) {
      offset += Math.max(msgLen, 1);
      continue;
    }

    const isAsk = responseCode === 51;
    const levels: MarketDepth20Level[] = [];
    const numLevels = Math.min(20, Math.floor((msgLen - 12) / 16));

    for (let index = 0; index < numLevels; index += 1) {
      const base = offset + 12 + index * 16;
      if (base + 16 > buf.length) {
        break;
      }

      const price = buf.readDoubleLE(base);
      const qty = buf.readUInt32LE(base + 8);
      const orders = buf.readUInt32LE(base + 12);

      if (price > 0 && price < 1_000_000) {
        levels.push({
          price: Math.round(price * 100) / 100,
          qty,
          orders,
        });
      }
    }

    const subMatch = subscriptions?.find((s) => s.securityId === secId);
    const exchangeSegment =
      subMatch?.exchangeSegment ??
      SEGMENT_CODE_MAP[segCode] ??
      `SEGMENT_${segCode}`;

    const packetSlice = buf.subarray(offset, offset + msgLen);

    results.push({
      type: isAsk ? "depth-20-ask" : "depth-20-bid",
      securityId: secId,
      exchangeSegment,
      levels,
      raw: packetSlice,
    });

    offset += msgLen;
  }

  return results;
}

/**
 * Parses a 200-level market depth packet stream from `wss://full-depth-api.dhan.co/twohundreddepth`.
 *
 * Packet format:
 * - 12-byte header:
 *   - [0-1]: int16 LE messageLength
 *   - [2]: uint8 responseCode (41 = Bid, 51 = Ask)
 *   - [3]: uint8 exchangeSegmentCode
 *   - [4-7]: int32 LE securityId
 *   - [8-11]: uint32 LE row count (number of levels up to 200)
 * - Payload: row count × 16 bytes:
 *   - [+0-7]: float64 LE price
 *   - [+8-11]: uint32 LE quantity
 *   - [+12-15]: uint32 LE order count
 */
export function parseMarketDepth200Packet(
  buf: Buffer,
  subscriptions?: Array<{ securityId: string; exchangeSegment: string }>,
): MarketDepth200Event[] {
  const results: MarketDepth200Event[] = [];
  let offset = 0;

  while (offset + 12 <= buf.length) {
    const msgLen = buf.readInt16LE(offset);
    const responseCode = buf.readUInt8(offset + 2);
    const segCode = buf.readUInt8(offset + 3);
    const secId = String(buf.readInt32LE(offset + 4));
    const numRows = buf.readUInt32LE(offset + 8);

    if (msgLen < 12 || offset + msgLen > buf.length) {
      break;
    }

    if (responseCode !== 41 && responseCode !== 51) {
      offset += Math.max(msgLen, 1);
      continue;
    }

    const isAsk = responseCode === 51;
    const maxLevels = Math.min(numRows, 200, Math.floor((msgLen - 12) / 16));
    const levels: MarketDepth20Level[] = [];

    for (let index = 0; index < maxLevels; index += 1) {
      const base = offset + 12 + index * 16;
      if (base + 16 > buf.length) {
        break;
      }

      const price = buf.readDoubleLE(base);
      const qty = buf.readUInt32LE(base + 8);
      const orders = buf.readUInt32LE(base + 12);

      if (price > 0 && price < 1_000_000) {
        levels.push({
          price: Math.round(price * 100) / 100,
          qty,
          orders,
        });
      }
    }

    const subMatch = subscriptions?.find((s) => s.securityId === secId);
    const exchangeSegment =
      subMatch?.exchangeSegment ??
      SEGMENT_CODE_MAP[segCode] ??
      `SEGMENT_${segCode}`;

    const packetSlice = buf.subarray(offset, offset + msgLen);

    results.push({
      type: isAsk ? "depth-200-ask" : "depth-200-bid",
      securityId: secId,
      exchangeSegment,
      numRows,
      levels,
      raw: packetSlice,
    });

    offset += msgLen;
  }

  return results;
}

/**
 * Dispatcher to parse market depth packets for either 20-level or 200-level streams.
 */
export function parseMarketDepthPacket(
  buf: Buffer,
  mode: "twenty" | "twohundred",
  subscriptions?: Array<{ securityId: string; exchangeSegment: string }>,
): MarketDepthEvent[] {
  if (mode === "twenty") {
    return parseMarketDepth20Packet(buf, subscriptions);
  }
  return parseMarketDepth200Packet(buf, subscriptions);
}
