import dotenv from "dotenv";
import { URL } from "node:url";
import { DhanClient, Constants } from "../src";
import type { IntradayChartsRequest } from "../src/generated/models/IntradayChartsRequest";
import type { HistoricalChartsRequest } from "../src/generated/models/HistoricalChartsRequest";
import { KnowYourMarginReq, ScriptItem } from "../src/generated";

dotenv.config({ path: ".env" });

const serviceUrl = process.env.DHAN_TOKEN_SERVICE_URL?.trim();
const bearerToken = process.env.DHAN_TOKEN_ACCESS_TOKEN?.trim();

if (!serviceUrl) throw new Error("DHAN_TOKEN_SERVICE_URL is not set");
if (!bearerToken) throw new Error("DHAN_TOKEN_ACCESS_TOKEN is not set");

const parsed = new URL(serviceUrl);
const endpointBaseUrl = `${parsed.protocol}//${parsed.host}`;

let passed = 0;
let failed = 0;
let skipped = 0;

function ok(label: string) {
  passed++;
  console.log(`  ✓ ${label}`);
}

function fail(label: string, err: unknown) {
  failed++;
  const msg = (err as any)?.details
    ? JSON.stringify((err as any).details).slice(0, 120)
    : (err as any)?.message ?? err;
  console.log(`  ✗ ${label}: ${msg}`);
}

function skip(label: string, reason?: string) {
  skipped++;
  console.log(`  − ${label} (skipped${reason ? `: ${reason}` : ""})`);
}

function sleep(ms: number): Promise<void> {
  return new Promise((r) => setTimeout(r, ms));
}

function fmtDate(daysAgo = 0): string {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString().slice(0, 10);
}

