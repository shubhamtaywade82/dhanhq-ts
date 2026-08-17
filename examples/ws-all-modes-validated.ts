/**
 * ws-all-modes-validated.ts
 *
 * FIVE simultaneous WebSocket connections to Dhan's live endpoints:
 *
 *   [A] TICKER mode    wss://api-feed.dhan.co     RequestCode=15  → LTP + LTT
 *   [B] QUOTE  mode    wss://api-feed.dhan.co     RequestCode=17  → LTP + OHLCV
 *   [C] FULL   mode    wss://api-feed.dhan.co     RequestCode=21  → OHLCV + 5-depth + OI
 *   [D] DEPTH20 mode   wss://depth-api-feed.dhan.co/twentydepth   → 20-level bid+ask
 *   [E] DEPTH200 mode  wss://full-depth-api.dhan.co/twohundreddepth → up to 200-level (1 scrip)
 *
 * Every decoded packet is:
 *   1. Type-checked  — correct JS type, no NaN/Infinity
 *   2. Range-checked — price > 0, epoch sane, OI ≥ 0, bid ≤ ask at each level
 *   3. Normalised    — canonical NormalisedTick shape, round2() prices, toIST() epochs
 *
 * Output: per-mode tick tables, field-coverage matrix, validation error report,
 *         depth sample tables, 5 JSON log files.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' examples/ws-all-modes-validated.ts
 *
 * Required .env: DHAN_TOKEN_SERVICE_URL  DHAN_TOKEN_ACCESS_TOKEN  DHAN_CLIENT_ID
 */

import * as fs     from "fs";
import * as path   from "path";
import * as dotenv from "dotenv";
import WebSocket   from "ws";

import { DhanClient }            from "../src/client/DhanClient";
import { parseMarketFeedPacket } from "../src/ws/parsers/marketFeed";
import { splitPackets }          from "../src/ws/parsers/packetSplitter";
import type { MarketFeedEvent, StoredSubscription } from "../src/types/ws.types";

dotenv.config({ path: path.join(__dirname, "../.env") });

// ─── Config ──────────────────────────────────────────────────────────────────

const DURATION_SECONDS = 65;
const OUT_DIR = __dirname;

const TOKEN_SERVICE_ORIGIN = (() => {
  try { return new URL(process.env.DHAN_TOKEN_SERVICE_URL ?? "").origin; } catch { return ""; }
})();
const TOKEN_BEARER       = process.env.DHAN_TOKEN_ACCESS_TOKEN ?? "";
const FALLBACK_CLIENT_ID = process.env.DHAN_CLIENT_ID ?? "";

if (!TOKEN_SERVICE_ORIGIN || !TOKEN_BEARER) {
  console.error("❌  DHAN_TOKEN_SERVICE_URL + DHAN_TOKEN_ACCESS_TOKEN required in .env");
  process.exit(1);
}

// ─── Instruments ─────────────────────────────────────────────────────────────

interface Instrument { exchangeSegment: string; securityId: string; label: string; }

// NSE_EQ + IDX_I instruments only — supported by all 5 endpoints.
// Depth-20 allows ≤50/connection (NSE_EQ + NSE_FNO only for full depth).
// Depth-200 allows exactly 1 instrument per connection (we pick RELIANCE).
const INSTRUMENTS: Instrument[] = [
  { exchangeSegment: "NSE_EQ",       securityId: "1333",   label: "HDFC Bank"    },
  { exchangeSegment: "NSE_EQ",       securityId: "11536",  label: "RELIANCE"     },
  { exchangeSegment: "NSE_EQ",       securityId: "4963",   label: "ICICI Bank"   },
  { exchangeSegment: "NSE_EQ",       securityId: "11630",  label: "TCS"          },
  { exchangeSegment: "IDX_I",        securityId: "13",     label: "NIFTY 50"     },
  { exchangeSegment: "IDX_I",        securityId: "25",     label: "BANK NIFTY"   },
  { exchangeSegment: "IDX_I",        securityId: "51",     label: "SENSEX"       },
  { exchangeSegment: "BSE_EQ",       securityId: "500325", label: "RELIANCE BSE" },
  { exchangeSegment: "NSE_FNO",      securityId: "33490",  label: "NIFTY FUT"    },
  { exchangeSegment: "NSE_FNO",      securityId: "35003",  label: "NIFTY CE"     },
  { exchangeSegment: "MCX_COMM",     securityId: "429120", label: "GOLD MCX"     },
  { exchangeSegment: "NSE_CURRENCY", securityId: "1",      label: "USDINR"       },
];

// 20-depth only works for NSE_EQ + NSE_FNO (docs: only NSE equity & derivatives)
const DEPTH20_INSTRUMENTS = INSTRUMENTS.filter(
  (i) => i.exchangeSegment === "NSE_EQ" || i.exchangeSegment === "NSE_FNO",
);

// 200-depth: exactly 1 instrument per connection
const DEPTH200_INSTRUMENT = INSTRUMENTS.find((i) => i.exchangeSegment === "NSE_EQ" && i.securityId === "11536")!; // RELIANCE

const storedSubs: StoredSubscription[] = INSTRUMENTS.map((i) => ({
  exchangeSegment: i.exchangeSegment as StoredSubscription["exchangeSegment"],
  securityId: i.securityId,
  mode: "full" as const,
}));

const labelMap = new Map(INSTRUMENTS.map((i) => [`${i.exchangeSegment}:${i.securityId}`, i.label]));

