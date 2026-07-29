import type { AxiosInstance } from "axios";

import {
  createSkillRegistry,
  DhanClient,
  parseCsv,
  SkillRegistry,
} from "../src";

/** Two index rows, enough for `Instruments.find("IDX_I", ...)` to resolve. */
const SCRIP_CSV = [
  "EXCH_ID,SEGMENT,SECURITY_ID,SYMBOL_NAME,DISPLAY_NAME,INSTRUMENT,UNDERLYING_SYMBOL,LOT_SIZE,INSTRUMENT_TYPE,BUY_SELL_INDICATOR,ASM_GSM_FLAG,BRACKET_FLAG,COVER_FLAG",
  "NSE,I,13,NIFTY,NIFTY 50,INDEX,NIFTY,50,INDEX,A,N,Y,Y",
  "NSE,I,25,BANKNIFTY,NIFTY BANK,INDEX,BANKNIFTY,15,INDEX,A,N,Y,Y",
].join("\n");

/** An option chain around a 24,000 spot, on a 100-point strike grid. */
function chainResponse(spot = 24_000) {
  const oc: Record<string, unknown> = {};

  for (let strike = spot - 500; strike <= spot + 500; strike += 100) {
    oc[`${strike}.000000`] = {
      ce: {
        last_price: Math.max(spot + 200 - strike, 5),
        oi: 1000 + strike / 100,
        security_id: `CE${strike}`,
      },
      pe: {
        last_price: Math.max(strike - spot + 200, 5),
        oi: 2000 - strike / 100,
        security_id: `PE${strike}`,
      },
    };
  }

  return { status: "success", data: { last_price: spot, oc } };
}

function createHarness() {
  const requests: Array<{ method?: string; url?: string; data?: unknown }> = [];
  const queue: Array<() => Promise<{ data: unknown }>> = [];

  const axiosInstance = {
    request: jest.fn(async (config) => {
      requests.push(config);
      const next = queue.shift();
      if (!next) {
        throw new Error(`No response queued for ${config.method} ${config.url}`);
      }
      return next();
    }),
  } as unknown as AxiosInstance;

  const client = new DhanClient(
    { token: "token", clientId: "client-id" },
    { axiosInstance },
  );

  return {
    client,
    requests,
    enqueue(data: unknown) {
      queue.push(async () => ({ data }));
    },
    /** Queues the two calls every index option skill makes. */
    enqueueIndexChain(spot = 24_000) {
      queue.push(async () => ({ data: SCRIP_CSV }));
      queue.push(async () => ({ data: chainResponse(spot) }));
    },
  };
}

describe("SkillRegistry", () => {
  it("registers all eleven builtin skills", () => {
    const registry = createSkillRegistry();

    expect(registry.names()).toEqual([
      "bear_call_spread",
      "bull_put_spread",
      "buy_atm_call",
      "covered_call",
      "iron_condor",
      "market_data_summarizer",
      "protective_put",
      "square_off_all",
      "square_off_position",
      "straddle",
      "strangle",
    ]);
  });

  it("exposes each skill's risk, scope, params and steps", () => {
    const listing = createSkillRegistry()
      .list()
      .find((entry) => entry.name === "iron_condor");

    expect(listing).toMatchObject({
      risk: "trade_adjacent_read",
      scope: "orders:read",
      steps: ["resolve_chain", "select_legs", "build_intent"],
    });
    expect(listing?.params.symbol.required).toBe(true);
  });

  it("gates destructive skills behind orders:write", () => {
    const listing = createSkillRegistry()
      .list()
      .find((entry) => entry.name === "square_off_all");

    expect(listing).toMatchObject({
      risk: "destructive_write",
      scope: "orders:write",
    });
  });

  it("throws a helpful error for an unknown skill", () => {
    expect(() => new SkillRegistry().find("nope")).toThrow(/Unknown skill/);
  });
});

