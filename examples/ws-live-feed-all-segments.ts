/**
 * ws-live-feed-all-segments.ts
 *
 * REAL API live WebSocket test — NOT a unit test.
 *
 * Token is fetched automatically from the Render algo-trading-api app using
 * `DhanClient.fromTokenEndpoint()`. No DHAN_TOKEN in .env needed — only
 * DHAN_TOKEN_SERVICE_URL and DHAN_TOKEN_ACCESS_TOKEN are required.
 *
 * Segments covered:
 *   • IDX_I        — Indices (NIFTY 50, BANK NIFTY, SENSEX, NIFTY IT, MIDCAP 50)
 *   • NSE_EQ       — NSE Equity (HDFC Bank, RELIANCE, TCS, INFOSYS, ICICI Bank)
 *   • BSE_EQ       — BSE Equity (Reliance, TCS on BSE)
 *   • NSE_FNO      — F&O: NIFTY/BANKNIFTY options + futures, RELIANCE FUT
 *   • BSE_FNO      — BSE Derivatives (SENSEX FUT)
 *   • MCX_COMM     — Commodity (GOLD, SILVER, CRUDEOIL, COPPER)
 *   • NSE_CURRENCY — Currency (USDINR, EURINR)
 *
 * Usage (run from the sdk root):
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' examples/ws-live-feed-all-segments.ts
 *
 * Required env vars (all already in .env):
 *   DHAN_TOKEN_SERVICE_URL     — base URL of the Render token service
 *   DHAN_TOKEN_ACCESS_TOKEN    — bearer secret for the token endpoint
 *   DHAN_CLIENT_ID             — your Dhan client ID (used as fallback)
 */

import * as fs from "fs";
import * as path from "path";
import * as dotenv from "dotenv";
import WebSocket from "ws";

import { DhanClient } from "../src/client/DhanClient";
import { parseMarketFeedPacket } from "../src/ws/parsers/marketFeed";
import { splitPackets } from "../src/ws/parsers/packetSplitter";
import type { MarketFeedEvent, StoredSubscription } from "../src/types/ws.types";

dotenv.config({ path: path.join(__dirname, "../.env") });

// ─── Config ───────────────────────────────────────────────────────────────────

const DURATION_SECONDS   = 90;
const LOG_FILE           = path.join(__dirname, "ws-live-feed-log.json");
const FEED_REQUEST_CODE  = 17;   // 15=Ticker  17=Quote(LTP+OHLCV)  21=Full(+Depth)
const FEED_MODE_NAME     = "QUOTE";

// DHAN_TOKEN_SERVICE_URL may be the full path (e.g. https://host/auth/dhan/token).
// DhanClient.fromTokenEndpoint() needs just the origin (https://host) and will
// append /auth/dhan/token itself — so we strip the path component here.
const TOKEN_SERVICE_URL_RAW = process.env.DHAN_TOKEN_SERVICE_URL ?? "";
const TOKEN_SERVICE_ORIGIN  = TOKEN_SERVICE_URL_RAW
  ? new URL(TOKEN_SERVICE_URL_RAW).origin
  : "";
const TOKEN_BEARER          = process.env.DHAN_TOKEN_ACCESS_TOKEN ?? "";
const FALLBACK_CLIENT_ID    = process.env.DHAN_CLIENT_ID ?? "";

if (!TOKEN_SERVICE_ORIGIN || !TOKEN_BEARER) {
  console.error(
    "❌  DHAN_TOKEN_SERVICE_URL and DHAN_TOKEN_ACCESS_TOKEN must be set in .env\n" +
    "    These point to the Render algo-trading-api app that vends fresh tokens."
  );
  process.exit(1);
}

// ─── Instruments by segment ───────────────────────────────────────────────────

interface Instrument {
  exchangeSegment: string;
  securityId: string;
  label: string;
}