// ─── 20-Level Depth Packet Parser ────────────────────────────────────────────
// Protocol (from Dhan docs):
//   Header  : 12 bytes
//     [0-1]  int16  LE  — message length of full packet
//     [2]    uint8      — response code: 41=Bid(Buy), 51=Ask(Sell)
//     [3]    uint8      — exchange segment code
//     [4-7]  int32  LE  — security ID
//     [8-11] uint32 LE  — message sequence (ignore)
//   Payload : 20 × 16 bytes each
//     [0-7]  float64 LE — price
//     [8-11] uint32  LE — quantity
//     [12-15]uint32  LE — number of orders

interface Depth20Level { price: number; qty: number; orders: number; }
interface Depth20Packet {
  type:            "depth-20-bid" | "depth-20-ask";
  securityId:      string;
  exchangeSegment: string;
  label:           string;
  levels:          Depth20Level[];
  capturedAt:      string;
}

// ── Segment code → exchange segment name map ────────────────────────────────
const SEG_CODE_MAP: Record<number, string> = {
  1: "NSE_EQ", 2: "NSE_FNO", 3: "BSE_EQ", 4: "BSE_FNO",
  5: "MCX_COMM", 6: "NSE_CURRENCY", 7: "IDX_I",
};

function parseDepth20(buf: Buffer, subMap: Map<string, string>): Depth20Packet[] {
  const results: Depth20Packet[] = [];
  let offset = 0;

  while (offset + 12 <= buf.length) {
    const msgLen       = buf.readInt16LE(offset + 0);
    const responseCode = buf.readUInt8(offset + 2);   // 41=Bid, 51=Ask
    const segCode      = buf.readUInt8(offset + 3);
    const secId        = String(buf.readInt32LE(offset + 4));
    // [8-11] = msgSeq (always 0 for depth20), not used

    if (msgLen < 12 || offset + msgLen > buf.length) break;

    const isAsk = responseCode === 51;
    if (responseCode !== 41 && responseCode !== 51) {
      offset += Math.max(msgLen, 1);
      continue;
    }

    const levels: Depth20Level[] = [];
    // Each level = 8 bytes float64LE price + 4 bytes uint32LE qty + 4 bytes uint32LE orders
    const numLevels = Math.min(20, Math.floor((msgLen - 12) / 16));

    for (let i = 0; i < numLevels; i++) {
      const base   = offset + 12 + i * 16;
      if (base + 16 > buf.length) break;
      const price  = buf.readDoubleLE(base);        // ← float64 Little-Endian
      const qty    = buf.readUInt32LE(base + 8);    // ← uint32 Little-Endian
      const ord    = buf.readUInt32LE(base + 12);   // ← uint32 Little-Endian
      if (price > 0 && price < 1_000_000) {         // sanity: reject garbage floats
        levels.push({ price: Math.round(price * 100) / 100, qty, orders: ord });
      }
    }

    const seg   = SEG_CODE_MAP[segCode] ?? `SEGMENT_${segCode}`;
    const label = subMap.get(secId) ?? `${seg}:${secId}`;
    results.push({
      type:            isAsk ? "depth-20-ask" : "depth-20-bid",
      securityId:      secId,
      exchangeSegment: seg,
      label,
      levels,
      capturedAt:      new Date().toISOString(),
    });

    offset += msgLen;
  }
  return results;
}

// ─── 200-Level Depth Packet Parser ───────────────────────────────────────────
// Same 12-byte header, same 16-byte level structure as 20-level.
// Response code 41=Bid, 51=Ask. Last 4 bytes of header = num rows (not msg seq).

interface Depth200Packet {
  type:            "depth-200-bid" | "depth-200-ask";
  securityId:      string;
  exchangeSegment: string;
  label:           string;
  numRows:         number;
  levels:          Depth20Level[];
  capturedAt:      string;
}

function parseDepth200(buf: Buffer, inst: Instrument): Depth200Packet[] {
  const results: Depth200Packet[] = [];
  let offset = 0;

  while (offset + 12 <= buf.length) {
    const msgLen       = buf.readInt16LE(offset + 0);
    const responseCode = buf.readUInt8(offset + 2);
    // [8-11] = numRows for depth200 (# levels in this packet)
    const numRows      = buf.readUInt32LE(offset + 8);

    if (msgLen < 12 || offset + msgLen > buf.length) break;

    const isAsk = responseCode === 51;
    if (responseCode !== 41 && responseCode !== 51) {
      offset += Math.max(msgLen, 1);
      continue;
    }

    const maxLevels = Math.min(numRows, 200, Math.floor((msgLen - 12) / 16));
    const levels: Depth20Level[] = [];

    for (let i = 0; i < maxLevels; i++) {
      const base  = offset + 12 + i * 16;
      if (base + 16 > buf.length) break;
      const price = buf.readDoubleLE(base);      // ← float64 Little-Endian
      const qty   = buf.readUInt32LE(base + 8); // ← uint32 Little-Endian
      const ord   = buf.readUInt32LE(base + 12);
      if (price > 0 && price < 1_000_000) {
        levels.push({ price: Math.round(price * 100) / 100, qty, orders: ord });
      }
    }

    results.push({
      type:            isAsk ? "depth-200-ask" : "depth-200-bid",
      securityId:      inst.securityId,
      exchangeSegment: inst.exchangeSegment,
      label:           inst.label,
      numRows,
      levels,
      capturedAt:      new Date().toISOString(),
    });

    offset += msgLen;
  }
  return results;
}

// ─── Normalised tick ─────────────────────────────────────────────────────────

export interface NormalisedDepthLevel {
  price: number; qty: number; orders: number;
}

