/**
 * Read-only tour of the analysis, risk, skill and agent layers.
 *
 * Places nothing: the order path stops at a preview, and the skill stops at an
 * intent.
 *
 *   DHAN_CLIENT_ID=... DHAN_ACCESS_TOKEN=... npx ts-node examples/analysis-and-skills.ts
 */
import {
  AgentToolRegistry,
  analyzeMultiTimeframe,
  createSkillRegistry,
  DhanClient,
  greeks,
  maxPain,
  openInterestFromChain,
  Pipeline,
  Policy,
  previewOrder,
  riskProviderFor,
  TechnicalAnalysis,
} from "../src";

async function main(): Promise<void> {
  const client = new DhanClient({
    clientId: process.env.DHAN_CLIENT_ID!,
    token: process.env.DHAN_ACCESS_TOKEN!,
  });

  // 1. Resolve a symbol through the scrip master.
  const nifty = await client.instruments.find("IDX_I", "NIFTY", {
    exactMatch: true,
  });

  if (!nifty) {
    throw new Error("Could not resolve NIFTY");
  }

  console.log("NIFTY security id:", nifty.securityId);

  // 2. Multi-timeframe technical bias.
  const analysis = new TechnicalAnalysis(client.charts);
  const technicals = await analysis.compute({
    securityId: nifty.securityId,
    exchangeSegment: "IDX_I",
    instrument: "INDEX",
    intervals: [15, 60],
  });

  console.log("Bias:", analyzeMultiTimeframe(technicals).summary);

  // 3. Option chain analytics for the nearest expiry.
  const expiries = await client.optionChain.expiryList({
    underlyingScrip: Number(nifty.securityId),
    underlyingSeg: "IDX_I",
  });

  const expiry = expiries.data?.[0];
  if (expiry) {
    const chain = await client.optionChain.fetchNormalized({
      underlyingScrip: Number(nifty.securityId),
      underlyingSeg: "IDX_I",
      expiry,
    });

    console.log("Max pain:", maxPain(openInterestFromChain(chain)));

    const spot = chain.lastPrice ?? 0;
    console.log(
      "ATM call greeks:",
      greeks({
        spot,
        strike: Math.round(spot / 50) * 50,
        timeToExpiry: 7 / 365,
        riskFreeRate: 0.065,
        volatility: 0.14,
        optionType: "call",
      }),
    );

    // 4. Build a structure — an intent, not an order.
    const { intent } = await createSkillRegistry().call(
      "iron_condor",
      { symbol: "NIFTY", expiry, wingWidth: 200 },
      client,
    );

    console.log("Iron condor intent:", intent);
  }

  // 5. Preview an order through the risk pipeline. Nothing is placed.
  const pipeline = new Pipeline({ provider: riskProviderFor(client) });
  const preview = await previewOrder(
    {
      transactionType: "BUY",
      exchangeSegment: "NSE_EQ",
      productType: "CNC",
      orderType: "LIMIT",
      securityId: "2885",
      quantity: 1,
      price: 1400,
      correlationId: "example-preview-001",
    },
    { pipeline },
  );

  console.log("Preview:", preview.valid, preview.errors);

  // 6. The same surface an MCP client sees.
  const tools = new AgentToolRegistry({ client, policy: Policy.readOnly() });
  console.log(
    "Available read-only tools:",
    tools.availableTools().map((tool) => tool.name),
  );
}

main().catch((error: unknown) => {
  console.error(error);
  process.exit(1);
});
