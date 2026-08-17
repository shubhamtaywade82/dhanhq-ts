/**
 * ws-depth-probe.ts
 *
 * Probe script that captures raw depth packets from BOTH depth endpoints
 * and dumps them as hex + tries multiple endian/offset interpretations
 * so we can figure out the EXACT binary layout of the Dhan depth response.
 *
 * Run for 20s, prints everything it sees.
 */

import * as path   from "path";
import * as dotenv from "dotenv";
import WebSocket   from "ws";
import { DhanClient } from "../src/client/DhanClient";

dotenv.config({ path: path.join(__dirname, "../.env") });

const TOKEN_SERVICE_ORIGIN = (() => {
  try { return new URL(process.env.DHAN_TOKEN_SERVICE_URL ?? "").origin; } catch { return ""; }
})();
const TOKEN_BEARER       = process.env.DHAN_TOKEN_ACCESS_TOKEN ?? "";
const FALLBACK_CLIENT_ID = process.env.DHAN_CLIENT_ID ?? "";

async function main(): Promise<void> {
  const sdk      = await DhanClient.fromTokenEndpoint({ endpointBaseUrl: TOKEN_SERVICE_ORIGIN, bearerToken: TOKEN_BEARER });
  const config   = sdk.getConfig();
  const token    = config.token ?? "";
  const clientId = config.clientId || FALLBACK_CLIENT_ID;

  console.log(`✅  Token obtained  clientId=${clientId}\n`);

  const depth20Url  = `wss://depth-api-feed.dhan.co/twentydepth?token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(clientId)}&authType=2`;
  const depth200Url = `wss://full-depth-api.dhan.co/twohundreddepth?token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(clientId)}&authType=2`;

  // Probe instrument: HDFC Bank NSE_EQ securityId=1333
  const PROBE_SEG = "NSE_EQ";
  const PROBE_ID  = "1333";

  let d20Captured  = 0;
  let d200Captured = 0;
  let closed = 0;

  function tryClose() { if (++closed >= 2) process.exit(0); }

  // ── DEPTH-20 probe ────────────────────────────────────────────────────────
  const ws20 = new WebSocket(depth20Url);
  ws20.on("open", () => {
    console.log("✅  DEPTH20 OPEN — subscribing HDFC Bank");
    ws20.send(JSON.stringify({
      RequestCode:     23,
      InstrumentCount: 1,
      InstrumentList: [{ ExchangeSegment: PROBE_SEG, SecurityId: PROBE_ID }],
    }));
  });

  ws20.on("message", (data: WebSocket.RawData) => {
    const buf = Buffer.isBuffer(data) ? data
              : data instanceof ArrayBuffer ? Buffer.from(data)
              : Array.isArray(data) ? Buffer.concat(data as Buffer[])
              : Buffer.from(String(data as unknown));

    if (d20Captured >= 4) return;   // capture first 4 raw messages
    d20Captured++;

    console.log("\n" + "═".repeat(80));
    console.log(`[DEPTH20] RAW MESSAGE #${d20Captured}  totalBytes=${buf.length}`);
    console.log("─".repeat(80));

    // Full hex dump
    for (let i = 0; i < Math.min(buf.length, 256); i += 16) {
      const slice  = buf.slice(i, i + 16);
      const hex    = [...slice].map((b) => b.toString(16).padStart(2, "0")).join(" ");
      const ascii  = [...slice].map((b) => b >= 32 && b < 127 ? String.fromCharCode(b) : ".").join("");
      console.log(`  ${String(i).padStart(4, "0")}  ${hex.padEnd(47)}  ${ascii}`);
    }
    if (buf.length > 256) console.log(`  ... ${buf.length - 256} more bytes`);

    // Header interpretation (12 bytes)
    if (buf.length >= 12) {
      console.log("\n  ── Header (12 bytes) ──");
      console.log(`  [0-1]  msgLen   int16LE  = ${buf.readInt16LE(0)}`);
      console.log(`  [2]    respCode uint8     = ${buf.readUInt8(2)}  (41=Bid, 51=Ask)`);
      console.log(`  [3]    segCode  uint8     = ${buf.readUInt8(3)}`);
      console.log(`  [4-7]  secId    int32LE   = ${buf.readInt32LE(4)}`);
      console.log(`  [8-11] seq/rows uint32LE  = ${buf.readUInt32LE(8)}`);
    }

    // Try first level at offset 12 with multiple interpretations
    if (buf.length >= 28) {
      console.log("\n  ── First level at offset 12 (16 bytes) — price interpretations ──");
      const off = 12;
      console.log(`  float64 LE  @ 12 = ${buf.readDoubleBE(off).toFixed(4)}`);
      console.log(`  float64 BE  @ 12 = ${buf.readDoubleBE(off)}`);
      console.log(`  float64 LE  @ 12 = ${buf.readDoubleLE(off).toFixed(4)}`);
      console.log(`  float32 LE  @ 12 = ${buf.readFloatLE(off).toFixed(4)}`);
      console.log(`  float32 BE  @ 12 = ${buf.readFloatBE(off).toFixed(4)}`);
      // qty at different offsets
      console.log(`  uint32 LE   @ 20 = ${buf.readUInt32LE(off + 8)}`);
      console.log(`  uint32 BE   @ 20 = ${buf.readUInt32BE(off + 8)}`);
      console.log(`  uint32 LE   @ 24 = ${buf.readUInt32LE(off + 12)}`);
      console.log(`  uint32 BE   @ 24 = ${buf.readUInt32BE(off + 12)}`);
    }

    // If this looks like a stacked message, try offset 12+msgLen
    const msgLen0 = buf.readInt16LE(0);
    if (msgLen0 > 12 && msgLen0 < buf.length && buf.length >= msgLen0 + 12) {
      const off2 = msgLen0;
      console.log(`\n  ── Second packet at offset ${off2} (stacked) ──`);
      console.log(`  [+0-1] msgLen   int16LE  = ${buf.readInt16LE(off2)}`);
      console.log(`  [+2]   respCode uint8     = ${buf.readUInt8(off2 + 2)}  (41=Bid, 51=Ask)`);
      console.log(`  [+3]   segCode  uint8     = ${buf.readUInt8(off2 + 3)}`);
      console.log(`  [+4-7] secId    int32LE   = ${buf.readInt32LE(off2 + 4)}`);
    }
    console.log();
  });

  ws20.on("error", (e: Error) => console.error(`DEPTH20 ERR: ${e.message}`));
  ws20.on("close", (c: number) => { console.log(`DEPTH20 CLOSED code=${c}`); tryClose(); });
  setTimeout(() => ws20.close(), 20_000);

  // ── DEPTH-200 probe ───────────────────────────────────────────────────────
  const ws200 = new WebSocket(depth200Url);
  ws200.on("open", () => {
    console.log("✅  DEPTH200 OPEN — subscribing HDFC Bank");
    ws200.send(JSON.stringify({
      RequestCode:     23,
      ExchangeSegment: PROBE_SEG,
      SecurityId:      PROBE_ID,
    }));
  });

  ws200.on("message", (data: WebSocket.RawData) => {
    const buf = Buffer.isBuffer(data) ? data
              : data instanceof ArrayBuffer ? Buffer.from(data)
              : Array.isArray(data) ? Buffer.concat(data as Buffer[])
              : Buffer.from(String(data as unknown));

    if (d200Captured >= 4) return;
    d200Captured++;

    console.log("\n" + "═".repeat(80));
    console.log(`[DEPTH200] RAW MESSAGE #${d200Captured}  totalBytes=${buf.length}`);
    console.log("─".repeat(80));

    for (let i = 0; i < Math.min(buf.length, 256); i += 16) {
      const slice = buf.slice(i, i + 16);
      const hex   = [...slice].map((b) => b.toString(16).padStart(2, "0")).join(" ");
      const ascii = [...slice].map((b) => b >= 32 && b < 127 ? String.fromCharCode(b) : ".").join("");
      console.log(`  ${String(i).padStart(4, "0")}  ${hex.padEnd(47)}  ${ascii}`);
    }
    if (buf.length > 256) console.log(`  ... ${buf.length - 256} more bytes`);

    if (buf.length >= 12) {
      console.log("\n  ── Header (12 bytes) ──");
      console.log(`  [0-1]  msgLen   int16LE  = ${buf.readInt16LE(0)}`);
      console.log(`  [2]    respCode uint8     = ${buf.readUInt8(2)}`);
      console.log(`  [3]    segCode  uint8     = ${buf.readUInt8(3)}`);
      console.log(`  [4-7]  secId    int32LE   = ${buf.readInt32LE(4)}`);
      console.log(`  [8-11] numRows  uint32LE  = ${buf.readUInt32LE(8)}`);
    }
    if (buf.length >= 28) {
      console.log("\n  ── First level at offset 12 ──");
      const off = 12;
      console.log(`  float64 LE @ 12 = ${buf.readDoubleLE(off).toFixed(4)}`);
      console.log(`  float64 BE @ 12 = ${buf.readDoubleBE(off).toFixed(4)}`);
      console.log(`  float32 LE @ 12 = ${buf.readFloatLE(off).toFixed(4)}`);
      console.log(`  uint32 LE  @ 20 = ${buf.readUInt32LE(off + 8)}`);
      console.log(`  uint32 BE  @ 20 = ${buf.readUInt32BE(off + 8)}`);
    }
    console.log();
  });

  ws200.on("error", (e: Error) => console.error(`DEPTH200 ERR: ${e.message}`));
  ws200.on("close", (c: number) => { console.log(`DEPTH200 CLOSED code=${c}`); tryClose(); });
  setTimeout(() => ws200.close(), 20_000);
}

main().catch((e: unknown) => { console.error(e); process.exit(1); });
