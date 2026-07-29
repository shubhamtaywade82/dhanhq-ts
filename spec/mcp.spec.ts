import type { AxiosInstance } from "axios";
import { Writable } from "stream";

import {
  AgentToolRegistry,
  DhanClient,
  McpServer,
  Policy,
  portfolioSummary,
  riskReport,
  systemPrompt,
} from "../src";

function createHarness(policy = Policy.readOnly()) {
  const queue: Array<() => Promise<{ data: unknown }>> = [];
  const requests: Array<{ method?: string; url?: string }> = [];

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

  const written: string[] = [];
  const output = new Writable({
    write(chunk, _encoding, callback) {
      written.push(String(chunk));
      callback();
    },
  });

  const server = new McpServer({
    client,
    registry: new AgentToolRegistry({ client, policy }),
    output,
    toolCallTimeoutMs: 1000,
  });

  return {
    server,
    requests,
    enqueue(data: unknown) {
      queue.push(async () => ({ data }));
    },
    /** Sends one request and returns the parsed response. */
    async send(
      method: string,
      params: Record<string, unknown> = {},
      id: number | string = 1,
    ) {
      return this.sendRaw({ jsonrpc: "2.0", id, method, params });
    },

    /** Sends an arbitrary payload — for malformed or id-less requests. */
    async sendRaw(payload: unknown) {
      written.length = 0;
      await server.handleLine(JSON.stringify(payload));
      return written.length === 0 ? undefined : JSON.parse(written[0]);
    },
  };
}

describe("McpServer", () => {
  it("negotiates a supported protocol version", async () => {
    const harness = createHarness();

    const supported = await harness.send("initialize", {
      protocolVersion: "2024-11-05",
    });
    expect(supported.result.protocolVersion).toBe("2024-11-05");

    // An unknown version falls back to the newest one this server speaks.
    const unsupported = await harness.send("initialize", {
      protocolVersion: "1999-01-01",
    });
    expect(unsupported.result.protocolVersion).toBe("2025-06-18");
    expect(unsupported.result.serverInfo.name).toBe("dhanhq-ts");
  });

  it("lists tools with their risk level prefixed", async () => {
    const response = await createHarness().send("tools/list");
    const tools = response.result.tools as Array<{
      name: string;
      description: string;
      inputSchema: unknown;
    }>;

    const profile = tools.find((tool) => tool.name === "dhan_profile");
    expect(profile?.description).toMatch(/^\[read_only\]/);
    expect(profile?.inputSchema).toHaveProperty("type", "object");
  });

  it("calls a tool and returns its result as text content", async () => {
    const harness = createHarness();
    harness.enqueue({ dhanClientId: "client-id" });

    const response = await harness.send("tools/call", {
      name: "dhan_profile",
      arguments: {},
    });

    expect(response.result.isError).toBeUndefined();
    expect(JSON.parse(response.result.content[0].text)).toEqual({
      dhanClientId: "client-id",
    });
  });

  it("reports a refused tool call in-band rather than as a JSON-RPC error", async () => {
    const harness = createHarness(new Policy({ scopes: ["market:read"] }));

    const response = await harness.send("tools/call", {
      name: "dhan_profile",
      arguments: {},
    });

    expect(response.error).toBeUndefined();
    expect(response.result.isError).toBe(true);
    expect(response.result.content[0].text).toMatch(/Agent scope required/);
  });

  it("reports a blocked write as a tool error, not a placed order", async () => {
    const harness = createHarness(Policy.full());

    const response = await harness.send("tools/call", {
      name: "dhan_place_order",
      arguments: {
        transactionType: "BUY",
        exchangeSegment: "NSE_EQ",
        productType: "CNC",
        orderType: "MARKET",
        securityId: "2885",
        quantity: 1,
      },
    });

    expect(response.result.isError).toBe(true);
    expect(response.result.content[0].text).toMatch(/LIVE_TRADING/);
    expect(harness.requests).toHaveLength(0);
  });

  it("rejects tools/call without a tool name", async () => {
    const response = await createHarness().send("tools/call", {});

    expect(response.error.code).toBe(-32602);
  });

  it("lists and reads resources", async () => {
    const harness = createHarness();

    const list = await harness.send("resources/list");
    expect(list.result.resources.map((r: { uri: string }) => r.uri)).toContain(
      "dhanhq://account/positions",
    );

    harness.enqueue([{ tradingSymbol: "RELIANCE", netQty: 10 }]);
    const read = await harness.send("resources/read", {
      uri: "dhanhq://account/positions",
    });

    expect(read.result.contents[0].mimeType).toBe("application/json");
    expect(JSON.parse(read.result.contents[0].text)).toEqual([
      { tradingSymbol: "RELIANCE", netQty: 10 },
    ]);
  });

  it("serves the capability manifest as a resource without an API call", async () => {
    const harness = createHarness();

    const read = await harness.send("resources/read", {
      uri: "dhanhq://market/capabilities",
    });

    expect(JSON.parse(read.result.contents[0].text)).toMatchObject({
      writeEnabled: false,
    });
    expect(harness.requests).toHaveLength(0);
  });

  it("errors on an unknown resource", async () => {
    const response = await createHarness().send("resources/read", {
      uri: "dhanhq://nope",
    });

    expect(response.error.code).toBe(-32602);
    expect(response.error.message).toMatch(/Unknown resource/);
  });

  it("lists prompts and renders the portfolio summary", async () => {
    const harness = createHarness();

    const list = await harness.send("prompts/list");
    expect(list.result.prompts.map((p: { name: string }) => p.name)).toEqual(
      expect.arrayContaining(["portfolio_summary", "risk_report"]),
    );

    harness.enqueue([{ tradingSymbol: "RELIANCE", totalQty: 10, avgCostPrice: 2500 }]);
    harness.enqueue([]);
    harness.enqueue({ availabelBalance: 50_000 });

    const prompt = await harness.send("prompts/get", {
      name: "portfolio_summary",
    });

    const text = prompt.result.messages[0].content.text as string;
    expect(text).toContain("Portfolio Summary");
    expect(text).toContain("RELIANCE");
  });

  it("errors on an unknown prompt", async () => {
    const response = await createHarness().send("prompts/get", { name: "nope" });

    expect(response.error.code).toBe(-32602);
  });

  it("errors on an unknown method", async () => {
    const response = await createHarness().send("nope/nope");

    expect(response.error.code).toBe(-32601);
  });

  it("returns a parse error for malformed JSON", async () => {
    const harness = createHarness();
    const response = await harness.send("ping");
    expect(response.result).toEqual({});

    // Reuse the harness's writable by driving handleLine directly.
    await expect(harness.server.handleLine("{not json")).resolves.toBeUndefined();
  });

  it("stays silent for notifications, which carry no id", async () => {
    const harness = createHarness();

    // JSON-RPC forbids responding to a request without an id.
    const response = await harness.sendRaw({
      jsonrpc: "2.0",
      method: "notifications/initialized",
    });

    expect(response).toBeUndefined();
  });
});

