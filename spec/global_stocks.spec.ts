import type { AxiosInstance } from "axios";

import {
  AgentToolRegistry,
  DhanClient,
  globalPlaceOrderSchema,
  Policy,
  ValidationError,
} from "../src";

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

  return {
    requests,
    client: new DhanClient(
      { token: "token", clientId: "client-id" },
      { axiosInstance },
    ),
    enqueue(data: unknown) {
      queue.push(async () => ({ data }));
    },
  };
}

const validOrder = {
  transactionType: "BUY" as const,
  orderType: "LIMIT" as const,
  securityId: "AAPL",
  quantity: 1,
  price: 190,
};

describe("Global Stocks order contract", () => {
  it("accepts a fractional-share limit order", () => {
    expect(() =>
      globalPlaceOrderSchema.parse({ ...validOrder, quantity: 0.25 }),
    ).not.toThrow();
  });

  it("requires quantity unless the order type is AMOUNT", () => {
    expect(() =>
      globalPlaceOrderSchema.parse({
        transactionType: "BUY",
        orderType: "MARKET",
        securityId: "AAPL",
      }),
    ).toThrow(/quantity is required/);
  });

  it("requires amount for AMOUNT orders and accepts it without quantity", () => {
    expect(() =>
      globalPlaceOrderSchema.parse({
        transactionType: "BUY",
        orderType: "AMOUNT",
        securityId: "AAPL",
      }),
    ).toThrow(/amount is required/);

    expect(() =>
      globalPlaceOrderSchema.parse({
        transactionType: "BUY",
        orderType: "AMOUNT",
        securityId: "AAPL",
        amount: 100,
      }),
    ).not.toThrow();
  });

  it("requires a price for LIMIT and a trigger for STOP_LOSS", () => {
    expect(() =>
      globalPlaceOrderSchema.parse({ ...validOrder, price: undefined }),
    ).toThrow(/price must be greater than 0/);

    expect(() =>
      globalPlaceOrderSchema.parse({
        ...validOrder,
        orderType: "STOP_LOSS_MARKET",
        price: undefined,
      }),
    ).toThrow(/triggerPrice is required/);
  });

  it("keeps bracket levels on the correct side of a BUY entry", () => {
    expect(() =>
      globalPlaceOrderSchema.parse({ ...validOrder, targetPrice: 180 }),
    ).toThrow(/targetPrice must be greater than price/);

    expect(() =>
      globalPlaceOrderSchema.parse({ ...validOrder, stopLossPrice: 200 }),
    ).toThrow(/stopLossPrice must be less than price/);

    expect(() =>
      globalPlaceOrderSchema.parse({
        ...validOrder,
        targetPrice: 205,
        stopLossPrice: 180,
      }),
    ).not.toThrow();
  });

  it("inverts those bracket rules for a SELL entry", () => {
    const sell = { ...validOrder, transactionType: "SELL" as const };

    expect(() =>
      globalPlaceOrderSchema.parse({ ...sell, targetPrice: 205 }),
    ).toThrow(/targetPrice must be less than price/);

    expect(() =>
      globalPlaceOrderSchema.parse({ ...sell, stopLossPrice: 180 }),
    ).toThrow(/stopLossPrice must be greater than price/);

    expect(() =>
      globalPlaceOrderSchema.parse({
        ...sell,
        targetPrice: 180,
        stopLossPrice: 205,
      }),
    ).not.toThrow();
  });

  it("enforces the 30-character correlation id limit", () => {
    expect(() =>
      globalPlaceOrderSchema.parse({
        ...validOrder,
        correlationId: "x".repeat(31),
      }),
    ).toThrow();
  });
});