describe("option structure skills", () => {
  it("builds a straddle at the ATM strike with both breakevens", async () => {
    const harness = createHarness();
    harness.enqueueIndexChain(24_000);

    const result = await createSkillRegistry().call(
      "straddle",
      { symbol: "NIFTY", expiry: "2026-02-26", quantity: 50 },
      harness.client,
    );

    const intent = result.intent as Record<string, unknown>;
    expect(intent.tradeType).toBe("STRADDLE");
    expect(intent.legs).toHaveLength(2);
    expect(intent.breakEvenUpside).toBeGreaterThan(24_000);
    expect(intent.breakEvenDownside).toBeLessThan(24_000);
    // The client is an execution dependency, not part of the result.
    expect(result).not.toHaveProperty("client");
  });

  it("builds an iron condor with four legs at exact wing strikes", async () => {
    const harness = createHarness();
    harness.enqueueIndexChain(24_000);

    const result = await createSkillRegistry().call(
      "iron_condor",
      { symbol: "NIFTY", expiry: "2026-02-26", wingWidth: 200 },
      harness.client,
    );

    const legs = (result.intent as Record<string, unknown>)
      .legs as Array<Record<string, unknown>>;

    expect(legs).toHaveLength(4);
    expect(legs.map((leg) => leg.strike)).toEqual([
      24_200, 24_400, 23_800, 23_600,
    ]);
    expect(legs.map((leg) => leg.action)).toEqual([
      "SELL",
      "BUY",
      "SELL",
      "BUY",
    ]);
  });

  it("refuses an iron condor whose wings fall outside the chain", async () => {
    const harness = createHarness();
    harness.enqueueIndexChain(24_000);

    await expect(
      createSkillRegistry().call(
        "iron_condor",
        { symbol: "NIFTY", expiry: "2026-02-26", wingWidth: 5000 },
        harness.client,
      ),
    ).rejects.toThrow(/insufficient strikes/);
  });

  it("places strangle legs either side of spot by the configured offset", async () => {
    const harness = createHarness();
    harness.enqueueIndexChain(24_000);

    const result = await createSkillRegistry().call(
      "strangle",
      { symbol: "NIFTY", expiry: "2026-02-26", offsetPct: 1 },
      harness.client,
    );

    const legs = (result.intent as Record<string, unknown>)
      .legs as Array<Record<string, unknown>>;

    // 1% of 24000 is 240, snapping to the nearest 100-point strikes.
    expect(legs[0]).toMatchObject({ optionType: "CE", strike: 24_200 });
    expect(legs[1]).toMatchObject({ optionType: "PE", strike: 23_800 });
  });

  it("builds a bull put spread below spot and a bear call spread above it", async () => {
    const registry = createSkillRegistry();

    const bullHarness = createHarness();
    bullHarness.enqueueIndexChain(24_000);
    const bull = await registry.call(
      "bull_put_spread",
      { symbol: "NIFTY", expiry: "2026-02-26", spreadWidth: 100 },
      bullHarness.client,
    );

    const bearHarness = createHarness();
    bearHarness.enqueueIndexChain(24_000);
    const bear = await registry.call(
      "bear_call_spread",
      { symbol: "NIFTY", expiry: "2026-02-26", spreadWidth: 100 },
      bearHarness.client,
    );

    const bullLegs = (bull.intent as Record<string, unknown>)
      .legs as Array<Record<string, unknown>>;
    const bearLegs = (bear.intent as Record<string, unknown>)
      .legs as Array<Record<string, unknown>>;

    expect(bullLegs.map((leg) => leg.strike)).toEqual([23_900, 23_800]);
    expect(bearLegs.map((leg) => leg.strike)).toEqual([24_100, 24_200]);
  });

  it("requires the declared parameters", async () => {
    const harness = createHarness();

    await expect(
      createSkillRegistry().call("straddle", { symbol: "NIFTY" }, harness.client),
    ).rejects.toThrow(/Missing required parameter: expiry/);
  });

  it("fails clearly when the symbol cannot be resolved", async () => {
    const harness = createHarness();
    harness.enqueue(SCRIP_CSV);

    await expect(
      createSkillRegistry().call(
        "straddle",
        { symbol: "SENSEX", expiry: "2026-02-26" },
        harness.client,
      ),
    ).rejects.toThrow(/Could not resolve symbol SENSEX/);
  });
});

