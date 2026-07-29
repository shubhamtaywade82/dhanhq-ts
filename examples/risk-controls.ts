/**
 * Account-level risk controls: P&L auto-exit and the kill switch.
 *
 * These are the broker-side backstops that keep working when your process
 * does not. A local trailing stop dies with the bot; a P&L exit configured at
 * Dhan does not — which is exactly why it is worth setting before a session
 * rather than after something goes wrong.
 *
 * Read-only by default. Set APPLY=true to actually arm the controls.
 *
 *   DHAN_CLIENT_ID=... DHAN_ACCESS_TOKEN=... npx ts-node examples/risk-controls.ts
 */
import {
  DhanClient,
  Pipeline,
  riskProviderFor,
  RiskViolationError,
  fixedRiskSize,
  type RiskLimits,
} from "../src";

const APPLY = process.env.APPLY === "true";

async function main(): Promise<void> {
  const client = new DhanClient({
    clientId: process.env.DHAN_CLIENT_ID!,
    token: process.env.DHAN_ACCESS_TOKEN!,
  });

  await inspectControls(client);
  await localRiskBudget(client);

  if (!APPLY) {
    console.log("\nRead-only. Set APPLY=true to arm these controls.");
    return;
  }

  await armPnlExit(client);
  await demonstrateKillSwitch(client);
}

/** Layer 1 — what the broker currently has armed. */
async function inspectControls(client: DhanClient): Promise<void> {
  console.log("=== Current broker-side controls ===");

  const [killSwitch, pnlExit] = await Promise.all([
    client.traderControls.getKillSwitchStatus(),
    client.traderControls.getPnlExit(),
  ]);

  console.log("kill switch:", killSwitch);
  console.log("pnl exit:", pnlExit);
}

/**
 * Layer 2 — the local pre-trade pipeline. It stops a bad order before it is
 * sent, where the broker controls stop the damage after it accumulates.
 */
async function localRiskBudget(client: DhanClient): Promise<void> {
  console.log("\n=== Local pre-trade pipeline ===");

  const funds = await client.funds.getLimit();
  const available = Number(funds.availabelBalance ?? 0);

  // Size the position from a fixed 1% risk budget rather than a round lot.
  const entryPrice = 1400;
  const stopLossPrice = entryPrice * 0.98;
  const quantity = fixedRiskSize({
    accountBalance: available,
    riskPercent: 1,
    entryPrice,
    stopLossPrice,
  });

  console.log(
    `available ₹${available.toFixed(2)} → ${quantity} shares at 1% risk ` +
      `(stop ${stopLossPrice.toFixed(2)})`,
  );

  // Tighten the defaults for an unattended session: a bot that can only ever
  // lose ₹10,000 in a day needs far less supervision than one that cannot.
  const limits: Partial<RiskLimits> = {
    maxQuantity: Math.max(quantity, 1),
    maxNotional: 200_000,
    dailyMaxLoss: 10_000,
    maxOpenPositions: 5,
    maxConcentrationPct: 15,
  };

  const pipeline = new Pipeline({
    provider: riskProviderFor(client),
    limits,
  });

  const order = {
    transactionType: "BUY" as const,
    exchangeSegment: "NSE_EQ" as const,
    productType: "CNC" as const,
    orderType: "LIMIT" as const,
    securityId: "2885",
    quantity: Math.max(quantity, 1),
    price: entryPrice,
  };

  // `report` collects every violation; `run` throws on the first one.
  const report = await pipeline.report({ args: order });
  console.log("pipeline passed:", report.passed);
  for (const violation of report.violations) {
    console.log(`  ✗ ${violation.check}: ${violation.message}`);
  }

  try {
    // Deliberately oversized, to show the pipeline refusing an order.
    await pipeline.run({ args: { ...order, quantity: 100_000 } });
  } catch (error) {
    if (error instanceof RiskViolationError) {
      console.log(`  blocked by "${error.check}": ${error.message}`);
    } else {
      throw error;
    }
  }
}

/** Layer 3 — broker-side auto-exit, which survives your process dying. */
async function armPnlExit(client: DhanClient): Promise<void> {
  console.log("\n=== Arming P&L auto-exit ===");

  const response = await client.traderControls.setPnlExit({
    profitValue: 5_000,
    lossValue: 2_500,
    // Trip the kill switch on exit, so nothing re-enters after the book is
    // flattened.
    enableKillSwitch: true,
    productType: ["INTRADAY"],
  });

  console.log("armed:", response);
  console.log("All positions now auto-square-off at +₹5,000 or −₹2,500.");

  // Disarming is a separate call — the thresholds persist for the session
  // otherwise.
  // await client.traderControls.stopPnlExit();
}

/**
 * Layer 4 — the kill switch. This is the emergency stop: it blocks all
 * trading for the remainder of the day and cannot be undone until the next
 * session, so it belongs behind a human decision, not an automated rule.
 */
async function demonstrateKillSwitch(client: DhanClient): Promise<void> {
  console.log("\n=== Kill switch ===");
  console.log(
    "Not activating automatically — this blocks trading for the rest of the " +
      "day and is not reversible within the session.",
  );
  console.log("To activate deliberately:");
  console.log('  await client.traderControls.setKillSwitch("ACTIVATE");');

  // Through the agent layer this sits on the `risk:write` scope, deliberately
  // separate from `orders:write`: an agent allowed to trade should not be
  // able to disarm the account's own safety rails as a side effect.
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
