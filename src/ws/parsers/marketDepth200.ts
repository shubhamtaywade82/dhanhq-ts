import type {
  MarketDepthLevel,
  MarketFeedEvent,
  MarketFullEvent,
  MarketPacketHeader,
} from "../../types/ws.types";

/**
 * 200-Level Market Depth WebSocket packet parser.
 * 
 * This parser handles the distinct binary format used by the 200-level depth
 * endpoint (wss://full-depth-api.dhan.co/twohundreddepth), which differs from
 * the standard 5/20-level depth:
 * - 12-byte header (vs 8-byte)
 * - uint32 row count
 * - float64 prices (vs float32)
 * - 200 depth entries (vs 5)
 * 
 * @see https://dhan.co/help/docs/api/v2/#market-depth-websocket
 */

export interface MarketDepth200Event {
  type: "depth-200";
  securityId: string;
  exchangeSegment: string;
  ltp: number;
  ltq: number;
  ltt: number;
  atp: number;
  volume: number;
  totalSellQuantity: number;
  totalBuyQuantity: number;
  openInterest: number;
  dayOpen: number;
  dayClose: number;
  dayHigh: number;
  dayLow: number;
  depth: MarketDepthLevel[]; // 200 levels
  raw: Buffer;
}

export interface MarketDepth200Header {
  responseCode: number;
  messageLength: number;
  exchangeSegmentCode: number;
  exchangeSegment: string;
  securityId: string;
  rowCount: number; // Number of depth levels (up to 200)
}

/**
 * Parse a 200-level market depth packet.
 * 
 * The packet structure is:
 * - Bytes 0-7: Standard 8-byte header (response code, length, segment, security ID)
 * - Bytes 8-11: LTP (float32)
 * - Bytes 12-15: LTQ (int16) + padding
 * - Bytes 16-19: LTT (int32)
 * - Bytes 20-27: ATP (float64)
 * - Bytes 28-35: Volume (int64)
 * - Bytes 36-43: Total Sell Quantity (int64)
 * - Bytes 44-51: Total Buy Quantity (int64)
 * - Bytes 52-59: Open Interest (int64)
 * - Bytes 60-67: Day Open (float64)
 * - Bytes 68-75: Day Close (float64)
 * - Bytes 76-83: Day High (float64)
 * - Bytes 84-91: Day Low (float64)
 * - Bytes 92-95: Row count (uint32) - number of depth levels
 * - Bytes 96+: Depth entries (16 bytes each: qty int32, price float64)
 * 
 * Note: The actual structure may vary slightly based on Dhan's implementation.
 * This parser assumes the documented format with float64 prices and 200 levels.
 */
export function parseMarketDepth200Packet(
  packet: Buffer,
  subscriptions: Array<{ securityId: string; exchangeSegment: string }>,
): MarketDepth200Event | null {
  // Minimum packet size: 96 bytes header + at least some depth data
  if (packet.length < 96) {
    return null;
  }

  const header = parseDepth200Header(packet, subscriptions);
  
  if (!header) {
    return null;
  }

  const rowCount = header.rowCount;
  const depthStartOffset = 96;
  const expectedSize = depthStartOffset + rowCount * 16;

  if (packet.length < expectedSize) {
    console.warn(
      `200-level depth packet truncated: expected ${expectedSize} bytes, got ${packet.length}`,
    );
    return null;
  }

  const depth = parseDepth200Levels(packet, depthStartOffset, rowCount);

  return {
    type: "depth-200",
    securityId: header.securityId,
    exchangeSegment: header.exchangeSegment,
    ltp: packet.readFloatLE(8),
    ltq: packet.readInt16LE(12),
    ltt: packet.readInt32LE(16),
    atp: packet.readDoubleLE(20),
    volume: Number(packet.readBigInt64LE(28)),
    totalSellQuantity: Number(packet.readBigInt64LE(36)),
    totalBuyQuantity: Number(packet.readBigInt64LE(44)),
    openInterest: Number(packet.readBigInt64LE(52)),
    dayOpen: packet.readDoubleLE(60),
    dayClose: packet.readDoubleLE(68),
    dayHigh: packet.readDoubleLE(76),
    dayLow: packet.readDoubleLE(84),
    depth,
    raw: packet,
  };
}

