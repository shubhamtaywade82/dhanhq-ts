/**
 * The Global Stocks (US equities) book.
 *
 * A separate book from domestic NSE/BSE trading: balances are in USD,
 * quantities are fractional, and orders carry no exchange segment, product
 * type or validity. The domestic risk pipeline does not apply — its checks
 * resolve instruments from the Indian scrip master.
 *
 * Read-only unless PLACE_ORDER=true.
 *
 *   DHAN_CLIENT_ID=... DHAN_ACCESS_TOKEN=... npx ts-node examples/global-stocks.ts
 */
import { DhanClient } from "../src";

async function main(): Promise<void> {
  const client = new DhanClient({
    clientId: process.env.DHAN_CLIENT_ID!,
    token: process.env.DHAN_ACCESS_TOKEN!,
  });

  // 1. US market hours are not Indian market hours — check before trading.
  const status = await client.globalStocks.marketStatus.get();
  console.log("US market:", status.status, `(${status.marketOpenTime ?? "—"} → ${status.marketCloseTime ?? "—"})`);

  // 2. USD balances, kept separate from the INR book.
  const funds = await client.globalStocks.funds.getLimit();
  console.log(`available cash: $${Number(funds.availableCash ?? 0).toFixed(2)}`);

  // 3. US holdings. Note this never blends with client.positions.listHoldings().
  const holdings = await client.globalStocks.holdings.list();
  for (const holding of holdings) {
    console.log(
      `  ${holding.tradingSymbol}: ${holding.totalQty} @ $${holding.avgCostPrice} ` +
        `(now $${holding.lastTradedPrice}, gain $${holding.totalGain})`,
    );
  }
  console.log(
    `total value: $${(await client.globalStocks.holdings.totalCurrentValue()).toFixed(2)}`,
  );

  // 4. Cost and margin in one call, so affordability is a single decision.
  const summary = await client.globalStocks.costSummary({
    securityId: "AAPL",
    transactionType: "BUY",
    price: 190,
    quantity: 2,
  });

  console.log("cost summary:", {
    charges: summary.totalCharges,
    margin: summary.totalMargin,
    available: summary.availableBalance,
    affordable: summary.sufficient,
  });

  if (process.env.PLACE_ORDER !== "true") {
    console.log("\nRead-only. Set PLACE_ORDER=true to transmit.");
    return;
  }

  if (!summary.sufficient) {
    console.log("Insufficient USD balance — not placing.");
    return;
  }

  // 5a. A fractional-share limit order with bracket levels. The contract
  //     enforces that target sits above and stop below entry for a BUY.
  const fractional = await client.globalStocks.orders.place({
    transactionType: "BUY",
    orderType: "LIMIT",
    securityId: "AAPL",
    quantity: 0.5,
    price: 190,
    targetPrice: 205,
    stopLossPrice: 180,
  });

  console.log("fractional order:", fractional.data.orderId, fractional.correlationId);

  // 5b. An AMOUNT order buys a dollar value rather than a share count —
  //     `amount` replaces `quantity` entirely.
  const notional = await client.globalStocks.orders.place({
    transactionType: "BUY",
    orderType: "AMOUNT",
    securityId: "MSFT",
    amount: 100,
  });

  console.log("notional order:", notional.data.orderId);
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