describe("Global Stocks resources", () => {
  it("posts to the globalstocks order path with a short correlation id", async () => {
    const harness = createHarness();
    harness.enqueue({ orderId: "gs-1" });

    const result = await harness.client.globalStocks.orders.place(validOrder);

    expect(harness.requests[0]).toMatchObject({
      method: "POST",
      url: "/globalstocks/orders",
    });
    expect(result.data.orderId).toBe("gs-1");
    // The API caps correlationId at 30 chars, so a raw 36-char UUID would be
    // rejected.
    expect(result.correlationId).toHaveLength(30);
    expect(result.correlationId).toMatch(/^[a-f0-9]{30}$/);
  });

  it("rejects an invalid order before transport", async () => {
    const harness = createHarness();

    await expect(
      harness.client.globalStocks.orders.place({
        ...validOrder,
        targetPrice: 100,
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(harness.requests).toHaveLength(0);
  });

  it("sends price and quantity as strings to the estimator", async () => {
    const harness = createHarness();
    harness.enqueue({ totalMargin: 380 });

    await harness.client.globalStocks.margin.calculate({
      securityId: "AAPL",
      transactionType: "BUY",
      price: 190,
      quantity: 2,
    });

    // Whole numbers go without a decimal part.
    expect(harness.requests[0]?.data).toMatchObject({
      price: "190",
      quantity: "2",
    });
  });

  it("keeps the fractional part when quantity is not whole", async () => {
    const harness = createHarness();
    harness.enqueue({ totalMargin: 95 });

    await harness.client.globalStocks.margin.calculate({
      securityId: "AAPL",
      transactionType: "BUY",
      price: 190.5,
      quantity: 0.5,
    });

    expect(harness.requests[0]?.data).toMatchObject({
      price: "190.5",
      quantity: "0.5",
    });
  });

  it("combines charges and margin into one affordability decision", async () => {
    const harness = createHarness();
    harness.enqueue({ brokerage: 2, orderCharges: 1, gst: 0.5 });
    harness.enqueue({ totalMargin: 380, availableBal: 500 });

    const summary = await harness.client.globalStocks.costSummary({
      securityId: "AAPL",
      transactionType: "BUY",
      price: 190,
      quantity: 2,
    });

    expect(summary).toEqual({
      totalCharges: 3.5,
      brokerage: 2,
      totalMargin: 380,
      availableBalance: 500,
      sufficient: true,
    });
  });

  it("reports insufficient balance when margin exceeds available cash", async () => {
    const harness = createHarness();
    harness.enqueue({ brokerage: 2 });
    harness.enqueue({ totalMargin: 900, availableBal: 500 });

    const summary = await harness.client.globalStocks.costSummary({
      securityId: "AAPL",
      transactionType: "BUY",
      price: 450,
      quantity: 2,
    });

    expect(summary.sufficient).toBe(false);
  });

  it("reads market status and holdings from the globalstocks paths", async () => {
    const harness = createHarness();
    harness.enqueue({ status: "open" });
    harness.enqueue([{ tradingSymbol: "AAPL", currentValue: 380 }]);

    await expect(
      harness.client.globalStocks.marketStatus.isOpen(),
    ).resolves.toBe(true);
    await expect(
      harness.client.globalStocks.holdings.totalCurrentValue(),
    ).resolves.toBe(380);

    expect(harness.requests.map((r) => r.url)).toEqual([
      "/globalstocks/marketstatus",
      "/globalstocks/holdings",
    ]);
  });
});

describe("Global Stocks and trader control tools", () => {
  function registry(policy = Policy.full()) {
    const harness = createHarness();
    return {
      harness,
      registry: new AgentToolRegistry({ client: harness.client, policy }),
    };
  }

  it("registers separate tools for the US book", () => {
    const names = registry().registry.names();

    expect(names).toEqual(
      expect.arrayContaining([
        "dhan_global_holdings",
        "dhan_global_funds",
        "dhan_global_orders",
        "dhan_global_trades",
        "dhan_global_market_status",
        "dhan_global_order_estimate",
        "dhan_global_place_order",
        "dhan_global_modify_order",
        "dhan_global_cancel_order",
      ]),
    );
  });

  it("keeps the US and domestic holdings tools distinct", async () => {
    const { harness, registry: tools } = registry();
    harness.enqueue([{ tradingSymbol: "AAPL" }]);

    await tools.execute("dhan_global_holdings");

    // Never /holdings, which is the INR book.
    expect(harness.requests[0]?.url).toBe("/globalstocks/holdings");
  });

  it("puts the kill switch on risk:write, not orders:write", () => {
    const tools = registry().registry;
    const killSwitch = tools.list().find((t) => t.name === "dhan_kill_switch");

    expect(killSwitch).toMatchObject({
      scope: "risk:write",
      risk: "destructive_write",
    });

    // An agent that may trade cannot disarm the account's safety rails.
    const trader = new AgentToolRegistry({
      client: createHarness().client,
      policy: new Policy({ scopes: ["orders:write"], writesEnabled: true }),
    });

    return expect(
      trader.execute("dhan_kill_switch", { killSwitchStatus: "ACTIVATE" }),
    ).rejects.toThrow(/Agent scope required: risk:write/);
  });

  it("exposes P&L exit controls under risk:write", () => {
    const tools = registry().registry.list();

    expect(tools.find((t) => t.name === "dhan_set_pnl_exit")).toMatchObject({
      scope: "risk:write",
      risk: "live_write",
    });
    expect(tools.find((t) => t.name === "dhan_pnl_exit_status")).toMatchObject({
      scope: "portfolio:read",
      risk: "read_only",
    });
  });

  it("still gates US writes behind the live-trading flag", async () => {
    const { harness, registry: tools } = registry();

    await expect(
      tools.execute("dhan_global_place_order", validOrder),
    ).rejects.toThrow(/LIVE_TRADING/);
    expect(harness.requests).toHaveLength(0);
  });
});