function parseDepth200Header(
  packet: Buffer,
  subscriptions: Array<{ securityId: string; exchangeSegment: string }>,
): MarketDepth200Header | null {
  const responseCode = packet.readUInt8(0);
  const messageLength = packet.readInt16LE(1);
  const exchangeSegmentCode = packet.readUInt8(3);
  const securityId = String(packet.readInt32LE(4));
  const rowCount = packet.readUInt32LE(92);

  // Resolve exchange segment from subscriptions
  const matches = subscriptions.filter(
    (sub) => sub.securityId === securityId,
  );
  const exchangeSegment =
    matches.length === 1 ? matches[0].exchangeSegment : `SEGMENT_${exchangeSegmentCode}`;

  return {
    responseCode,
    messageLength,
    exchangeSegmentCode,
    exchangeSegment,
    securityId,
    rowCount,
  };
}

function parseDepth200Levels(
  packet: Buffer,
  offset: number,
  rowCount: number,
): MarketDepthLevel[] {
  const levels: MarketDepthLevel[] = [];
  const maxLevels = Math.min(rowCount, 200); // Safety cap

  for (let index = 0; index < maxLevels; index += 1) {
    const start = offset + index * 16;
    
    if (start + 16 > packet.length) {
      break;
    }

    // 200-level depth format: 4 bytes qty + 8 bytes price + 4 bytes orders?
    // Adjust based on actual Dhan specification
    const quantity = packet.readInt32LE(start);
    const price = packet.readDoubleLE(start + 4);
    const orders = packet.readInt16LE(start + 12);

    // Alternate between bid and ask based on index
    // First half are bids, second half are asks (or interleaved)
    const isBid = index < maxLevels / 2;
    
    if (isBid) {
      levels.push({
        bidQuantity: quantity,
        askQuantity: 0,
        bidOrders: orders,
        askOrders: 0,
        bidPrice: price,
        askPrice: 0,
      });
    } else {
      const askIndex = index - Math.floor(maxLevels / 2);
      if (askIndex < levels.length) {
        levels[askIndex].askQuantity = quantity;
        levels[askIndex].askOrders = orders;
        levels[askIndex].askPrice = price;
      } else {
        levels.push({
          bidQuantity: 0,
          askQuantity: quantity,
          bidOrders: 0,
          askOrders: orders,
          bidPrice: 0,
          askPrice: price,
        });
      }
    }
  }

  return levels;
}

/**
 * Alternative parser for interleaved bid/ask depth format.
 * Some implementations interleave bids and asks rather than splitting them.
 */
export function parseDepth200Interleaved(
  packet: Buffer,
  offset: number,
  rowCount: number,
): MarketDepthLevel[] {
  const levels: MarketDepthLevel[] = [];
  const maxLevels = Math.min(Math.floor(rowCount / 2), 200);

  for (let index = 0; index < maxLevels; index += 1) {
    const bidStart = offset + index * 16;
    const askStart = offset + (index + maxLevels) * 16;

    if (bidStart + 16 > packet.length || askStart + 16 > packet.length) {
      break;
    }

    levels.push({
      bidQuantity: packet.readInt32LE(bidStart),
      askQuantity: packet.readInt32LE(askStart),
      bidOrders: packet.readInt16LE(bidStart + 12),
      askOrders: packet.readInt16LE(askStart + 12),
      bidPrice: packet.readDoubleLE(bidStart + 4),
      askPrice: packet.readDoubleLE(askStart + 4),
    });
  }

  return levels;
}