describe("prompt helpers", () => {
  it("summarizes funds, holdings and only open positions", () => {
    const text = portfolioSummary({
      holdings: [{ tradingSymbol: "TCS", totalQty: 5, avgCostPrice: 3000 }],
      positions: [
        { tradingSymbol: "RELIANCE", netQty: 10, costPrice: 2500 },
        { tradingSymbol: "INFY", netQty: 0 },
      ],
      funds: { availabelBalance: 100_000, utilizedAmount: 25_000 },
    });

    expect(text).toContain("Holdings (1)");
    expect(text).toContain("Open Positions (1)");
    expect(text).toContain("RELIANCE");
    expect(text).not.toContain("INFY");
  });

  it("sums P&L across all positions but counts only open ones", () => {
    const text = riskReport({
      positions: [
        { netQty: 10, unrealizedProfit: -500, realizedProfit: 200 },
        { netQty: 0, unrealizedProfit: 0, realizedProfit: 800 },
      ],
      dailyLossLimit: 50_000,
    });

    expect(text).toContain("Total Unrealized P&L: ₹-500.00");
    expect(text).toContain("Total Realized P&L: ₹1000.00");
    expect(text).toContain("Open Positions: 1");
    expect(text).toContain("Daily Loss Limit: ₹50000");
  });

  it("lists extra capabilities in the system prompt when given", () => {
    expect(systemPrompt(["dhan_skill_straddle"])).toContain(
      "- dhan_skill_straddle",
    );
    expect(systemPrompt()).not.toContain("Additional capabilities");
  });
});