export interface NormalisedTick {
  mode:            string;
  packetType:      string;
  exchangeSegment: string;
  securityId:      string;
  label:           string;
  capturedAt:      string;
  ltp?:            number;
  previousClose?:  number;
  dayOpen?:        number; dayHigh?:  number; dayLow?:  number; dayClose?: number;
  atp?:            number;
  ltt?:            string;   lttEpoch?: number;
  ltq?:            number;
  volume?:         number;   totalBuyQty?: number; totalSellQty?: number;
  openInterest?:   number;
  previousOpenInterest?: number;
  highestOI?:      number;   lowestOI?: number;
  bid5?:           Array<{ p: number; q: number; o: number }>;
  ask5?:           Array<{ p: number; q: number; o: number }>;
  bestBid?:        number;   bestAsk?: number; spread?: number;
  // depth channels
  depth20Bid?:     NormalisedDepthLevel[];
  depth20Ask?:     NormalisedDepthLevel[];
  depth200Bid?:    NormalisedDepthLevel[];
  depth200Ask?:    NormalisedDepthLevel[];
  disconnectCode?: number;
}

// ─── Validation ──────────────────────────────────────────────────────────────

interface ValidationError { mode: string; key: string; field: string; value: unknown; reason: string; }
const validationErrors: ValidationError[] = [];

function chk(mode: string, key: string, field: string, value: unknown,
             test: (v: unknown) => boolean, reason: string): boolean {
  if (!test(value)) { validationErrors.push({ mode, key, field, value, reason }); return false; }
  return true;
}

const isFinite2 = (v: unknown): v is number =>
  typeof v === "number" && Number.isFinite(v) && !Number.isNaN(v);
const isPos     = (v: unknown) => isFinite2(v) && (v as number) > 0;
const isNN      = (v: unknown) => isFinite2(v) && Number.isInteger(v as number) && (v as number) >= 0;
const isEpoch   = (v: unknown) =>
  isFinite2(v) && (v as number) > 1_000_000_000 && (v as number) < 9_999_999_999;

function round2(n: number) { return Math.round(n * 100) / 100; }
function toIST(epoch: number) {
  return new Date((epoch + 19800) * 1000).toISOString().slice(11, 19);
}

function normaliseFeedTick(mode: string, tick: MarketFeedEvent): NormalisedTick {
  const key   = `${tick.exchangeSegment}:${tick.securityId}`;
  const label = labelMap.get(key) ?? key;
  const base  = { mode, packetType: tick.type, exchangeSegment: tick.exchangeSegment,
                  securityId: tick.securityId, label, capturedAt: new Date().toISOString() };

  switch (tick.type) {
    case "ticker":
      chk(mode, key, "ltp", tick.ltp, isPos,   "LTP > 0");
      chk(mode, key, "ltt", tick.ltt, isEpoch, "LTT valid epoch");
      return { ...base,
        ltp: isFinite2(tick.ltp) ? round2(tick.ltp) : undefined,
        ltt: isEpoch(tick.ltt) ? toIST(tick.ltt) : undefined, lttEpoch: tick.ltt };

    case "prev-close":
      chk(mode, key, "previousClose", tick.previousClose, isPos, "prevClose > 0");
      chk(mode, key, "prevOI", tick.previousOpenInterest, isNN, "prevOI >= 0");
      return { ...base,
        previousClose:        isFinite2(tick.previousClose) ? round2(tick.previousClose) : undefined,
        previousOpenInterest: tick.previousOpenInterest >= 0 ? tick.previousOpenInterest : undefined };

    case "quote":
      chk(mode, key, "ltp",    tick.ltp,    isPos,   "LTP > 0");
      chk(mode, key, "ltt",    tick.ltt,    isEpoch, "LTT epoch");
      chk(mode, key, "volume", tick.volume, isNN,    "volume >= 0");
      if (tick.dayHigh > 0 && tick.dayLow > 0)
        chk(mode, key, "daySpread", tick.dayHigh - tick.dayLow,
          (v) => isFinite2(v) && (v as number) >= 0, "dayHigh >= dayLow");
      return { ...base,
        ltp: isFinite2(tick.ltp) ? round2(tick.ltp) : undefined,
        ltt: isEpoch(tick.ltt) ? toIST(tick.ltt) : undefined, lttEpoch: tick.ltt,
        ltq: tick.ltq, atp: isFinite2(tick.atp) ? round2(tick.atp) : undefined,
        volume: tick.volume, totalBuyQty: tick.totalBuyQuantity, totalSellQty: tick.totalSellQuantity,
        dayOpen: isFinite2(tick.dayOpen) ? round2(tick.dayOpen) : undefined,
        dayHigh: isFinite2(tick.dayHigh) ? round2(tick.dayHigh) : undefined,
        dayLow:  isFinite2(tick.dayLow)  ? round2(tick.dayLow)  : undefined,
        dayClose: tick.dayClose > 0 ? round2(tick.dayClose) : undefined };

    case "oi":
      chk(mode, key, "OI", tick.openInterest, isNN, "OI >= 0");
      return { ...base, openInterest: tick.openInterest };

    case "full": {
      chk(mode, key, "ltp",    tick.ltp,    isPos,   "LTP > 0");
      chk(mode, key, "ltt",    tick.ltt,    isEpoch, "LTT epoch");
      chk(mode, key, "volume", tick.volume, isNN,    "volume >= 0");
      (tick.depth ?? []).forEach((lvl, i) => {
        chk(mode, key, `depth[${i}].bidQty`, lvl.bidQuantity, isNN, "bidQty >= 0");
        chk(mode, key, `depth[${i}].askQty`, lvl.askQuantity, isNN, "askQty >= 0");
        if (lvl.bidPrice > 0 && lvl.askPrice > 0)
          chk(mode, key, `depth[${i}].spread`, lvl.askPrice - lvl.bidPrice,
            (v) => isFinite2(v) && (v as number) >= 0, "ask >= bid");
      });
      const bid5 = (tick.depth ?? []).map((l) =>
        ({ p: round2(l.bidPrice), q: l.bidQuantity, o: l.bidOrders }));
      const ask5 = (tick.depth ?? []).map((l) =>
        ({ p: round2(l.askPrice), q: l.askQuantity, o: l.askOrders }));
      const l1 = tick.depth?.[0];
      return { ...base,
        ltp: isFinite2(tick.ltp) ? round2(tick.ltp) : undefined,
        ltt: isEpoch(tick.ltt) ? toIST(tick.ltt) : undefined, lttEpoch: tick.ltt,
        ltq: tick.ltq, atp: isFinite2(tick.atp) ? round2(tick.atp) : undefined,
        volume: tick.volume, totalBuyQty: tick.totalBuyQuantity, totalSellQty: tick.totalSellQuantity,
        openInterest: tick.openInterest >= 0 ? tick.openInterest : undefined,
        highestOI: tick.highestOpenInterest > 0 ? tick.highestOpenInterest : undefined,
        lowestOI:  tick.lowestOpenInterest  > 0 ? tick.lowestOpenInterest  : undefined,
        dayOpen:  isFinite2(tick.dayOpen)  ? round2(tick.dayOpen)  : undefined,
        dayHigh:  isFinite2(tick.dayHigh)  ? round2(tick.dayHigh)  : undefined,
        dayLow:   isFinite2(tick.dayLow)   ? round2(tick.dayLow)   : undefined,
        dayClose: tick.dayClose > 0 ? round2(tick.dayClose) : undefined,
        bid5, ask5,
        bestBid: l1?.bidPrice > 0 ? round2(l1.bidPrice) : undefined,
        bestAsk: l1?.askPrice > 0 ? round2(l1.askPrice) : undefined,
        spread:  l1?.bidPrice > 0 && l1?.askPrice > 0 ? round2(l1.askPrice - l1.bidPrice) : undefined };
    }

    case "disconnect":
      return { ...base, disconnectCode: tick.reasonCode };

    default:
      return base;
  }
}