const INSTRUMENTS: Instrument[] = [
  // ── Indices (IDX_I) ─────────────────────────────────────────────────────
  { exchangeSegment: "IDX_I",        securityId: "13",       label: "NIFTY 50"              },
  { exchangeSegment: "IDX_I",        securityId: "25",       label: "BANK NIFTY"            },
  { exchangeSegment: "IDX_I",        securityId: "51",       label: "SENSEX"                },
  { exchangeSegment: "IDX_I",        securityId: "442",      label: "NIFTY IT"              },
  { exchangeSegment: "IDX_I",        securityId: "11532",    label: "NIFTY MIDCAP 50"       },

  // ── NSE Equity (NSE_EQ) ─────────────────────────────────────────────────
  { exchangeSegment: "NSE_EQ",       securityId: "1333",     label: "HDFC Bank (NSE)"       },
  { exchangeSegment: "NSE_EQ",       securityId: "11536",    label: "RELIANCE (NSE)"        },
  { exchangeSegment: "NSE_EQ",       securityId: "11630",    label: "TCS (NSE)"             },
  { exchangeSegment: "NSE_EQ",       securityId: "3045",     label: "INFOSYS (NSE)"         },
  { exchangeSegment: "NSE_EQ",       securityId: "4963",     label: "ICICI Bank (NSE)"      },

  // ── BSE Equity (BSE_EQ) ─────────────────────────────────────────────────
  { exchangeSegment: "BSE_EQ",       securityId: "500325",   label: "RELIANCE (BSE)"        },
  { exchangeSegment: "BSE_EQ",       securityId: "532540",   label: "TCS (BSE)"             },

  // ── NSE F&O — options + futures (NSE_FNO) ───────────────────────────────
  { exchangeSegment: "NSE_FNO",      securityId: "35003",    label: "NIFTY CE (FNO)"        },
  { exchangeSegment: "NSE_FNO",      securityId: "35004",    label: "NIFTY PE (FNO)"        },
  { exchangeSegment: "NSE_FNO",      securityId: "35714",    label: "BANKNIFTY CE (FNO)"    },
  { exchangeSegment: "NSE_FNO",      securityId: "35715",    label: "BANKNIFTY PE (FNO)"    },
  { exchangeSegment: "NSE_FNO",      securityId: "33490",    label: "NIFTY FUT (near)"      },
  { exchangeSegment: "NSE_FNO",      securityId: "14436",    label: "RELIANCE FUT"          },

  // ── BSE F&O (BSE_FNO) ──────────────────────────────────────────────────
  { exchangeSegment: "BSE_FNO",      securityId: "1145960",  label: "SENSEX FUT (BSE)"      },

  // ── MCX Commodity (MCX_COMM) ────────────────────────────────────────────
  { exchangeSegment: "MCX_COMM",     securityId: "429120",   label: "GOLD (MCX)"            },
  { exchangeSegment: "MCX_COMM",     securityId: "430656",   label: "SILVER (MCX)"          },
  { exchangeSegment: "MCX_COMM",     securityId: "431952",   label: "CRUDEOIL (MCX)"        },
  { exchangeSegment: "MCX_COMM",     securityId: "427259",   label: "COPPER (MCX)"          },

  // ── NSE Currency (NSE_CURRENCY) ─────────────────────────────────────────
  { exchangeSegment: "NSE_CURRENCY", securityId: "1",        label: "USDINR (NSE)"          },
  { exchangeSegment: "NSE_CURRENCY", securityId: "2",        label: "EURINR (NSE)"          },
];

// Build stored subscriptions for the SDK's binary packet parser
const storedSubscriptions: StoredSubscription[] = INSTRUMENTS.map((inst) => ({
  exchangeSegment: inst.exchangeSegment as StoredSubscription["exchangeSegment"],
  securityId: inst.securityId,
  mode: "quote" as const,
}));

// ─── State ───────────────────────────────────────────────────────────────────

interface ScripStats {
  tickCount: number;
  lastLtp?: number;
  lastTickAt?: string;
  lastType?: string;
}

