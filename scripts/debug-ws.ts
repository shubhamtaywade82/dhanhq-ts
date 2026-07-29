import dotenv from "dotenv";
import { URL } from "node:url";
import { DhanClient } from "../src";

dotenv.config({ path: ".env" });

const parsed = new URL(process.env.DHAN_TOKEN_SERVICE_URL!.trim());
const base = `${parsed.protocol}//${parsed.host}`;

(async () => {
  const client = await DhanClient.fromTokenEndpoint({ endpointBaseUrl: base, bearerToken: process.env.DHAN_TOKEN_ACCESS_TOKEN!.trim()! });
  console.log("Auth OK");

  // Do REST calls FIRST (like live-feed), THEN subscribe/connect
  console.log("Doing REST calls first...");
  const allFno = await client.instruments.bySegment("NSE_FNO");
  console.log(`  F&O CSV: ${allFno.length} contracts`);

  const exp = await client.optionChain.expiryList({ underlyingScrip: 13, underlyingSeg: "IDX_I" });
  const expiryList = ((exp as any)?.data ?? []) as string[];
  console.log(`  Expiry list: ${expiryList.length} dates`);

  if (expiryList.length > 0) {
    const chain = await client.optionChain.fetchNormalized({ underlyingScrip: 13, underlyingSeg: "IDX_I", expiry: expiryList[0] });
    console.log(`  Option chain: ${chain.strikes.length} strikes`);
  }

  const allMcx = await client.instruments.bySegment("MCX_COMM");
  console.log(`  MCX CSV: ${allMcx.length} contracts`);
  console.log("REST calls done\n");

  // Now subscribe and connect (just 3 known-good instruments)
  const subs = [
    { exchangeSegment: "NSE_EQ", securityId: "1333" },
    { exchangeSegment: "NSE_EQ", securityId: "2885" },
    { exchangeSegment: "IDX_I", securityId: "13" },
  ];

  client.ws.market.subscribe(subs);
  console.log(`Queued ${subs.length} subs`);

  await client.ws.connect();
  await new Promise<void>((resolve, reject) => {
    const t = setTimeout(() => reject(new Error("open timeout")), 15_000);
    client.ws.market.once("open", () => { clearTimeout(t); resolve(); });
  });
  console.log("WS open, listening...");

  let count = 0;
  client.ws.market.on("tick", (event: any) => {
    count++;
    if (count <= 3 || count % 50 === 0) {
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