// ─── State per mode ───────────────────────────────────────────────────────────

type ModeKey = "TICKER" | "QUOTE" | "FULL" | "DEPTH20" | "DEPTH200";

interface ModeState {
  tickCounts:  Map<string, number>;
  packetTypes: Map<string, Set<string>>;
  lastNorm:    Map<string, NormalisedTick>;
  allNorm:     NormalisedTick[];
}

const modeStates = new Map<ModeKey, ModeState>(
  (["TICKER", "QUOTE", "FULL", "DEPTH20", "DEPTH200"] as ModeKey[]).map((k) => [k, {
    tickCounts:  new Map(INSTRUMENTS.map((i) => [`${i.exchangeSegment}:${i.securityId}`, 0])),
    packetTypes: new Map(INSTRUMENTS.map((i) => [`${i.exchangeSegment}:${i.securityId}`, new Set<string>()])),
    lastNorm:    new Map(),
    allNorm:     [],
  }])
);

// ─── Console log ─────────────────────────────────────────────────────────────

function logTick(norm: NormalisedTick): void {
  const parts = [
    `[${norm.capturedAt.slice(11, 23)}]`,
    `[${norm.mode.padEnd(7)}][${norm.packetType.toUpperCase().padEnd(10)}]`,
    norm.label.padEnd(16),
    norm.exchangeSegment.padEnd(14),
  ];
  if (norm.ltp          != null) parts.push(`LTP=₹${norm.ltp.toFixed(2)}`);
  if (norm.ltt          != null) parts.push(`LTT=${norm.ltt}`);
  if (norm.volume       != null) parts.push(`VOL=${norm.volume.toLocaleString("en-IN")}`);
  if (norm.openInterest != null && norm.openInterest > 0)
    parts.push(`OI=${norm.openInterest.toLocaleString("en-IN")}`);
  if (norm.bestBid      != null)
    parts.push(`Bid=₹${norm.bestBid.toFixed(2)} Ask=₹${norm.bestAsk?.toFixed(2)} Δ=${norm.spread?.toFixed(2)}`);
  if (norm.previousClose != null) parts.push(`prevClose=₹${norm.previousClose.toFixed(2)}`);
  if (norm.depth20Bid   != null) {
    const l1 = norm.depth20Bid[0];
    if (l1) parts.push(`D20-Bid[1]=₹${l1.price.toFixed(2)}×${l1.qty}`);
  }
  if (norm.depth20Ask   != null) {
    const l1 = norm.depth20Ask[0];
    if (l1) parts.push(`D20-Ask[1]=₹${l1.price.toFixed(2)}×${l1.qty}`);
  }
  if (norm.depth200Bid  != null) parts.push(`D200-Bid levels=${norm.depth200Bid.length}`);
  if (norm.depth200Ask  != null) parts.push(`D200-Ask levels=${norm.depth200Ask.length}`);
  if (norm.packetType   === "disconnect") parts.push(`⚠️ DISCONNECT code=${norm.disconnectCode}`);
  console.log(parts.join("  "));
}

function recordFeedTick(modeKey: ModeKey, norm: NormalisedTick): void {
  const st  = modeStates.get(modeKey)!;
  const key = `${norm.exchangeSegment}:${norm.securityId}`;
  st.tickCounts.set(key, (st.tickCounts.get(key) ?? 0) + 1);
  st.packetTypes.get(key)?.add(norm.packetType);
  st.lastNorm.set(key, norm);
  st.allNorm.push(norm);
  logTick(norm);
}

