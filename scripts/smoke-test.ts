import dotenv from "dotenv";
import { DhanClient } from "../src";
import { IntradayChartsRequest } from "../src/generated/models/IntradayChartsRequest";
import { HistoricalChartsRequest } from "../src/generated/models/HistoricalChartsRequest";
import { OptionChartRequest } from "../src/generated/models/OptionChartRequest";

dotenv.config({ path: ".env" });

const token = process.env.DHAN_TOKEN?.trim();
const clientId = process.env.DHAN_CLIENT_ID?.trim();
const baseURL = process.env.DHAN_BASE_URL?.trim();

if (!token || !clientId) {
  throw new Error("Please set DHAN_TOKEN and DHAN_CLIENT_ID in .env before running the smoke test.");
}

const instrument = {
  exchangeSegment: (process.env.TEST_EXCHANGE_SEGMENT ?? "NSE_EQ") as IntradayChartsRequest.exchangeSegment,
  securityId: process.env.TEST_SECURITY_ID ?? "1333", // HDFCBANK in NSE_EQ
  instrument: (process.env.TEST_INSTRUMENT ?? "EQUITY") as IntradayChartsRequest.instrument,
};

const optionRequest: OptionChartRequest = {
  exchangeSegment: OptionChartRequest.exchangeSegment.NSE_FNO,
  securityId: 13, // NIFTY
  instrument: OptionChartRequest.instrument.OPTIDX,
  expiryFlag: OptionChartRequest.expiryFlag.WEEK,
  expiryCode: OptionChartRequest.expiryCode._1,
  requiredData: OptionChartRequest.requiredData.STRIKE,
  fromDate: formatDate(30),
  toDate: formatDate(25),
};

function formatDate(daysAgo = 0) {
  const dt = new Date();
  dt.setDate(dt.getDate() - daysAgo);
  return dt.toISOString().slice(0, 10);
}

async function runCharts(client: DhanClient) {
  console.log("Fetching intraday candles...");
  const intraday = await client.charts.intraday({
    exchangeSegment: instrument.exchangeSegment,
    securityId: instrument.securityId,
    instrument: instrument.instrument,
    interval: IntradayChartsRequest.interval._5,
    fromDate: formatDate(1),
    toDate: formatDate(0),
  });
  console.log("Intraday candles received:", intraday.close?.length ?? 0);

  console.log("Fetching historical candles...");
  const historical = await client.charts.historical({
    exchangeSegment: instrument.exchangeSegment as unknown as HistoricalChartsRequest.exchangeSegment,
    securityId: instrument.securityId,
    instrument: instrument.instrument as unknown as HistoricalChartsRequest.instrument,
    fromDate: formatDate(60),
    toDate: formatDate(0),
  });
  console.log("Historical candles received:", historical.close?.length ?? 0);

  // console.log("Fetching rolling option data...");
  // const option = await client.charts.option(optionRequest);
  // console.log("Rolling option strikes received:", (option.data?.ce?.strike?.length ?? 0) + (option.data?.pe?.strike?.length ?? 0));
}

async function runPositions(client: DhanClient) {
  console.log("Listing open positions and holdings...");
  try {
    const [positions, holdings] = await Promise.all([
      client.positions.list(),
      client.positions.listHoldings(),
    ]);
    console.log("Positions count:", positions.length);
    console.log("Holdings count:", holdings.length);
  } catch (error) {
    console.warn("Could not fetch positions or holdings (might be empty account):", (error as any).details?.errorMessage || (error as any).message);
  }
}

async function runWebSockets(client: DhanClient) {
  console.log("Connecting WebSocket streams...");
  await client.ws.connect();

  // Wait for market feed to be ready
  await new Promise<void>((resolve) => client.ws.market.once("open", resolve));
  console.log("Market feed connected.");

  client.ws.market.subscribe([instrument]);

  const tickPromise = new Promise<void>((resolve) => {
    const timer = setTimeout(() => {
      console.warn("No tick received after 12 seconds, continuing anyway.");
      resolve();
    }, 12_000);

    client.ws.market.once("tick", (tick) => {
      clearTimeout(timer);
      console.log("Market tick:", {
        securityId: tick.securityId,
        ltp: tick.ltp,
        exchangeSegment: tick.exchangeSegment,
      });
      resolve();
    });
  });

  client.ws.orders.on("order", (order) => {
    console.log("Order update received:", order.OrderNo ?? order.Id ?? "<unknown>");
  });

  await tickPromise;
  client.ws.disconnect();
}

async function main() {
  const client = new DhanClient({
    token: token!,
    clientId: clientId!,
    baseURL,
  });

  try {
    await runCharts(client);
    await runPositions(client);
    await runWebSockets(client);
    console.log("Smoke test completed successfully.");
  } catch (error) {
    console.error("Smoke test failed:", error);
    process.exitCode = 1;
  }
}

main();