const stats    = new Map<string, ScripStats>();
const labelMap = new Map<string, string>();
const allTicks: Array<Record<string, unknown>> = [];

for (const inst of INSTRUMENTS) {
  const key = `${inst.exchangeSegment}:${inst.securityId}`;
  stats.set(key, { tickCount: 0 });
  labelMap.set(key, inst.label);
}

// ─── Tick handler ─────────────────────────────────────────────────────────────

function onTick(tick: MarketFeedEvent): void {
  const key   = `${tick.exchangeSegment}:${tick.securityId}`;
  const label = labelMap.get(key) ?? key;
  const now   = new Date().toISOString();

  const s = stats.get(key) ?? { tickCount: 0 };
  s.tickCount++;
  s.lastTickAt = now;
  s.lastType   = tick.type;
  if ("ltp" in tick && typeof tick.ltp === "number") s.lastLtp = tick.ltp;
  stats.set(key, s);

  const parts: string[] = [
    `[${now}]`,
    `[${tick.type.toUpperCase().padEnd(10)}]`,
    label.padEnd(26),
    tick.exchangeSegment.padEnd(15),
  ];
  if ("ltp"           in tick && typeof tick.ltp           === "number") parts.push(`LTP=${(tick.ltp           as number).toFixed(2)}`);
  if ("ltt"           in tick && typeof tick.ltt           === "number") parts.push(`LTT=${new Date((tick.ltt as number) * 1000).toTimeString().slice(0, 8)}`);
  if ("volume"        in tick && typeof tick.volume        === "number") parts.push(`VOL=${(tick.volume        as number).toLocaleString("en-IN")}`);
  if ("dayHigh"       in tick && typeof tick.dayHigh       === "number") parts.push(`H=${(tick.dayHigh as number).toFixed(2)}  L=${(tick as { dayLow: number }).dayLow.toFixed(2)}`);
  if ("openInterest"  in tick && typeof tick.openInterest  === "number" && (tick.openInterest as number) > 0)
    parts.push(`OI=${(tick.openInterest as number).toLocaleString("en-IN")}`);
  if ("previousClose" in tick && typeof tick.previousClose === "number") parts.push(`prevClose=${(tick.previousClose as number).toFixed(2)}`);
  if (tick.type === "disconnect")
    parts.push(`⚠️  DISCONNECT code=${(tick as { reasonCode?: number }).reasonCode}`);

  console.log(parts.join("  "));

  const { raw: _raw, ...clean } = tick as MarketFeedEvent & { raw?: unknown };
  allTicks.push({ ...clean, label, capturedAt: now });
}

// ─── Summary ─────────────────────────────────────────────────────────────────

function printSummary(): void {
  const HR = "═".repeat(108);
  console.log(`\n${HR}`);
  console.log("  LIVE FEED SUMMARY — tick-by-tick across all segments");
  console.log(HR);

  const bySegment = new Map<string, Array<{ key: string; stat: ScripStats }>>();
  for (const [key, stat] of stats) {
    const seg = key.split(":")[0];
    if (!bySegment.has(seg)) bySegment.set(seg, []);
    bySegment.get(seg)!.push({ key, stat });
  }

  let totalTicks = 0;
  for (const [segment, entries] of bySegment) {
    console.log(`\n  ▶ ${segment}`);
    console.log(`  ${"Instrument".padEnd(28)} ${"Ticks".padStart(8)} ${"Last LTP".padStart(14)} ${"Last Type".padEnd(14)} Last Tick At`);
    console.log(`  ${"─".repeat(95)}`);
    for (const { key, stat } of entries) {
      const label = (labelMap.get(key) ?? key).padEnd(28);
      const ticks = String(stat.tickCount).padStart(8);
      const ltp   = stat.lastLtp != null ? stat.lastLtp.toFixed(2).padStart(14) : "           N/A";
      const type  = (stat.lastType ?? "—").padEnd(14);
      const when  = stat.lastTickAt ?? "—";
      console.log(`  ${label} ${ticks} ${ltp} ${type} ${when}`);
      totalTicks += stat.tickCount;
    }
  }

  console.log(`\n${HR}`);
  console.log(`  Total ticks      : ${totalTicks}`);
  console.log(`  Instruments      : ${INSTRUMENTS.length}`);
  console.log(`  Active (≥1 tick) : ${[...stats.values()].filter((s) => s.tickCount > 0).length}`);
  console.log(`  Log file         : ${LOG_FILE}`);
  console.log(`${HR}\n`);
}

