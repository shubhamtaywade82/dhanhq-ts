/**
 * rest-api-live-test.ts
 *
 * Live execution test for all DhanHQ v2 REST API endpoints using a fresh token
 * from the Render token service.
 *
 * Usage:
 *   npx ts-node --compiler-options '{"module":"CommonJS"}' examples/rest-api-live-test.ts
 */

import * as path from "path";
import * as dotenv from "dotenv";
import { DhanClient } from "../src/client/DhanClient";
import {
  IntradayChartsRequest,
  HistoricalChartsRequest,
} from "../src/generated";

dotenv.config({ path: path.join(__dirname, "../.env") });

const TOKEN_SERVICE_ORIGIN = (() => {
  try {
    return new URL(process.env.DHAN_TOKEN_SERVICE_URL ?? "").origin;
  } catch {
    return "";
  }
})();
const TOKEN_BEARER = process.env.DHAN_TOKEN_ACCESS_TOKEN ?? "";

const sleep = (ms: number) => new Promise((res) => setTimeout(res, ms));

interface TestResult {
  module: string;
  endpoint: string;
  status: "PASS" | "FAIL";
  statusCode?: number | string;
  details: string;
}

const results: TestResult[] = [];

async function testEndpoint(
  moduleName: string,
  endpoint: string,
  fn: () => Promise<unknown>,
): Promise<void> {
  await sleep(1200); // Pace requests to respect Dhan rate limits
  try {
    const res = await fn();
    let detailStr = "OK";
    if (res && typeof res === "object") {
      if (Array.isArray(res)) {
        detailStr = `Array(${res.length} items)`;
      } else {
        const keys = Object.keys(res as object);
        detailStr = `Object keys: ${keys.slice(0, 5).join(", ")}${keys.length > 5 ? "..." : ""}`;
      }
    }
    results.push({
      module: moduleName,
      endpoint,
      status: "PASS",
      statusCode: 200,
      details: detailStr,
    });
    console.log(`  ✅  [${moduleName.padEnd(20)}] ${endpoint.padEnd(38)} → PASS (${detailStr})`);
  } catch (err: any) {
    const status = err?.status ?? err?.response?.status ?? "ERR";
    const bodyData = err?.details ?? err?.response?.data ?? err?.data;
    const bodyStr = bodyData ? (typeof bodyData === 'object' ? JSON.stringify(bodyData) : String(bodyData)) : (err?.message ?? String(err));
    results.push({
      module: moduleName,
      endpoint,
      status: "FAIL",
      statusCode: status,
      details: bodyStr,
    });
    console.error(`  ❌  [${moduleName.padEnd(20)}] ${endpoint.padEnd(38)} → FAIL (${status}: ${bodyStr})`);
  }
}

