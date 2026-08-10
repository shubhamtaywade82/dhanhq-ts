import dotenv from "dotenv";
import { URL } from "node:url";
import { DhanClient } from "../src";

dotenv.config({ path: ".env" });

const parsed = new URL(process.env.DHAN_TOKEN_SERVICE_URL!.trim());
const endpointBaseUrl = `${parsed.protocol}//${parsed.host}`;
const bearerToken = process.env.DHAN_TOKEN_ACCESS_TOKEN!.trim();

const RUN_DURATION_MS = 60_000;

(async () => {
  const client = await DhanClient.fromTokenEndpoint({ endpointBaseUrl, bearerToken });
  console.log(`Dhan client ready — ${client.getConfig().clientId}\n`);

  // ---------- static subscriptions ----------
  const subs: { seg: string; sid: string; label: string }[] = [
    { seg: "IDX_I",    sid: "13",    label: "NIFTY 50" },
    { seg: "IDX_I",    sid: "25",    label: "BANK NIFTY" },
    { seg: "IDX_I",    sid: "27",    label: "FIN NIFTY" },
    { seg: "IDX_I",    sid: "51",    label: "SENSEX" },
    { seg: "IDX_I",    sid: "442",   label: "MIDCP NIFTY" },
    { seg: "NSE_EQ",   sid: "2885",  label: "RELIANCE" },
    { seg: "NSE_EQ",   sid: "1333",  label: "HDFCBANK" },
    { seg: "NSE_EQ",   sid: "11536", label: "TATAMOTORS" },
    { seg: "NSE_EQ",   sid: "3405",  label: "ICICIBANK" },
    { seg: "NSE_EQ",   sid: "3501",  label: "TCS" },
    { seg: "NSE_EQ",   sid: "2951",  label: "SBIN" },
  ];

  // ---------- resolve dynamic contracts ----------
  console.log("Resolving live contracts...\n");

  const addIf = (seg: string, sid: string | number, label: string) =>
    subs.push({ seg, sid: String(sid), label });

  // NSE F&O futures
  const fno = await client.instruments.bySegment("NSE_FNO");
  const now = new Date();
  for (const und of ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"]) {
    const cs = fno.filter(i => i.underlyingSymbol === und && i.instrument === "FUTIDX" && i.expiryDate && new Date(i.expiryDate) >= now)
      .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
    if (cs.length) addIf("NSE_FNO", cs[0].securityId, `${und} FUT ${cs[0].expiryDate}`);
  }

  // NIFTY ATM options
  const expRes = await client.optionChain.expiryList({ underlyingScrip: 13, underlyingSeg: "IDX_I" });
  const exps = ((expRes as any)?.data ?? []) as string[];
  if (exps.length) {
    const chain = await client.optionChain.fetchNormalized({ underlyingScrip: 13, underlyingSeg: "IDX_I", expiry: exps[0] });
    const spot = chain.lastPrice ?? 0;
    if (spot) {
      let atm = chain.strikes.findIndex(s => s.strike >= spot);
      if (atm < 0) atm = Math.floor(chain.strikes.length / 2);
      for (const idx of [Math.max(atm - 2, 0), atm, Math.min(atm + 2, chain.strikes.length - 1)]) {
        const s = chain.strikes[idx];
        if (s.call?.security_id) addIf("NSE_FNO", s.call.security_id, `NIFTY ${s.strike} CE ${exps[0]}`);
        if (s.put?.security_id)  addIf("NSE_FNO", s.put.security_id,  `NIFTY ${s.strike} PE ${exps[0]}`);
      }
    }
  }

  // MCX gold
  const mcx = await client.instruments.bySegment("MCX_COMM");
  const gold = mcx.filter(i => i.underlyingSymbol === "GOLD" && i.instrument === "FUTCOM" && i.expiryDate && new Date(i.expiryDate) >= now)
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
  if (gold.length) addIf("MCX_COMM", gold[0].securityId, `GOLD FUT ${gold[0].expiryDate}`);

  // ---------- print plan ----------
  console.log(`${"=".repeat(60)}`);
  console.log(`  ${subs.length} subscriptions`);
  console.log(`${"=".repeat(60)}`);
  for (const s of subs) console.log(`  ${s.seg.padEnd(10)} ${s.sid.padEnd(8)} ${s.label}`);
  console.log();

  // ---------- WS ----------
  client.ws.market.subscribe(subs.map(s => ({ exchangeSegment: s.seg, securityId: s.sid })));
  await client.ws.connect();
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("WS open timeout")), 15_000);
    client.ws.market.once("open", () => { clearTimeout(t); resolve(); });
  });

  const t0 = Date.now();
  let ticks = 0;
  const labelOf = (seg: string, sid: string) =>
    subs.find(s => s.seg === seg && s.sid === sid)?.label ?? `${seg}:${sid}`;

  client.ws.market.on("tick", (ev: any) => {
    ticks++;
    const seg = ev.exchangeSegment ?? "", sid = String(ev.securityId ?? ""), type = (ev.type ?? "").padEnd(8);
    const els = ((Date.now() - t0) / 1000).toFixed(1);
    const parts = [`ltp=${ev.ltp}`];
    if (ev.volume) parts.push(`vol=${ev.volume}`);
    if (ev.openInterest) parts.push(`oi=${ev.openInterest}`);
    if (ev.dayHigh) parts.push(`h=${ev.dayHigh}`);
    if (ev.dayLow) parts.push(`l=${ev.dayLow}`);
    if (ev.dayOpen) parts.push(`o=${ev.dayOpen}`);

    if (ticks <= 5 || ticks % 100 === 0)
      console.log(`[${els}s] #${ticks}  ${type} ${seg.padEnd(10)} ${sid.padEnd(8)} ${labelOf(seg, sid).padEnd(35)}  ${parts.join(" ")}`);
  });

  console.log(`Collecting for ${RUN_DURATION_MS / 1000}s...\n`);
  await new Promise(r => setTimeout(r, RUN_DURATION_MS));

  console.log(`\n${"=".repeat(60)}`);
  console.log(`  ${((Date.now() - t0) / 1000).toFixed(1)}s  —  ${ticks} ticks`);
  console.log(`${"=".repeat(60)}`);

  client.ws.disconnect();
})().catch(e => { console.error("FATAL:", e); process.exit(1); });
