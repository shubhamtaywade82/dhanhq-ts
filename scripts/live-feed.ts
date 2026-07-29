import dotenv from "dotenv";
import { URL } from "node:url";
import { DhanClient } from "../src";

dotenv.config({ path: ".env" });

const serviceUrl = process.env.DHAN_TOKEN_SERVICE_URL?.trim();
const bearerToken = process.env.DHAN_TOKEN_ACCESS_TOKEN?.trim();
if (!serviceUrl) throw new Error("DHAN_TOKEN_SERVICE_URL is not set");
if (!bearerToken) throw new Error("DHAN_TOKEN_ACCESS_TOKEN is not set");

const parsed = new URL(serviceUrl);
const endpointBaseUrl = `${parsed.protocol}//${parsed.host}`;

const RUN_DURATION_MS = 60_000;
let tickCount = 0;
let startTime = 0;

interface InstrumentDef {
  exchangeSegment: string;
  securityId: string;
  label: string;
}

async function main() {
  console.log("\nConnecting to auth provider...");
  const client = await DhanClient.fromTokenEndpoint({
    endpointBaseUrl,
    bearerToken: bearerToken!,
  });
  console.log(`Authenticated: ${client.getConfig().clientId}\n`);

  // -----------------------------------------------------------------------
  //  Build subscription list across all segments
  // -----------------------------------------------------------------------
  const subs: InstrumentDef[] = [
    { exchangeSegment: "IDX_I", securityId: "13", label: "NIFTY 50" },
    { exchangeSegment: "IDX_I", securityId: "25", label: "BANK NIFTY" },
    { exchangeSegment: "IDX_I", securityId: "27", label: "FIN NIFTY" },
    { exchangeSegment: "IDX_I", securityId: "51", label: "SENSEX" },
    { exchangeSegment: "IDX_I", securityId: "442", label: "MIDCP NIFTY" },
    { exchangeSegment: "NSE_EQ", securityId: "2885", label: "RELIANCE" },
    { exchangeSegment: "NSE_EQ", securityId: "1333", label: "HDFCBANK" },
    { exchangeSegment: "NSE_EQ", securityId: "11536", label: "TATAMOTORS" },
    { exchangeSegment: "NSE_EQ", securityId: "3405", label: "ICICIBANK" },
    { exchangeSegment: "NSE_EQ", securityId: "3501", label: "TCS" },
    { exchangeSegment: "NSE_EQ", securityId: "2951", label: "SBIN" },
  ];

  // Resolve futures from instrument CSV
  console.log("Resolving NSE_FNO & MCX_COMM contracts...");
  try {
    const allFno = await client.instruments.bySegment("NSE_FNO");
    const now = new Date();
    for (const und of ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"]) {
      const contracts = allFno
        .filter((i) => i.underlyingSymbol === und && i.instrument === "FUTIDX" && i.expiryDate && new Date(i.expiryDate) >= now)
        .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
      if (contracts.length > 0) {
        subs.push({ exchangeSegment: "NSE_FNO", securityId: contracts[0].securityId, label: `${und} FUT ${contracts[0].expiryDate}` });
      }
    }
  } catch (e: any) { console.error("  futures lookup error:", e.message); }

  // NIFTY Options — current week from chain
  try {
    const exp = await client.optionChain.expiryList({ underlyingScrip: 13, underlyingSeg: "IDX_I" });
    const expiryList = ((exp as any)?.data ?? []) as string[];
    if (expiryList.length > 0) {
      const weekExp = expiryList[0];
      const chain = await client.optionChain.fetchNormalized({ underlyingScrip: 13, underlyingSeg: "IDX_I", expiry: weekExp });
      const spot = chain.lastPrice ?? 0;
      if (spot > 0 && chain.strikes.length > 0) {
        let atm = 0;
        for (let i = 0; i < chain.strikes.length; i++) {
          if (chain.strikes[i].strike >= spot) { atm = i; break; }
        }
        for (const idx of [Math.max(atm - 2, 0), atm, Math.min(atm + 2, chain.strikes.length - 1)]) {
          const s = chain.strikes[idx];
          if (s.call?.security_id) subs.push({ exchangeSegment: "NSE_FNO", securityId: s.call.security_id, label: `NIFTY ${s.strike} CE ${weekExp}` });
          if (s.put?.security_id) subs.push({ exchangeSegment: "NSE_FNO", securityId: s.put.security_id, label: `NIFTY ${s.strike} PE ${weekExp}` });
        }
      }
    }
  } catch (e: any) { console.error("  option chain error:", e.message); }

  // MCX Gold futures
  try {
    const allMcx = await client.instruments.bySegment("MCX_COMM");
    const now = new Date();
    const gold = allMcx
      .filter((i) => i.underlyingSymbol === "GOLD" && i.instrument === "FUTCOM" && i.expiryDate && new Date(i.expiryDate) >= now)
      .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
    if (gold.length > 0) subs.push({ exchangeSegment: "MCX_COMM", securityId: gold[0].securityId, label: `GOLD FUT ${gold[0].expiryDate}` });
  } catch (e: any) { console.error("  mcx lookup error:", e.message); }

  // -----------------------------------------------------------------------
  //  Print plan
  // -----------------------------------------------------------------------
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${subs.length} instruments across all segments`);
  console.log(`${"=".repeat(60)}`);
  const bySeg = new Map<string, InstrumentDef[]>();
  for (const s of subs) { if (!bySeg.has(s.exchangeSegment)) bySeg.set(s.exchangeSegment, []); bySeg.get(s.exchangeSegment)!.push(s); }
  for (const [seg, list] of bySeg) {
    console.log(`  ${seg} (${list.length}):`);
    for (const s of list) console.log(`    • ${String(s.securityId).padEnd(8)} ${s.label}`);
  }

  // -----------------------------------------------------------------------
  //  MONKEY-PATCH: log what the market WS actually sends
  // -----------------------------------------------------------------------
  const origSend = (client.ws.market as any).send.bind(client.ws.market);
  (client.ws.market as any).send = function(payload: any) {
    console.log("  [WS-SEND]", typeof payload === "string" ? payload.slice(0, 300) : "(binary)");
    origSend(payload);
  };

  // -----------------------------------------------------------------------
  //  Subscribe BEFORE connect so subs queue up
  // -----------------------------------------------------------------------
  client.ws.market.subscribe(subs.map((s) => ({ exchangeSegment: s.exchangeSegment, securityId: s.securityId })));
  console.log(`\n${subs.length} subscriptions queued`);

  await client.ws.connect();
  console.log("  connect() resolved");

  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("open timeout")), 15_000);
    client.ws.market.once("open", () => { clearTimeout(t); console.log("  [WS-MARKET] open event"); resolve(); });
  });
  console.log(`Connected\n`);

  // -----------------------------------------------------------------------
  //  Tick handler
  // -----------------------------------------------------------------------
  const labelMap = new Map(subs.map((s) => [`${s.exchangeSegment}:${s.securityId}`, s.label]));

  client.ws.market.on("tick", (event: any) => {
    tickCount++;
    const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
    const seg = event.exchangeSegment ?? "?";
    const sid = event.securityId ?? "?";
    const label = labelMap.get(`${seg}:${sid}`) ?? `${seg}:${sid}`;
    const type = (event.type ?? "?").padEnd(10);

    let extra = "";
    if (event.ltp !== undefined) extra += ` ltp=${event.ltp}`;
    if (event.volume !== undefined) extra += ` vol=${event.volume}`;
    if (event.openInterest !== undefined && event.openInterest > 0) extra += ` oi=${event.openInterest}`;
    if (event.dayHigh !== undefined) extra += ` h=${event.dayHigh}`;
    if (event.dayLow !== undefined) extra += ` l=${event.dayLow}`;
    if (event.dayOpen !== undefined) extra += ` o=${event.dayOpen}`;
    if (event.dayClose !== undefined) extra += ` pc=${event.dayClose}`;

    console.log(`[${elapsed}s] #${tickCount.toString().padEnd(3)} ${type} ${seg.padEnd(10)} ${sid.padEnd(8)} ${label.padEnd(35)}${extra}`);
  });

  client.ws.market.on("error", (e: any) => console.log("  [WS-ERROR]", typeof e === "object" ? e.message ?? JSON.stringify(e) : e));
  client.ws.market.on("close", () => console.log("  [WS-CLOSE]"));
  client.ws.market.on("disconnect", (e: any) => console.log("  [WS-DISCONNECT]", JSON.stringify(e)));

  // -----------------------------------------------------------------------
  //  Collect for 60s
  // -----------------------------------------------------------------------
  startTime = Date.now();
  console.log(`Collecting ticks for ${RUN_DURATION_MS / 1000}s...\n`);

  await new Promise<void>((resolve) => {
    const interval = setInterval(() => {
      if (Date.now() - startTime >= RUN_DURATION_MS) {
        clearInterval(interval);
        resolve();
      }
    }, 1000);
  });

  const elapsed = ((Date.now() - startTime) / 1000).toFixed(1);
  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${elapsed}s — ${tickCount} ticks (${(tickCount / Number(elapsed)).toFixed(0)} ticks/sec)`);
  console.log(`${"=".repeat(60)}\n`);

  client.ws.disconnect();
  process.exit(0);
}

main().catch((err) => {
  console.error("\nFatal:", err);
  process.exit(1);
});