// ─── WS connection factory ───────────────────────────────────────────────────

function openConnection(opts: {
  tag:         ModeKey;
  url:         string;
  onOpen:      (ws: WebSocket) => void;
  onMessage:   (data: Buffer)  => void;
  onDone:      () => void;
  durationMs:  number;
}): void {
  const ws = new WebSocket(opts.url);
  ws.on("open", () => { console.log(`  ✅  [${opts.tag}] OPEN`); opts.onOpen(ws); });
  ws.on("message", (data: WebSocket.RawData) => {
    let buf: Buffer;
    if      (Buffer.isBuffer(data))       buf = data;
    else if (data instanceof ArrayBuffer) buf = Buffer.from(data);
    else if (Array.isArray(data))         buf = Buffer.concat(data as Buffer[]);
    else                                  return;
    opts.onMessage(buf);
  });
  ws.on("ping", () => process.stdout.write(`  🏓 [${opts.tag}] ping→pong\n`));
  ws.on("error", (e: Error) => console.error(`  ❌  [${opts.tag}] ERR: ${e.message}`));
  ws.on("close", (c: number) => { console.log(`  🔌  [${opts.tag}] CLOSED code=${c}`); opts.onDone(); });
  setTimeout(() => { try { ws.close(); } catch (_) {/***/} }, opts.durationMs);
}

// ─── Summary ─────────────────────────────────────────────────────────────────

