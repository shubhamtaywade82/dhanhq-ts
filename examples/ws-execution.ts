/**
 * WebSocket-driven execution orchestration.
 *
 * Demonstrates the full loop a live bot runs:
 *
 *   place → track the fill over the order socket → monitor the position from
 *   market ticks → exit on stop / target / trailing stop → confirm the exit
 *
 * REST places and reconciles; the WebSocket drives everything time-sensitive.
 * Polling `GET /orders/{id}` or `GET /positions` in this loop would be slower
 * and would burn the data-API rate limit for no benefit.
 *
 * Set DRY_RUN=false to actually transmit. It defaults to on.
 *
 *   DHAN_CLIENT_ID=... DHAN_ACCESS_TOKEN=... npx ts-node examples/ws-execution.ts
 */
import {
  DhanClient,
  OrderTracker,
  PositionMonitor,
  type ExitSignal,
  type MonitoredPosition,
} from "../src";

const DRY_RUN = process.env.DRY_RUN !== "false";

const INSTRUMENT = {
  securityId: "2885", // RELIANCE
  exchangeSegment: "NSE_EQ" as const,
};

async function main(): Promise<void> {
  const client = new DhanClient({
    clientId: process.env.DHAN_CLIENT_ID!,
    token: process.env.DHAN_ACCESS_TOKEN!,
  });

  const tracker = new OrderTracker();
  const monitor = new PositionMonitor();

  // 1. Bridge the sockets into the execution helpers.
  client.ws.orders.on("order", (state) => tracker.onOrderUpdate(state));
  client.ws.market.on("tick", (tick) => monitor.onTick(tick));

  tracker.on("partial", (outcome) =>
    console.log(`partial fill: ${outcome.filledQuantity} @ ${outcome.averagePrice}`),
  );
  tracker.on("rejected", (outcome) =>
    console.error("rejected:", outcome.state.raw),
  );

  await client.ws.connect();
  client.ws.subscribe([INSTRUMENT]);

  // 2. Place the entry. The correlation id is what ties the REST response to
  //    the socket events, so register the waiter before awaiting the place
  //    call — a fast fill can arrive before the HTTP response does.
  const correlationId = `example-entry-${Date.now()}`;
  const settled = tracker.waitFor(correlationId, { timeoutMs: 60_000 });

  if (DRY_RUN) {
    console.log("DRY_RUN — skipping live order. Set DRY_RUN=false to transmit.");
  } else {
    await client.orders.place({
      correlationId,
      transactionType: "BUY",
      exchangeSegment: INSTRUMENT.exchangeSegment,
      productType: "INTRADAY",
      orderType: "MARKET",
      validity: "DAY",
      quantity: 1,
      securityId: INSTRUMENT.securityId,
    });
  }

  // 3. Wait for the fill, then start watching the position from ticks.
  const entry = DRY_RUN
    ? { averagePrice: await currentPrice(client), filledQuantity: 1 }
    : await settled;

  const entryPrice = entry.averagePrice ?? 0;
  if (entryPrice === 0) {
    throw new Error("No entry price available; aborting before monitoring");
  }

  const position: MonitoredPosition = {
    ...INSTRUMENT,
    quantity: entry.filledQuantity,
    entryPrice,
    stopLoss: entryPrice * 0.99,
    target: entryPrice * 1.02,
    // Once price runs, the trailing stop takes over from the fixed stop.
    trail: { atr: entryPrice * 0.005, multiplier: 2 },
  };

  monitor.track(position);
  console.log(
    `monitoring ${position.quantity} @ ${entryPrice.toFixed(2)} ` +
      `(stop ${position.stopLoss?.toFixed(2)}, target ${position.target?.toFixed(2)})`,
  );

  monitor.on("update", ({ ltp, pnl, trailingStop }) => {
    process.stdout.write(
      `\rltp ${ltp.toFixed(2)} | pnl ${pnl.toFixed(2)} | trail ${trailingStop?.toFixed(2) ?? "—"}   `,
    );
  });

  // 4. Exit on the first signal, then confirm the exit filled.
  monitor.on("exit", (signal) => {
    void handleExit(client, tracker, monitor, signal);
  });

  process.on("SIGINT", () => {
    console.log("\nshutting down");
    tracker.clear();
    client.ws.disconnect();
    process.exit(0);
  });
}

async function handleExit(
  client: DhanClient,
  tracker: OrderTracker,
  monitor: PositionMonitor,
  signal: ExitSignal,
): Promise<void> {
  console.log(
    `\nEXIT (${signal.reason}) at ${signal.price.toFixed(2)}, pnl ${signal.pnl.toFixed(2)}`,
  );

  // Stop watching first — otherwise ticks arriving during the exit round-trip
  // could queue a second closing order.
  monitor.untrack(signal.position.exchangeSegment, signal.position.securityId);

  if (DRY_RUN) {
    console.log("DRY_RUN — no exit order sent.");
    return;
  }

  const correlationId = `example-exit-${Date.now()}`;
  const settled = tracker.waitFor(correlationId, { timeoutMs: 60_000 });

  // A long is closed by selling and a short by buying.
  await client.orders.place({
    correlationId,
    transactionType: signal.position.quantity > 0 ? "SELL" : "BUY",
    exchangeSegment: signal.position.exchangeSegment as never,
    productType: "INTRADAY",
    orderType: "MARKET",
    validity: "DAY",
    quantity: Math.abs(signal.position.quantity),
    securityId: signal.position.securityId,
  });

  const outcome = await settled;
  console.log(
    `exit ${outcome.status}: ${outcome.filledQuantity} @ ${outcome.averagePrice}`,
  );
}

async function currentPrice(client: DhanClient): Promise<number> {
  const ltp = await client.marketFeed.ltpFor(
    INSTRUMENT.exchangeSegment,
    INSTRUMENT.securityId,
  );

  return ltp ?? 0;
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