// ─── Main ─────────────────────────────────────────────────────────────────────

async function main(): Promise<void> {
  // ── Step 1: Fetch a fresh token from the Render token service ─────────────
  console.log("🔑  Fetching access token from Render token service...");
  console.log(`    URL: ${TOKEN_SERVICE_ORIGIN}/auth/dhan/token`);

  const client = await DhanClient.fromTokenEndpoint({
    endpointBaseUrl: TOKEN_SERVICE_ORIGIN,
    bearerToken: TOKEN_BEARER,
  });

  const config    = client.getConfig();
  const token     = config.token ?? "";
  const clientId  = config.clientId || FALLBACK_CLIENT_ID;

  if (!token) {
    console.error("❌  Token service returned an empty token.");
    process.exit(1);
  }

  // Decode and display token metadata (no secrets)
  const payload   = JSON.parse(Buffer.from(token.split(".")[1], "base64").toString()) as {
    exp: number; iat: number; dhanClientId?: string;
  };
  const issuedAt  = new Date(payload.iat * 1000).toISOString();
  const expiresAt = new Date(payload.exp * 1000).toISOString();
  const isExpired = Date.now() / 1000 > payload.exp;

  console.log(`    ✅  Token obtained`);
  console.log(`    Issued  : ${issuedAt}`);
  console.log(`    Expires : ${expiresAt}${isExpired ? "  ⚠️  ALREADY EXPIRED" : ""}`);
  console.log(`    ClientId: ${clientId}\n`);

  if (isExpired) {
    console.error("❌  Token is already expired. The Render service may need attention.");
    process.exit(1);
  }

  // ── Step 2: Build WebSocket URL with fresh token ──────────────────────────
  const wsUrl = `wss://api-feed.dhan.co?version=2&token=${encodeURIComponent(token)}&clientId=${encodeURIComponent(clientId)}&authType=2`;

  console.log("═".repeat(108));
  console.log("  DhanHQ Live Market Feed — All Segments WebSocket Real API Test");
  console.log(`  Duration    : ${DURATION_SECONDS}s`);
  console.log(`  Feed mode   : ${FEED_MODE_NAME}  (RequestCode=${FEED_REQUEST_CODE} — LTP + OHLCV per tick)`);
  console.log(`  Instruments : ${INSTRUMENTS.length} across IDX_I · NSE_EQ · BSE_EQ · NSE_FNO · BSE_FNO · MCX_COMM · NSE_CURRENCY`);
  console.log(`  WS Endpoint : ${wsUrl.slice(0, 72)}...`);
  console.log("═".repeat(108) + "\n");

  // ── Step 3: Connect and stream ────────────────────────────────────────────
  await new Promise<void>((resolve, reject) => {
    const ws = new WebSocket(wsUrl);
    let subscribed     = false;
    let elapsed        = 0;
    let heartbeat: NodeJS.Timeout;
    let shutdownTimer: NodeJS.Timeout;
    let done           = false;

    function shutdown(reason: string): void {
      if (done) return;
      done = true;
      clearInterval(heartbeat);
      clearTimeout(shutdownTimer);
      console.log(`\n⏹  Shutting down: ${reason}`);
      try { ws.close(); } catch (_) { /* ignore */ }

      printSummary();

      fs.writeFileSync(
        LOG_FILE,
        JSON.stringify(
          {
            capturedAt:      new Date().toISOString(),
            durationSeconds: DURATION_SECONDS,
            feedMode:        FEED_MODE_NAME,
            feedRequestCode: FEED_REQUEST_CODE,
            tokenIssuedAt:   issuedAt,
            tokenExpiresAt:  expiresAt,
            instruments:     INSTRUMENTS,
            totalTicks:      allTicks.length,
            ticks:           allTicks,
          },
          null,
          2,
        ),
      );
      console.log(`📄  Full JSON tick log → ${LOG_FILE}\n`);
      resolve();
    }

    ws.on("open", () => {
      console.log("✅  WebSocket OPEN\n");

      // Send subscription in batches of 100 (Dhan protocol limit per message)
      const batchSize = 100;
      for (let i = 0; i < INSTRUMENTS.length; i += batchSize) {
        const batch = INSTRUMENTS.slice(i, i + batchSize);
        ws.send(
          JSON.stringify({
            RequestCode:     FEED_REQUEST_CODE,
            InstrumentCount: batch.length,
            InstrumentList:  batch.map((inst) => ({
              ExchangeSegment: inst.exchangeSegment,
              SecurityId:      inst.securityId,
            })),
          }),
        );
        console.log(
          `  📡 Subscribed batch [${i + 1}–${Math.min(i + batchSize, INSTRUMENTS.length)}]:\n` +
          `     ${batch.map((b) => b.label).join(", ")}`
        );
      }

      subscribed = true;
      console.log(`\n  ✅ All ${INSTRUMENTS.length} instruments subscribed — ticks incoming...\n`);

      // Progress heartbeat every 10 s
      heartbeat = setInterval(() => {
        elapsed += 10;
        const total   = [...stats.values()].reduce((n, s) => n + s.tickCount, 0);
        const active  = [...stats.values()].filter((s) => s.tickCount > 0).length;
        process.stdout.write(
          `\n  ⏱  [${String(elapsed).padStart(3)}s/${DURATION_SECONDS}s]  ` +
          `ticks=${total}  active=${active}/${INSTRUMENTS.length}  remaining=${DURATION_SECONDS - elapsed}s\n\n`
        );
      }, 10_000);

      // Auto-shutdown after capture window
      shutdownTimer = setTimeout(() => shutdown("capture window complete"), DURATION_SECONDS * 1_000);
    });

    ws.on("message", (data: WebSocket.RawData) => {
      let buf: Buffer;
      if      (Buffer.isBuffer(data))          buf = data;
      else if (data instanceof ArrayBuffer)    buf = Buffer.from(data);
      else if (Array.isArray(data))            buf = Buffer.concat(data as Buffer[]);
      else                                     buf = Buffer.from(String(data as unknown));

      const packets = splitPackets(buf);
      for (const packet of packets) {
        const tick = parseMarketFeedPacket(packet, storedSubscriptions);
        if (tick) {
          onTick(tick);
        } else {
          // Log unexpected packet codes for debugging
          const code = buf.length > 0 ? buf.readUInt8(0) : -1;
          if (code > 0 && code !== 11) { // 11 = server CONNECT ack
            console.log(`  [RAW] code=${code} len=${buf.length} hex=${buf.slice(0, 16).toString("hex")}`);
          }
        }
      }
    });

    ws.on("ping", () => {
      console.log(`  🏓 PING (${new Date().toTimeString().slice(0, 8)}) — pong auto-sent`);
    });

    ws.on("error", (err: Error) => {
      console.error(`\n❌  WebSocket ERROR: ${err.message}`);
      if (!done) reject(err);
    });

    ws.on("close", (code: number, reason: Buffer) => {
      const msg = reason?.length ? reason.toString() : "(no reason)";
      console.log(`\n🔌  WebSocket CLOSED  code=${code}  reason=${msg}`);
      if (!done && subscribed) {
        shutdown("server closed the connection");
      } else if (!done) {
        reject(new Error(`Connection closed before subscription: code=${code} reason=${msg}`));
      }
    });
  });
}

main().catch((err: unknown) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