describe("position management skills", () => {
  it("squares off the whole book in one call", async () => {
    const harness = createHarness();
    harness.enqueue([{ netQty: 50, securityId: "1" }, { netQty: 0 }]);
    harness.enqueue({ status: "success" });

    const result = await createSkillRegistry().call(
      "square_off_all",
      {},
      harness.client,
    );

    expect(result).toMatchObject({ exited: true, openCount: 1 });
    expect(harness.requests[1]).toMatchObject({
      method: "DELETE",
      url: "/positions",
    });
  });

  it("skips the exit call when nothing is open", async () => {
    const harness = createHarness();
    harness.enqueue([{ netQty: 0 }]);

    const result = await createSkillRegistry().call(
      "square_off_all",
      {},
      harness.client,
    );

    expect(result).toMatchObject({ exited: false, openCount: 0 });
    expect(harness.requests).toHaveLength(1);
  });

  it("exits a named long position by selling it at market", async () => {
    const harness = createHarness();
    harness.enqueue([
      {
        tradingSymbol: "RELIANCE",
        exchangeSegment: "NSE_EQ",
        productType: "CNC",
        securityId: "2885",
        netQty: 25,
      },
    ]);
    harness.enqueue({ orderId: "order-1" });

    await createSkillRegistry().call(
      "square_off_position",
      { symbol: "reliance", exchangeSegment: "NSE_EQ" },
      harness.client,
    );

    expect(harness.requests[1]).toMatchObject({ method: "POST", url: "/orders" });
    expect(harness.requests[1]?.data).toMatchObject({
      transactionType: "SELL",
      orderType: "MARKET",
      quantity: 25,
      securityId: "2885",
    });
  });

  it("buys back a short position on exit", async () => {
    const harness = createHarness();
    harness.enqueue([
      {
        tradingSymbol: "RELIANCE",
        exchangeSegment: "NSE_EQ",
        productType: "INTRADAY",
        securityId: "2885",
        netQty: -25,
      },
    ]);
    harness.enqueue({ orderId: "order-1" });

    await createSkillRegistry().call(
      "square_off_position",
      { symbol: "RELIANCE", exchangeSegment: "NSE_EQ" },
      harness.client,
    );

    expect(harness.requests[1]?.data).toMatchObject({
      transactionType: "BUY",
      quantity: 25,
    });
  });

  it("errors when the named position is not open", async () => {
    const harness = createHarness();
    harness.enqueue([]);

    await expect(
      createSkillRegistry().call(
        "square_off_position",
        { symbol: "RELIANCE", exchangeSegment: "NSE_EQ" },
        harness.client,
      ),
    ).rejects.toThrow(/No open position found/);
  });
});

describe("scrip master CSV parsing", () => {
  it("parses headers and rows", () => {
    const rows = parseCsv(SCRIP_CSV);

    expect(rows).toHaveLength(2);
    expect(rows[0]).toMatchObject({
      SECURITY_ID: "13",
      SYMBOL_NAME: "NIFTY",
      INSTRUMENT: "INDEX",
    });
  });

  it("respects quoted fields containing commas and escaped quotes", () => {
    const rows = parseCsv('A,B\r\n"x,y","say ""hi"""\r\n');

    expect(rows[0]).toEqual({ A: "x,y", B: 'say "hi"' });
  });

  it("returns nothing for empty input", () => {
    expect(parseCsv("")).toEqual([]);
  });
});