async function main(): Promise<void> {
  console.log("🔑  Fetching access token from Render token service...");
  const client = await DhanClient.fromTokenEndpoint({
    endpointBaseUrl: TOKEN_SERVICE_ORIGIN,
    bearerToken: TOKEN_BEARER,
  });

  const clientId = client.getConfig().clientId;
  console.log(`    ✅ Token ready for clientId: ${clientId}\n`);

  console.log("═".repeat(115));
  console.log("  DhanHQ v2 REST API — Live Endpoint Test Suite");
  console.log("═".repeat(115) + "\n");

  // 1. Funds
  await testEndpoint("Funds", "GET /fundlimit", () =>
    client.funds.getLimit()
  );

  // 2. Positions & Portfolio
  await testEndpoint("Positions", "GET /positions", () =>
    client.positions.list()
  );
  await testEndpoint("Holdings", "GET /holdings", () =>
    client.positions.listHoldings()
  );

  // 3. Orders & Books
  await testEndpoint("Orders", "GET /orders", () =>
    client.orders.list()
  );
  await testEndpoint("ForeverOrders", "GET /forever/orders", () =>
    client.foreverOrders.list()
  );
  await testEndpoint("ConditionalOrders", "GET /alerts/orders", () =>
    client.conditionalTriggers.list()
  );

  // 4. Market Data & Charts
  await testEndpoint("MarketFeed", "POST /marketfeed/ltp", () =>
    client.marketFeed.ltp({ IDX_I: [13], NSE_EQ: [1333] })
  );
  await testEndpoint("MarketFeed", "POST /marketfeed/quote", () =>
    client.marketFeed.quote({ IDX_I: [13], NSE_EQ: [1333] })
  );
  await testEndpoint("Charts", "POST /charts/intraday", () =>
    client.charts.intraday({
      securityId: "1333",
      exchangeSegment: IntradayChartsRequest.exchangeSegment.NSE_EQ,
      instrument: IntradayChartsRequest.instrument.EQUITY,
      interval: IntradayChartsRequest.interval._15,
      fromDate: "2026-07-28",
      toDate: "2026-07-29",
    })
  );
  await testEndpoint("Charts", "POST /charts/historical", () =>
    client.charts.historical({
      securityId: "1333",
      exchangeSegment: HistoricalChartsRequest.exchangeSegment.NSE_EQ,
      instrument: HistoricalChartsRequest.instrument.EQUITY,
      fromDate: "2026-07-01",
      toDate: "2026-07-28",
    })
  );

  // Option chain - fetch expiry list first then option chain
  let firstExpiry = "2026-07-30";
  await testEndpoint("OptionChain", "POST /optionchain/expirylist", async () => {
    const expRes = await client.optionChain.expiryList({
      underlyingScrip: 13,
      underlyingSeg: "IDX_I",
    });
    if (expRes?.data && expRes.data.length > 0) {
      firstExpiry = expRes.data[0];
    }
    return expRes;
  });

  await testEndpoint("OptionChain", "POST /optionchain", () =>
    client.optionChain.fetch({
      underlyingScrip: 13,
      underlyingSeg: "IDX_I",
      expiry: firstExpiry,
    })
  );

  await testEndpoint("ExpiredOptions", "POST /charts/rollingoption", () =>
    client.expiredOptionsData.fetch({
      securityId: 13,
      exchangeSegment: "NSE_FNO",
      instrumentType: "INDEX",
      expiryFlag: "WEEK",
      expiryCode: 1,
      strike: "ATM",
      drvOptionType: "CALL",
      interval: "15",
      requiredData: ["open", "high", "low", "close", "volume"],
      fromDate: "2026-07-01",
      toDate: "2026-07-28",
    })
  );

  // 5. Instruments
  await testEndpoint("Instruments", "Instruments Scrip Search", () =>
    client.instruments.search("RELIANCE")
  );

  // 6. Trader Controls
  await testEndpoint("TraderControls", "GET /killswitch", () =>
    client.traderControls.getKillSwitchStatus()
  );
  await testEndpoint("TraderControls", "GET /pnlExit", () =>
    client.traderControls.getPnlExit()
  );

  // 7. EDIS
  await testEndpoint("EDIS", "GET /edis/inquire/INE002A01018", () =>
    client.edis.getQuantityStatus("INE002A01018")
  );

  // 8. IP Setup
  await testEndpoint("IpSetup", "GET /ip/setup", () =>
    client.ipSetup.get()
  );

  // 9. Statements
  await testEndpoint("Statements", "GET /ledger", () =>
    client.statements.ledger({
      fromDate: "2026-07-01",
      toDate: "2026-07-28",
    })
  );

  // 10. Global Stocks
  await testEndpoint("GlobalStocks", "GET /v2/globalstocks/marketstatus", () =>
    client.globalStocks.marketStatus.isOpen()
  );
  await testEndpoint("GlobalStocks", "GET /v2/globalstocks/funds", () =>
    client.globalStocks.funds.getLimit()
  );
  await testEndpoint("GlobalStocks", "GET /v2/globalstocks/holdings", () =>
    client.globalStocks.holdings.list()
  );

  // ── Print Summary Table ──────────────────────────────────────────────────
  const HR = "═".repeat(115);
  console.log(`\n\n${HR}`);
  console.log("  REST API ENDPOINT LIVE TEST SUMMARY");
  console.log(HR);
  console.log(`  ${"Module".padEnd(20)} ${"Endpoint".padEnd(38)} ${"Status".padEnd(8)} ${"HTTP Code".padEnd(12)} Details`);
  console.log(`  ${"─".repeat(110)}`);

  let passCount = 0;
  let failCount = 0;

  for (const r of results) {
    if (r.status === "PASS") passCount++;
    else failCount++;

    const statusIcon = r.status === "PASS" ? "✅ PASS" : "❌ FAIL";
    console.log(
      `  ${r.module.padEnd(20)} ${r.endpoint.padEnd(38)} ${statusIcon.padEnd(8)} ${String(r.statusCode).padStart(8)}    ${r.details.slice(0, 48)}`
    );
  }

  console.log(`\n${HR}`);
  console.log(`  Total Tested : ${results.length}`);
  console.log(`  Passed       : ${passCount}`);
  console.log(`  Failed       : ${failCount}`);
  console.log(`${HR}\n`);

  if (failCount > 0) {
    console.log("  FAILING ENDPOINTS & ERROR RESPONSES:");
    for (const r of results.filter((res) => res.status === "FAIL")) {
      console.log(`  • [${r.module}] ${r.endpoint} (HTTP ${r.statusCode})\n    → ${r.details}\n`);
    }
  }
}

main().catch((err: unknown) => {
  console.error("Fatal:", err);
  process.exit(1);
});