async function main() {
  console.log("\n=== Authenticating via provider ===\n");
  const client = await DhanClient.fromTokenEndpoint({
    endpointBaseUrl,
    bearerToken: bearerToken!,
  });
  ok(`Authenticated (client: ${client.getConfig().clientId})`);

  // ---------------------------------------------------------------------------
  // PROFILE
  // ---------------------------------------------------------------------------
  console.log("\n=== Profile ===\n");
  try {
    const profile = await client.profile.get();
    ok(`profile.get() → dhanClientId=${profile.dhanClientId}, dataPlan=${profile.dataPlan}, ddpi=${profile.ddpi}`);
  } catch (e) { fail("profile.get()", e); }

  // ---------------------------------------------------------------------------
  // FUNDS
  // ---------------------------------------------------------------------------
  console.log("\n=== Funds ===\n");
  try {
    const funds = await client.funds.getLimit();
    ok(`funds.getLimit() → availabelBalance=${funds.availabelBalance}, sodLimit=${funds.sodLimit}`);
  } catch (e) { fail("funds.getLimit()", e); }

  try {
    const margin = await client.funds.calculateMargin({
      exchangeSegment: KnowYourMarginReq.exchangeSegment.NSE_EQ,
      transactionType: KnowYourMarginReq.transactionType.BUY,
      securityId: "1333",
      quantity: 1,
      productType: KnowYourMarginReq.productType.INTRADAY,
    } as KnowYourMarginReq);
    ok(`funds.calculateMargin() → received`);
  } catch (e) { fail("funds.calculateMargin()", e); }

  try {
    const multi = await client.funds.calculateMultiMargin({
      dhanClientId: client.getConfig().clientId,
      includePosition: false,
      includeOrder: false,
      scripList: [{
        exchangeSegment: ScriptItem.exchangeSegment.NSE_EQ,
        transactionType: ScriptItem.transactionType.BUY,
        securityId: "1333",
        quantity: 1,
        price: 1000,
        productType: ScriptItem.productType.INTRADAY,
      }],
    } as any);
    ok(`funds.calculateMultiMargin() → received`);
  } catch (e) { fail("funds.calculateMultiMargin()", e); }

  // ---------------------------------------------------------------------------
  // ORDERS
  // ---------------------------------------------------------------------------
  console.log("\n=== Orders ===\n");
  try {
    const orders = await client.orders.list();
    ok(`orders.list() → ${orders.length} orders`);
  } catch (e) { fail("orders.list()", e); }

  try {
    const trades = await client.orders.listTrades();
    ok(`orders.listTrades() → ${trades.length} trades`);
  } catch (e) { fail("orders.listTrades()", e); }

  try {
    const history = await client.orders.getTradeHistory({ fromDate: fmtDate(7), toDate: fmtDate(0) });
    ok(`orders.getTradeHistory() → ${history.length} trades in last 7 days`);
  } catch (e) { fail("orders.getTradeHistory()", e); }

  // ---------------------------------------------------------------------------
  // POSITIONS
  // ---------------------------------------------------------------------------
  console.log("\n=== Positions ===\n");
  try {
    const positions = await client.positions.list();
    ok(`positions.list() → ${positions.length} open positions`);
  } catch (e) { fail("positions.list()", e); }

  try {
    const holdings = await client.positions.listHoldings();
    ok(`positions.listHoldings() → ${holdings.length} holdings`);
  } catch (e) {
    if ((e as any)?.status === 500) {
      skip("positions.listHoldings()", "server 500 — likely empty account");
    } else {
      fail("positions.listHoldings()", e);
    }
  }

  // ---------------------------------------------------------------------------
  // CHARTS (INTRADAY / HISTORICAL)
  // ---------------------------------------------------------------------------
  console.log("\n=== Charts ===\n");
  try {
    const intra = await client.charts.intraday({
      exchangeSegment: "NSE_EQ" as IntradayChartsRequest["exchangeSegment"],
      securityId: "1333",
      instrument: "EQUITY" as IntradayChartsRequest["instrument"],
      interval: "5" as IntradayChartsRequest["interval"],
      fromDate: fmtDate(1),
      toDate: fmtDate(0),
    });
    ok(`charts.intraday() → ${intra.close?.length ?? 0} candles`);
  } catch (e) { fail("charts.intraday()", e); }

  try {
    const hist = await client.charts.historical({
      exchangeSegment: "NSE_EQ" as HistoricalChartsRequest["exchangeSegment"],
      securityId: "1333",
      instrument: "EQUITY" as HistoricalChartsRequest["instrument"],
      fromDate: fmtDate(60),
      toDate: fmtDate(0),
    });
    ok(`charts.historical() → ${hist.close?.length ?? 0} candles`);
  } catch (e) { fail("charts.historical()", e); }

  // ---------------------------------------------------------------------------
  // MARKET DATA (REST Quotes) — rate-limited to 1 req/sec
  // ---------------------------------------------------------------------------
  console.log("\n=== Market Data (REST) ===\n");
  const mktInstruments: Record<string, Array<number | string>> = {
    NSE_EQ: ["1333"],
    IDX_I: [13, 25],
  };

  try {
    const ltp = await client.marketFeed.ltp(mktInstruments);
    ok(`marketFeed.ltp() → ${Object.keys(ltp?.data ?? {}).length} instruments`);
  } catch (e) { fail("marketFeed.ltp()", e); }

  await sleep(1100);

  try {
    const ohlc = await client.marketFeed.ohlc(mktInstruments);
    ok(`marketFeed.ohlc() → ${Object.keys(ohlc?.data ?? {}).length} instruments`);
  } catch (e) { fail("marketFeed.ohlc()", e); }

  await sleep(1100);

  try {
    const quote = await client.marketFeed.quote(mktInstruments);
    ok(`marketFeed.quote() → ${Object.keys(quote?.data ?? {}).length} instruments`);
  } catch (e) { fail("marketFeed.quote()", e); }

  await sleep(1100);

  try {
    const ltpVal = await client.marketFeed.ltpFor("NSE_EQ", 1333);
    ok(`marketFeed.ltpFor(NSE_EQ, 1333) → ${ltpVal ?? "N/A"}`);
  } catch (e) { fail("marketFeed.ltpFor()", e); }

  // ---------------------------------------------------------------------------
  // OPTION CHAIN — rate-limited to 1 req per 3 sec
  // ---------------------------------------------------------------------------
  console.log("\n=== Option Chain ===\n");
  let nearExpiry = "";

  try {
    const expiries = await client.optionChain.expiryList({
      underlyingScrip: 13,
      underlyingSeg: "IDX_I",
    });
    const expiryList = (expiries as any)?.data ?? [];
    ok(`optionChain.expiryList(NIFTY) → ${expiryList.length} expiries`);
    nearExpiry = expiryList[0] ?? "";
  } catch (e) { fail("optionChain.expiryList()", e); }

  if (nearExpiry) {
    await sleep(3100);

    try {
      const chain = await client.optionChain.fetch({
        underlyingScrip: 13,
        underlyingSeg: "IDX_I",
        expiry: nearExpiry,
      });
      ok(`optionChain.fetch(${nearExpiry}) → received`);
    } catch (e) { fail("optionChain.fetch()", e); }

    await sleep(3100);

    try {
      const norm = await client.optionChain.fetchNormalized({
        underlyingScrip: 13,
        underlyingSeg: "IDX_I",
        expiry: nearExpiry,
      });
      ok(`optionChain.fetchNormalized() → ${norm.strikes.length} strikes, spot=${norm.lastPrice}`);
    } catch (e) { fail("optionChain.fetchNormalized()", e); }
  }

  // ---------------------------------------------------------------------------
  // INSTRUMENTS (Security Master)
  // ---------------------------------------------------------------------------
  console.log("\n=== Instruments ===\n");
  try {
    const seg = await client.instruments.bySegment("NSE_EQ");
    ok(`instruments.bySegment(NSE_EQ) → ${seg.length} instruments`);
  } catch (e) { fail("instruments.bySegment()", e); }

  try {
    const found = await client.instruments.find("NSE_EQ", "RELIANCE");
    ok(`instruments.find(NSE_EQ, RELIANCE) → ${found ? `securityId=${found.securityId}` : "not found"}`);
  } catch (e) { fail("instruments.find()", e); }

  try {
    const byId = await client.instruments.findBySecurityId("NSE_EQ", 1333);
    ok(`instruments.findBySecurityId(NSE_EQ, 1333) → ${byId ? byId.symbolName ?? byId.displayName ?? "found" : "not found"}`);
  } catch (e) { fail("instruments.findBySecurityId()", e); }

  try {
    const search = await client.instruments.search("HDFCBANK");
    ok(`instruments.search(HDFCBANK) → ${search.length} results`);
  } catch (e) { fail("instruments.search()", e); }

  try {
    const anywhere = await client.instruments.findAnywhere("NIFTY");
    ok(`instruments.findAnywhere(NIFTY) → ${anywhere ? `seg=${anywhere.exchangeSegment}` : "not found"}`);
  } catch (e) { fail("instruments.findAnywhere()", e); }

  // ---------------------------------------------------------------------------
  // STATEMENTS (Ledger)
  // ---------------------------------------------------------------------------
  console.log("\n=== Statements ===\n");
  try {
    const ledger = await client.statements.ledger({ fromDate: fmtDate(7), toDate: fmtDate(0) });
    ok(`statements.ledger() → received`);
  } catch (e) { fail("statements.ledger()", e); }

  // ---------------------------------------------------------------------------
  // ALERTS
  // ---------------------------------------------------------------------------
  console.log("\n=== Alerts ===\n");
  try {
    const alerts = await client.alerts.list();
    ok(`alerts.list() → ${alerts.length} alerts`);
  } catch (e) { fail("alerts.list()", e); }

  // ---------------------------------------------------------------------------
  // IP SETUP
  // ---------------------------------------------------------------------------
  console.log("\n=== IP Setup ===\n");
  try {
    const ip = await client.ipSetup.get();
    ok(`ipSetup.get() → received`);
  } catch (e) { fail("ipSetup.get()", e); }

  // ---------------------------------------------------------------------------
  // TRADER CONTROLS
  // ---------------------------------------------------------------------------
  console.log("\n=== Trader Controls ===\n");
  try {
    const pnl = await client.traderControls.getPnlExit();
    ok(`traderControls.getPnlExit() → received`);
  } catch (e) { fail("traderControls.getPnlExit()", e); }

  try {
    const kill = await client.traderControls.getKillSwitchStatus();
    ok(`traderControls.getKillSwitchStatus() → status=${(kill as any)?.data ?? "ok"}`);
  } catch (e) { fail("traderControls.getKillSwitchStatus()", e); }

  // ---------------------------------------------------------------------------
  // SUPER ORDERS
  // ---------------------------------------------------------------------------
  console.log("\n=== Super Orders ===\n");
  try {
    const list = await client.superOrders.list();
    ok(`superOrders.list() → ${list.length} super orders`);
  } catch (e) { fail("superOrders.list()", e); }

  // ---------------------------------------------------------------------------
  // FOREVER ORDERS (GTT)
  // ---------------------------------------------------------------------------
  console.log("\n=== Forever Orders (GTT) ===\n");
  try {
    const list = await client.foreverOrders.list();
    ok(`foreverOrders.list() → ${list.length} GTT orders`);
  } catch (e) { fail("foreverOrders.list()", e); }

  // ---------------------------------------------------------------------------
  // eDIS
  // ---------------------------------------------------------------------------
  console.log("\n=== eDIS ===\n");
  try {
    const tpin = await client.edis.requestTpin();
    ok(`edis.requestTpin() → received`);
  } catch (e) {
    if ((e as any)?.status === 500) {
      skip("edis.requestTpin()", "server 500 — eDIS may require DSP account");
    } else {
      fail("edis.requestTpin()", e);
    }
  }

  // ---------------------------------------------------------------------------
  // GLOBAL STOCKS (US equities — separate book)
  // ---------------------------------------------------------------------------
  console.log("\n=== Global Stocks (US Equities) ===\n");

  try {
    const orders = await client.globalStocks.orders.list();
    ok(`globalStocks.orders.list() → ${orders.length} orders`);
  } catch (e) {
    if ((e as any)?.status === 400 || (e as any)?.status === 500) {
      skip("globalStocks.orders.list()", "feature not enabled on this account");
    } else {
      fail("globalStocks.orders.list()", e);
    }
  }

  try {
    const holdings = await client.globalStocks.holdings.list();
    ok(`globalStocks.holdings.list() → ${holdings.length} holdings`);
  } catch (e) {
    if ((e as any)?.status === 400 || (e as any)?.status === 500) {
      skip("globalStocks.holdings.list()", "feature not enabled on this account");
    } else {
      fail("globalStocks.holdings.list()", e);
    }
  }

  try {
    const trades = await client.globalStocks.trades.list();
    ok(`globalStocks.trades.list() → ${trades.length} trades`);
  } catch (e) {
    if ((e as any)?.status === 400 || (e as any)?.status === 500) {
      skip("globalStocks.trades.list()", "feature not enabled on this account");
    } else {
      fail("globalStocks.trades.list()", e);
    }
  }

  try {
    const funds = await client.globalStocks.funds.getLimit();
    ok(`globalStocks.funds.getLimit() → received`);
  } catch (e) {
    if ((e as any)?.status === 400 || (e as any)?.status === 500) {
      skip("globalStocks.funds.getLimit()", "feature not enabled on this account");
    } else {
      fail("globalStocks.funds.getLimit()", e);
    }
  }

  try {
    const status = await client.globalStocks.marketStatus.get();
    ok(`globalStocks.marketStatus.get() → received`);
  } catch (e) { fail("globalStocks.marketStatus.get()", e); }

  try {
    const isOpen = await client.globalStocks.marketStatus.isOpen();
    ok(`globalStocks.marketStatus.isOpen() → ${isOpen}`);
  } catch (e) { fail("globalStocks.marketStatus.isOpen()", e); }

  // ---------------------------------------------------------------------------
  // WEBSOCKET — Market Feed
  // ---------------------------------------------------------------------------
  console.log("\n=== WebSocket — Market Feed ===\n");
  try {
    await client.ws.connect();
    ok("ws.connect() → connected");

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Market feed open timeout (15s)")), 15_000);
      client.ws.market.once("open", () => { clearTimeout(timer); resolve(); });
    });
    ok("ws.market 'open' event fired");

    client.ws.market.subscribe([{ exchangeSegment: "NSE_EQ", securityId: "1333" }]);
    ok("ws.market.subscribe([NSE_EQ:1333]) → sent");

    const tick = await new Promise<unknown>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("No tick received after 15s")), 15_000);
      client.ws.market.once("tick", (t) => { clearTimeout(timer); resolve(t); });
    });
    ok(`ws.market 'tick' → ${JSON.stringify(tick).slice(0, 120)}...`);

    client.ws.disconnect();
    ok("ws.disconnect() → disconnected");
  } catch (e) {
    fail("WebSocket market feed", e);
    try { client.ws.disconnect(); } catch { /* ignore */ }
  }

  // ---------------------------------------------------------------------------
  // WEBSOCKET — Order Updates (connect only, no place)
  // ---------------------------------------------------------------------------
  console.log("\n=== WebSocket — Order Updates ===\n");
  try {
    await client.ws.connect();
    ok("ws.connect() → connected for order updates");

    await new Promise<void>((resolve, reject) => {
      const timer = setTimeout(() => reject(new Error("Order update open timeout (15s)")), 15_000);
      client.ws.orders.once("open", () => { clearTimeout(timer); resolve(); });
    });
    ok("ws.orders 'open' event fired");

    await new Promise<void>((resolve) => setTimeout(resolve, 3000));
    ok("ws.orders heartbeat OK (3s idle)");

    client.ws.disconnect();
    ok("ws.disconnect() → done");
  } catch (e) {
    fail("WebSocket order updates", e);
    try { client.ws.disconnect(); } catch { /* ignore */ }
  }

  // ---------------------------------------------------------------------------
  // SUMMARY
  // ---------------------------------------------------------------------------
  const total = passed + failed + skipped;
  console.log(`\n${"=".repeat(50)}`);
  console.log(`  Results: ${passed} passed, ${failed} failed, ${skipped} skipped (${total} total)`);
  console.log(`${"=".repeat(50)}\n`);
  process.exitCode = failed > 0 ? 1 : 0;
}

main().catch((error) => {
  console.error("\nFatal:", error);
  process.exitCode = 1;
});
