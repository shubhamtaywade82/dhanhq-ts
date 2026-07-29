import dotenv from "dotenv";
import { URL } from "node:url";
import { DhanClient } from "../src";

dotenv.config({ path: ".env" });

const parsed = new URL(process.env.DHAN_TOKEN_SERVICE_URL!.trim());
const base = `${parsed.protocol}//${parsed.host}`;

(async () => {
  const client = await DhanClient.fromTokenEndpoint({ endpointBaseUrl: base, bearerToken: process.env.DHAN_TOKEN_ACCESS_TOKEN!.trim()! });
  console.log("Auth OK");

  // EXACT SAME REST calls as live-feed
  console.log("Resolving NSE_FNO...");
  const allFno = await client.instruments.bySegment("NSE_FNO");
  const now = new Date();
  const futures: { seg: string; sid: string; label: string }[] = [];

  for (const und of ["NIFTY", "BANKNIFTY", "FINNIFTY", "MIDCPNIFTY"]) {
    const contracts = allFno
      .filter((i) => i.underlyingSymbol === und && i.instrument === "FUTIDX" && i.expiryDate && new Date(i.expiryDate) >= now)
      .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
    if (contracts.length > 0) {
      futures.push({ seg: "NSE_FNO", sid: contracts[0].securityId, label: `${und} FUT ${contracts[0].expiryDate}` });
    }
  }

  console.log("Resolving option chain...");
  const exp = await client.optionChain.expiryList({ underlyingScrip: 13, underlyingSeg: "IDX_I" });
  const expiryList = ((exp as any)?.data ?? []) as string[];
  const options: { seg: string; sid: string; label: string }[] = [];
  if (expiryList.length > 0) {
    const chain = await client.optionChain.fetchNormalized({ underlyingScrip: 13, underlyingSeg: "IDX_I", expiry: expiryList[0] });
    const spot = chain.lastPrice ?? 0;
    if (spot > 0 && chain.strikes.length > 0) {
      let atm = 0;
      for (let i = 0; i < chain.strikes.length; i++) {
        if (chain.strikes[i].strike >= spot) { atm = i; break; }
      }
      for (const idx of [Math.max(atm - 2, 0), atm, Math.min(atm + 2, chain.strikes.length - 1)]) {
        const s = chain.strikes[idx];
        if (s.call?.security_id) options.push({ seg: "NSE_FNO", sid: s.call.security_id, label: `NIFTY ${s.strike} CE ${expiryList[0]}` });
        if (s.put?.security_id) options.push({ seg: "NSE_FNO", sid: s.put.security_id, label: `NIFTY ${s.strike} PE ${expiryList[0]}` });
      }
    }
  }

  console.log("Resolving MCX...");
  const allMcx = await client.instruments.bySegment("MCX_COMM");
  const gold = allMcx
    .filter((i) => i.underlyingSymbol === "GOLD" && i.instrument === "FUTCOM" && i.expiryDate && new Date(i.expiryDate) >= now)
    .sort((a, b) => new Date(a.expiryDate!).getTime() - new Date(b.expiryDate!).getTime());
  const mcx: { seg: string; sid: string; label: string }[] = [];
  if (gold.length > 0) mcx.push({ seg: "MCX_COMM", sid: gold[0].securityId, label: `GOLD FUT ${gold[0].expiryDate}` });

  // Build full subscription list (same as live-feed)
  const allSubs = [
    { exchangeSegment: "IDX_I", securityId: "13" },
    { exchangeSegment: "IDX_I", securityId: "25" },
    { exchangeSegment: "IDX_I", securityId: "27" },
    { exchangeSegment: "IDX_I", securityId: "51" },
    { exchangeSegment: "IDX_I", securityId: "442" },
    { exchangeSegment: "NSE_EQ", securityId: "2885" },
    { exchangeSegment: "NSE_EQ", securityId: "1333" },
    { exchangeSegment: "NSE_EQ", securityId: "11536" },
    { exchangeSegment: "NSE_EQ", securityId: "3405" },
    { exchangeSegment: "NSE_EQ", securityId: "3501" },
    { exchangeSegment: "NSE_EQ", securityId: "2951" },
    ...futures.map(f => ({ exchangeSegment: f.seg, securityId: f.sid })),
    ...options.map(o => ({ exchangeSegment: o.seg, securityId: o.sid })),
    ...mcx.map(m => ({ exchangeSegment: m.seg, securityId: m.sid })),
  ];

  console.log(`\nSubscribing to ${allSubs.length} instruments (resolved from REST):`);
  for (const s of allSubs) console.log(`  ${s.exchangeSegment.padEnd(10)} ${s.securityId.padEnd(8)}`);

  // Intercept the WS send to see what's being transmitted
  const origMarketConnect = client.ws.market.connect.bind(client.ws.market);
  client.ws.market.connect = async function() {
    // Wrap webSocketFactory to intercept send
    const origFactory = (client.ws.market as any).config?.webSocketFactory;
    await origMarketConnect();
    const ws = (client.ws.market as any).connection;
    if (ws) {
      const origWsSend = ws.send.bind(ws);
      ws.send = function(data: any) {
        console.log("  [WS-SEND]", typeof data === "string" ? data.slice(0, 200) : `(${data.length} bytes)`);
        return origWsSend(data);
      };
    }
  };

  client.ws.market.subscribe(allSubs);

  await client.ws.connect();
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("open timeout")), 15_000);
    client.ws.market.once("open", () => { clearTimeout(t); resolve(); });
  });
  console.log("WS open");

  let count = 0;
  client.ws.market.on("tick", (event: any) => {
    count++;
    if (count <= 5 || count % 100 === 0) {
      console.log(`[${count}] ${event.exchangeSegment}:${event.securityId} ltp=${event.ltp}`);
    }
  });
  client.ws.market.on("disconnect", (e: any) => console.log("DISCONNECT:", JSON.stringify(e)));
  client.ws.market.on("error", (e: any) => console.log("ERROR:", e));

  setTimeout(() => {
    console.log(`\nTotal: ${count} ticks in 20s`);
    process.exit(count > 0 ? 0 : 1);
  }, 20_000);
})().catch((e) => { console.error("FAIL:", e.message); process.exit(1); });