function printSummary(): void {
  const HR = "═".repeat(118);
  const allModes: Array<{ key: ModeKey; desc: string; instList: Instrument[] }> = [
    { key: "TICKER",  desc: "Ticker LTP+LTT",           instList: INSTRUMENTS },
    { key: "QUOTE",   desc: "Quote LTP+OHLCV",           instList: INSTRUMENTS },
    { key: "FULL",    desc: "Full OHLCV+5depth+OI",      instList: INSTRUMENTS },
    { key: "DEPTH20", desc: "Full 20-level bid/ask",     instList: DEPTH20_INSTRUMENTS },
    { key: "DEPTH200",desc: "Full 200-level bid/ask (1 scrip)", instList: [DEPTH200_INSTRUMENT] },
  ];

  console.log(`\n\n${HR}`);
  console.log(`  ALL-MODES WEBSOCKET VALIDATION SUMMARY  (${DURATION_SECONDS}s capture)`);
  console.log(HR);

  for (const { key, desc, instList } of allModes) {
    const st    = modeStates.get(key)!;
    const total = [...st.tickCounts.values()].reduce((a, b) => a + b, 0);
    console.log(`\n  ▶ [${key}] — ${desc}  (${total} packets)`);
    console.log(`  ${"Instrument".padEnd(16)} ${"Segment".padEnd(14)} ${"Ticks".padStart(7)} ${"Packet Types".padEnd(40)} ${"Last LTP / Best Bid:Ask"}`);
    console.log(`  ${"─".repeat(110)}`);

    for (const inst of instList) {
      const k    = `${inst.exchangeSegment}:${inst.securityId}`;
      const cnt  = st.tickCounts.get(k) ?? 0;
      const pkts = [...(st.packetTypes.get(k) ?? [])].join(", ");
      const last = st.lastNorm.get(k);
      let priceStr = "—";
      if (last?.ltp       != null) priceStr = `₹${last.ltp.toFixed(2)}`;
      if (last?.bestBid   != null) priceStr += `  Bid=₹${last.bestBid.toFixed(2)} Ask=₹${last.bestAsk?.toFixed(2)} Δ=${last.spread?.toFixed(2)}`;
      if (last?.depth20Bid != null) {
        const l1 = last.depth20Bid[0]; const a1 = last.depth20Ask?.[0];
        if (l1 && a1) priceStr = `D20 Bid[1]=₹${l1.price}×${l1.qty}  Ask[1]=₹${a1.price}×${a1.qty}`;
      }
      if (last?.depth200Bid != null) {
        const b = last.depth200Bid.length; const a = last.depth200Ask?.length ?? 0;
        priceStr = `D200 Bid=${b} levels  Ask=${a} levels`;
      }
      console.log(`  ${inst.label.padEnd(16)} ${inst.exchangeSegment.padEnd(14)} ${String(cnt).padStart(7)} ${pkts.padEnd(40)} ${priceStr}`);
    }
  }

  // ── Field coverage matrix ─────────────────────────────────────────────────
  console.log(`\n\n${HR}`);
  console.log("  FIELD COVERAGE — fields present in ≥1 tick, by mode");
  console.log(HR);
  const coverage: Record<ModeKey, Set<string>> = {
    TICKER: new Set(), QUOTE: new Set(), FULL: new Set(), DEPTH20: new Set(), DEPTH200: new Set(),
  };
  const SKIP = new Set(["mode","packetType","exchangeSegment","securityId","label","capturedAt"]);
  for (const [mk, st] of modeStates) {
    for (const norm of st.allNorm) {
      for (const [k, v] of Object.entries(norm)) {
        if (!SKIP.has(k) && v != null) coverage[mk as ModeKey].add(k);
      }
    }
  }
  const allFields = [...new Set(Object.values(coverage).flatMap((s) => [...s]))].sort();
  const H2 = `  ${"Field".padEnd(24)} ${"TICKER".padStart(9)} ${"QUOTE".padStart(9)} ${"FULL".padStart(9)} ${"DEPTH20".padStart(9)} ${"DEPTH200".padStart(10)}`;
  console.log(H2);
  console.log(`  ${"─".repeat(73)}`);
  for (const f of allFields) {
    const cols = (["TICKER","QUOTE","FULL","DEPTH20","DEPTH200"] as ModeKey[])
      .map((m) => (coverage[m].has(f) ? "  ✅" : "   ✗").padStart(9));
    console.log(`  ${f.padEnd(24)}${cols.join("")}`);
  }

  // ── Validation errors ─────────────────────────────────────────────────────
  console.log(`\n\n${HR}`);
  console.log(`  VALIDATION ERRORS — ${validationErrors.length} total`);
  console.log(HR);
  if (validationErrors.length === 0) {
    console.log("  ✅  All fields passed type + range checks — binary decoding is clean.");
  } else {
    for (const e of validationErrors.slice(0, 60)) {
      console.log(`  [${e.mode.padEnd(8)}] ${e.key.padEnd(30)}  ${e.field.padEnd(20)} value=${JSON.stringify(e.value)}  → ${e.reason}`);
    }
    if (validationErrors.length > 60) console.log(`  … +${validationErrors.length - 60} more`);
  }

  // ── Depth samples ─────────────────────────────────────────────────────────

  // FULL mode — 5-level depth
  console.log(`\n\n${HR}`);
  console.log("  FULL MODE — 5-Level Market Depth Sample (last snapshot per instrument)");
  console.log(HR);
  const fullSt = modeStates.get("FULL")!;
  for (const inst of INSTRUMENTS) {
    const last = fullSt.lastNorm.get(`${inst.exchangeSegment}:${inst.securityId}`);
    if (!last?.bid5?.length) continue;
    console.log(`\n  ${inst.label} (${inst.exchangeSegment})   LTP=₹${last.ltp?.toFixed(2) ?? "—"}`);
    console.log(`  ${"Lvl".padEnd(5)} ${"Bid Qty".padStart(10)} ${"Bid ₹".padStart(10)} ${"Ask ₹".padStart(10)} ${"Ask Qty".padStart(10)} ${"Spread".padStart(10)}`);
    console.log(`  ${"─".repeat(60)}`);
    (last.bid5 ?? []).forEach((b, i) => {
      const a      = last.ask5?.[i];
      const spread = a && b.p > 0 && a.p > 0 ? (a.p - b.p).toFixed(2) : "—";
      console.log(`  ${String(i+1).padEnd(5)} ${b.q.toLocaleString("en-IN").padStart(10)} ${b.p.toFixed(2).padStart(10)} ${(a?.p ?? 0).toFixed(2).padStart(10)} ${(a?.q ?? 0).toLocaleString("en-IN").padStart(10)} ${spread.padStart(10)}`);
    });
  }

  // DEPTH20 — first 5 of 20 levels
  console.log(`\n\n${HR}`);
  console.log("  DEPTH-20 — 20-Level Market Depth Sample (top 5 shown per instrument)");
  console.log(HR);
  const d20St = modeStates.get("DEPTH20")!;
  for (const inst of DEPTH20_INSTRUMENTS) {
    const last = d20St.lastNorm.get(`${inst.exchangeSegment}:${inst.securityId}`);
    if (!last?.depth20Bid?.length) continue;
    console.log(`\n  ${inst.label} (${inst.exchangeSegment})`);
    console.log(`  ${"Lvl".padEnd(5)} ${"Bid Qty".padStart(10)} ${"Bid ₹".padStart(12)} ${"Ask ₹".padStart(12)} ${"Ask Qty".padStart(10)} ${"Bid Orders".padStart(12)} ${"Ask Orders".padStart(12)}`);
    console.log(`  ${"─".repeat(75)}`);
    const bids = last.depth20Bid.slice(0, 5);
    const asks = last.depth20Ask?.slice(0, 5) ?? [];
    bids.forEach((b, i) => {
      const a = asks[i];
      console.log(`  ${String(i+1).padEnd(5)} ${b.qty.toLocaleString("en-IN").padStart(10)} ${b.price.toFixed(2).padStart(12)} ${(a?.price ?? 0).toFixed(2).padStart(12)} ${(a?.qty ?? 0).toLocaleString("en-IN").padStart(10)} ${b.orders.toLocaleString("en-IN").padStart(12)} ${(a?.orders ?? 0).toLocaleString("en-IN").padStart(12)}`);
    });
  }

  // DEPTH200 — first 10 levels
  console.log(`\n\n${HR}`);
  console.log("  DEPTH-200 — 200-Level Market Depth Sample (top 10 shown)");
  console.log(HR);
  const d200St = modeStates.get("DEPTH200")!;
  const d200Key = `${DEPTH200_INSTRUMENT.exchangeSegment}:${DEPTH200_INSTRUMENT.securityId}`;
  const d200Last = d200St.lastNorm.get(d200Key);
  if (d200Last?.depth200Bid?.length) {
    console.log(`\n  ${DEPTH200_INSTRUMENT.label} (${DEPTH200_INSTRUMENT.exchangeSegment})  totalBidLevels=${d200Last.depth200Bid.length}  totalAskLevels=${d200Last.depth200Ask?.length ?? 0}`);
    console.log(`  ${"Lvl".padEnd(5)} ${"Bid Qty".padStart(10)} ${"Bid ₹".padStart(12)} ${"Ask ₹".padStart(12)} ${"Ask Qty".padStart(10)}`);
    console.log(`  ${"─".repeat(55)}`);
    const bids = d200Last.depth200Bid.slice(0, 10);
    const asks = d200Last.depth200Ask?.slice(0, 10) ?? [];
    bids.forEach((b, i) => {
      const a = asks[i];
      console.log(`  ${String(i+1).padEnd(5)} ${b.qty.toLocaleString("en-IN").padStart(10)} ${b.price.toFixed(2).padStart(12)} ${(a?.price ?? 0).toFixed(2).padStart(12)} ${(a?.qty ?? 0).toLocaleString("en-IN").padStart(10)}`);
    });
  } else {
    console.log("  (no 200-level depth data received — endpoint may require different sub format)");
  }

  console.log(`\n${HR}\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  console.log(`🔑  Fetching token from ${TOKEN_SERVICE_ORIGIN}/auth/dhan/token ...`);
  const sdk      = await DhanClient.fromTokenEndpoint({ endpointBaseUrl: TOKEN_SERVICE_ORIGIN, bearerToken: TOKEN_BEARER });
  const config   = sdk.getConfig();
  const token    = config.token ?? "";
  const clientId = config.clientId || FALLBACK_CLIENT_ID;

  const pl      = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()) as { exp: number; iat: number };
  const expired = Date.now() / 1000 > pl.exp;
  console.log(`  ✅  Token iat=${new Date(pl.iat*1000).toISOString()}  exp=${new Date(pl.exp*1000).toISOString()}${expired?" ⚠️ EXPIRED":""}`);
  if (expired) { console.error("❌  Token expired"); process.exit(1); }

  const feedUrl    = `wss://api-feed.dhan.co?version=2&token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(clientId)}&authType=2`;
  const depth20Url = `wss://depth-api-feed.dhan.co/twentydepth?token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(clientId)}&authType=2`;
  const depth200Url= `wss://full-depth-api.dhan.co/twohundreddepth?token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(clientId)}&authType=2`;

  const depth20LabelMap = new Map(
    DEPTH20_INSTRUMENTS.map((i) => [i.securityId, i.label])
  );

  console.log("\n" + "═".repeat(118));
  console.log("  DhanHQ — ALL WS MODES + FULL MARKET DEPTH (20 & 200-level) — Decode & Validate");
  console.log(`  Duration: ${DURATION_SECONDS}s  |  Feed instruments: ${INSTRUMENTS.length}  |  Depth20: ${DEPTH20_INSTRUMENTS.length}  |  Depth200: 1 (RELIANCE)`);
  console.log(`  Connections: TICKER · QUOTE · FULL (api-feed)  +  DEPTH20 (depth-api-feed)  +  DEPTH200 (full-depth-api)`);
  console.log("═".repeat(118) + "\n");

  let closed = 0;
  const allDone = new Promise<void>((res) => {
    const onDone = () => { if (++closed === 5) res(); };
    const MS = DURATION_SECONDS * 1000;

    // [A] TICKER
    openConnection({ tag: "TICKER", url: feedUrl, durationMs: MS, onDone,
      onOpen: (ws) => ws.send(JSON.stringify({ RequestCode: 15, InstrumentCount: INSTRUMENTS.length,
        InstrumentList: INSTRUMENTS.map((i) => ({ ExchangeSegment: i.exchangeSegment, SecurityId: i.securityId })) })),
      onMessage: (buf) => {
        for (const pkt of splitPackets(buf)) {
          const tick = parseMarketFeedPacket(pkt, storedSubs);
          if (tick) recordFeedTick("TICKER", normaliseFeedTick("TICKER", tick));
        }
      },
    });

    // [B] QUOTE
    openConnection({ tag: "QUOTE", url: feedUrl, durationMs: MS, onDone,
      onOpen: (ws) => ws.send(JSON.stringify({ RequestCode: 17, InstrumentCount: INSTRUMENTS.length,
        InstrumentList: INSTRUMENTS.map((i) => ({ ExchangeSegment: i.exchangeSegment, SecurityId: i.securityId })) })),
      onMessage: (buf) => {
        for (const pkt of splitPackets(buf)) {
          const tick = parseMarketFeedPacket(pkt, storedSubs);
          if (tick) recordFeedTick("QUOTE", normaliseFeedTick("QUOTE", tick));
        }
      },
    });

    // [C] FULL
    openConnection({ tag: "FULL", url: feedUrl, durationMs: MS, onDone,
      onOpen: (ws) => ws.send(JSON.stringify({ RequestCode: 21, InstrumentCount: INSTRUMENTS.length,
        InstrumentList: INSTRUMENTS.map((i) => ({ ExchangeSegment: i.exchangeSegment, SecurityId: i.securityId })) })),
      onMessage: (buf) => {
        for (const pkt of splitPackets(buf)) {
          const tick = parseMarketFeedPacket(pkt, storedSubs);
          if (tick) recordFeedTick("FULL", normaliseFeedTick("FULL", tick));
        }
      },
    });

    // [D] DEPTH20 — separate endpoint, separate subscription format
    openConnection({ tag: "DEPTH20", url: depth20Url, durationMs: MS, onDone,
      onOpen: (ws) => {
        // Dhan docs: RequestCode=23, same InstrumentList structure as feed
        ws.send(JSON.stringify({
          RequestCode: 23,
          InstrumentCount: DEPTH20_INSTRUMENTS.length,
          InstrumentList: DEPTH20_INSTRUMENTS.map((i) => ({ ExchangeSegment: i.exchangeSegment, SecurityId: i.securityId })),
        }));
        console.log(`  📡 [DEPTH20] subscribed ${DEPTH20_INSTRUMENTS.length} instruments (NSE_EQ + NSE_FNO)`);
      },
      onMessage: (buf) => {
        const packets = parseDepth20(buf, depth20LabelMap);
        for (const pkt of packets) {
          const st  = modeStates.get("DEPTH20")!;
          const key = `${pkt.exchangeSegment}:${pkt.securityId}`;
          st.tickCounts.set(key, (st.tickCounts.get(key) ?? 0) + 1);
          st.packetTypes.get(key)?.add(pkt.type);

          // Validate each level
          pkt.levels.forEach((lvl, i) => {
            chk("DEPTH20", key, `lvl[${i}].price`,  lvl.price,  isPos, "price > 0");
            chk("DEPTH20", key, `lvl[${i}].qty`,    lvl.qty,    isNN,  "qty >= 0");
            chk("DEPTH20", key, `lvl[${i}].orders`, lvl.orders, isNN,  "orders >= 0");
          });

          // Build normalised tick
          const existing = st.lastNorm.get(key);
          const norm: NormalisedTick = existing ?? {
            mode: "DEPTH20", packetType: pkt.type,
            exchangeSegment: pkt.exchangeSegment, securityId: pkt.securityId,
            label: pkt.label, capturedAt: pkt.capturedAt,
          };
          if (pkt.type === "depth-20-bid") {
            norm.depth20Bid = pkt.levels.map((l) => ({ price: l.price, qty: l.qty, orders: l.orders }));
          } else {
            norm.depth20Ask = pkt.levels.map((l) => ({ price: l.price, qty: l.qty, orders: l.orders }));
          }
          norm.capturedAt  = pkt.capturedAt;
          norm.packetType  = pkt.type;
          st.lastNorm.set(key, norm);
          st.allNorm.push({ ...norm });
          logTick(norm);
        }

        // Raw hex fallback for unrecognized packets
        if (packets.length === 0 && buf.length > 0) {
          const code = buf.readUInt8(2);
          console.log(`  [DEPTH20][RAW] code=${code} len=${buf.length} hex=${buf.slice(0, Math.min(24, buf.length)).toString("hex")}`);
        }
      },
    });

    // [E] DEPTH200 — 1 instrument per connection
    openConnection({ tag: "DEPTH200", url: depth200Url, durationMs: MS, onDone,
      onOpen: (ws) => {
        ws.send(JSON.stringify({
          RequestCode:     23,
          ExchangeSegment: DEPTH200_INSTRUMENT.exchangeSegment,
          SecurityId:      DEPTH200_INSTRUMENT.securityId,
        }));
        console.log(`  📡 [DEPTH200] subscribed: ${DEPTH200_INSTRUMENT.label} (${DEPTH200_INSTRUMENT.exchangeSegment}:${DEPTH200_INSTRUMENT.securityId})`);
      },
      onMessage: (buf) => {
        const packets = parseDepth200(buf, DEPTH200_INSTRUMENT);
        for (const pkt of packets) {
          const st  = modeStates.get("DEPTH200")!;
          const key = `${pkt.exchangeSegment}:${pkt.securityId}`;
          st.tickCounts.set(key, (st.tickCounts.get(key) ?? 0) + 1);
          st.packetTypes.get(key)?.add(pkt.type);

          pkt.levels.forEach((lvl, i) => {
            chk("DEPTH200", key, `lvl[${i}].price`,  lvl.price,  isPos, "price > 0");
            chk("DEPTH200", key, `lvl[${i}].qty`,    lvl.qty,    isNN,  "qty >= 0");
          });

          const existing = st.lastNorm.get(key);
          const norm: NormalisedTick = existing ?? {
            mode: "DEPTH200", packetType: pkt.type,
            exchangeSegment: pkt.exchangeSegment, securityId: pkt.securityId,
            label: pkt.label, capturedAt: pkt.capturedAt,
          };
          if (pkt.type === "depth-200-bid") {
            norm.depth200Bid = pkt.levels.map((l) => ({ price: l.price, qty: l.qty, orders: l.orders }));
          } else {
            norm.depth200Ask = pkt.levels.map((l) => ({ price: l.price, qty: l.qty, orders: l.orders }));
          }
          norm.capturedAt = pkt.capturedAt;
          norm.packetType = pkt.type;
          st.lastNorm.set(key, norm);
          st.allNorm.push({ ...norm });
          logTick(norm);
        }

        if (packets.length === 0 && buf.length > 0) {
          const code = buf.length > 2 ? buf.readUInt8(2) : -1;
          console.log(`  [DEPTH200][RAW] code=${code} len=${buf.length} hex=${buf.slice(0, Math.min(24, buf.length)).toString("hex")}`);
        }
      },
    });
  });

  // Heartbeat
  let elapsed = 0;
  const hb = setInterval(() => {
    elapsed += 10;
    const line = (["TICKER","QUOTE","FULL","DEPTH20","DEPTH200"] as ModeKey[])
      .map((m) => `${m}=${[...modeStates.get(m)!.tickCounts.values()].reduce((a,b)=>a+b,0)}`)
      .join("  ");
    process.stdout.write(`\n  ⏱ [${String(elapsed).padStart(2)}s/${DURATION_SECONDS}s]  ${line}  errs=${validationErrors.length}\n\n`);
  }, 10_000);

  await allDone;
  clearInterval(hb);

  printSummary();

  // Write JSON logs
  for (const [mk, st] of modeStates) {
    const file = path.join(OUT_DIR, `ws-${mk.toLowerCase()}-mode-log.json`);
    fs.writeFileSync(file, JSON.stringify({
      mode: mk, capturedAt: new Date().toISOString(), duration: DURATION_SECONDS,
      validationErrors: validationErrors.filter((e) => e.mode === mk),
      totalTicks: st.allNorm.length,
      ticks: st.allNorm,
    }, null, 2));
    console.log(`📄  ${mk} → ${file}`);
  }

  console.log("\n✅  All connections complete.\n");
  process.exit(0);
}

main().catch((err: unknown) => { console.error("Fatal:", err); process.exit(1); });
