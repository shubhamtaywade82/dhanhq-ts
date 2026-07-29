import type { AxiosInstance } from "axios";

import {
  AgentToolRegistry,
  createSkillRegistry,
  DhanClient,
  LiveTradingDisabledError,
  Policy,
  previewOrder,
  ToolSchemas,
  Workflow,
} from "../src";

/**
 * Queue-backed axios stub. The SDK issues requests in a fixed order per call
 * path, so responses are queued rather than routed by URL.
 */
function createAxiosStub() {
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
    axiosInstance,
    requests,
    enqueue(data: unknown) {
      queue.push(async () => ({ data }));
    },
  };
}

function createClient(axiosInstance: AxiosInstance): DhanClient {
  return new DhanClient(
    { token: "token", clientId: "client-id" },
    { axiosInstance },
  );
}

describe("Policy", () => {
  it("defaults to read-only scopes from the environment", () => {
    const policy = Policy.fromEnv({} as NodeJS.ProcessEnv);

    expect(policy.allows("market:read")).toBe(true);
    expect(policy.allows("orders:write")).toBe(false);
  });

  it("parses comma and space separated scopes", () => {
    const policy = Policy.fromEnv({
      DHANHQ_AGENT_SCOPES: "market:read, orders:write orders:cancel",
    } as NodeJS.ProcessEnv);

    expect(policy.scopes).toEqual([
      "market:read",
      "orders:write",
      "orders:cancel",
    ]);
  });

  it("rejects unknown scopes", () => {
    expect(
      () => new Policy({ scopes: ["orders:delete" as never] }),
    ).toThrow(/Unknown agent scopes/);
  });

  it("throws on a scope the policy does not hold", () => {
    expect(() => Policy.readOnly().require("orders:write")).toThrow(
      /Agent scope required/,
    );
  });

  it("keeps writes closed unless both env flags are set", () => {
    const policy = Policy.full();

    expect(policy.writesEnabled({} as NodeJS.ProcessEnv)).toBe(false);
    expect(
      policy.writesEnabled({
        DHANHQ_MCP_ENABLE_WRITES: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(false);
    expect(
      policy.writesEnabled({
        DHANHQ_MCP_ENABLE_WRITES: "true",
        LIVE_TRADING: "true",
      } as NodeJS.ProcessEnv),
    ).toBe(true);
  });

  it("requires the live-trading gate for writes even with the scope held", () => {
    const policy = Policy.full();

    expect(() =>
      policy.requireWrite("orders:write", {} as NodeJS.ProcessEnv),
    ).toThrow(LiveTradingDisabledError);
  });

  it("honours an explicit writesEnabled override", () => {
    const policy = new Policy({
      scopes: ["orders:write"],
      writesEnabled: true,
    });

    expect(policy.requireWrite("orders:write", {} as NodeJS.ProcessEnv)).toBe(
      true,
    );
  });
});

describe("AgentToolRegistry", () => {
  function registry(policy = Policy.full()) {
    const stub = createAxiosStub();
    return {
      stub,
      registry: new AgentToolRegistry({
        client: createClient(stub.axiosInstance),
        policy,
      }),
    };
  }

  it("registers primitives, analysis tools and one tool per skill", () => {
    const { registry: tools } = registry();
    const names = tools.names();

    expect(names).toEqual(expect.arrayContaining(["dhan_profile", "dhan_funds"]));
    expect(names).toEqual(
      expect.arrayContaining(["dhan_technical_analysis", "dhan_market_bias"]),
    );
    expect(names).toEqual(
      expect.arrayContaining([
        "dhan_skill_iron_condor",
        "dhan_skill_square_off_all",
      ]),
    );

    // One tool per builtin skill, and no skill left unexposed.
    const skillTools = names.filter((name) => name.startsWith("dhan_skill_"));
    expect(skillTools).toHaveLength(createSkillRegistry().names().length);
  });

  it("gives every tool a scope, risk level and input schema", () => {
    const { registry: tools } = registry();

    for (const tool of tools.list()) {
      expect(tool.scope).toBeTruthy();
      expect(tool.risk).toBeTruthy();
      expect(tool.inputSchema).toHaveProperty("type", "object");
      expect(tool.version).toBe("1.0.0");
    }
  });

  it("dispatches a read tool through to the API", async () => {
    const { stub, registry: tools } = registry();
    stub.enqueue({ dhanClientId: "client-id" });

    await expect(tools.execute("dhan_profile")).resolves.toEqual({
      dhanClientId: "client-id",
    });
    expect(stub.requests[0]).toMatchObject({ method: "GET", url: "/profile" });
  });

  it("refuses a read tool whose scope the policy lacks", async () => {
    const { registry: tools } = registry(new Policy({ scopes: ["market:read"] }));

    await expect(tools.execute("dhan_profile")).rejects.toThrow(
      /Agent scope required/,
    );
  });

  it("refuses a write tool while the live-trading gate is closed", async () => {
    const { stub, registry: tools } = registry();

    await expect(
      tools.execute("dhan_place_order", {
        transactionType: "BUY",
        exchangeSegment: "NSE_EQ",
        productType: "CNC",
        orderType: "MARKET",
        securityId: "2885",
        quantity: 1,
      }),
    ).rejects.toThrow(LiveTradingDisabledError);

    // Nothing reached the network.
    expect(stub.requests).toHaveLength(0);
  });

  it("rejects an unknown tool name", async () => {
    const { registry: tools } = registry();

    await expect(tools.execute("dhan_nope")).rejects.toThrow(/Unknown DhanHQ/);
  });

  it("hides write tools from availableTools while the gate is closed", () => {
    const { registry: tools } = registry();
    const available = tools.availableTools().map((tool) => tool.name);

    expect(available).toContain("dhan_profile");
    expect(available).not.toContain("dhan_place_order");
    expect(available).not.toContain("dhan_cancel_order");
  });

  it("reports capabilities including the write gate state", () => {
    const { registry: tools } = registry();
    const capabilities = tools.capabilities();

    expect(capabilities.toolCount).toBe(tools.list().length);
    expect(capabilities.writeEnabled).toBe(false);
    expect(capabilities.riskLevels).toEqual(
      expect.arrayContaining(["read_only", "live_write"]),
    );
    expect(capabilities.skills).toContain("straddle");
  });
});

describe("order preview", () => {
  it("accepts a well-formed order and flags the missing correlation id", async () => {
    const preview = await previewOrder({
      transactionType: "BUY",
      exchangeSegment: "NSE_EQ",
      productType: "CNC",
      orderType: "MARKET",
      securityId: "2885",
      quantity: 10,
    });

    expect(preview.valid).toBe(true);
    expect(preview.warnings).toContain(
      "correlationId is recommended for agent-originated orders",
    );
    expect(preview.summary).toBe("BUY 10 of NSE_EQ:2885 as MARKET");
  });

  it("reports contract violations without throwing", async () => {
    const preview = await previewOrder({
      transactionType: "BUY",
      exchangeSegment: "NSE_EQ",
      productType: "CNC",
      orderType: "LIMIT",
      securityId: "2885",
      quantity: 10,
    });

    expect(preview.valid).toBe(false);
    expect(preview.errors.join(" ")).toMatch(/price is required/);
  });

  it("names the env flags a live order would need", async () => {
    const preview = await previewOrder({ quantity: 1 });

    expect(preview.requires).toEqual([
      "orders:write",
      "DHANHQ_MCP_ENABLE_WRITES",
      "LIVE_TRADING",
    ]);
  });
});

describe("skill input schemas", () => {
  it("translates skill params into JSON Schema with required fields", () => {
    const schema = ToolSchemas.skillInputSchema({
      symbol: { type: "string", required: true, description: "Index symbol" },
      quantity: { type: "integer", default: 50 },
    });

    expect(schema).toMatchObject({
      type: "object",
      required: ["symbol"],
      additionalProperties: false,
      properties: {
        symbol: { type: "string", description: "Index symbol" },
        quantity: { type: "integer", default: 50 },
      },
    });
  });
});

describe("Workflow", () => {
  it("runs steps in priority order and threads the context", async () => {
    const workflow = new Workflow<{ trail: string[] }>("test")
      .step("second", (ctx) => ({ trail: [...ctx.trail, "second"] }), 20)
      .step("first", (ctx) => ({ trail: [...ctx.trail, "first"] }), 1);

    await expect(workflow.call({ trail: [] })).resolves.toEqual({
      trail: ["first", "second"],
    });
  });

  it("reports which step failed instead of surfacing a bare error", async () => {
    const workflow = new Workflow<{ trail: string[] }>()
      .step("ok", (ctx) => ({ trail: [...ctx.trail, "ok"] }), 1)
      .step(
        "boom",
        () => {
          throw new Error("step failed");
        },
        2,
      );

    const result = await workflow.run({ trail: [] });

    expect(result.ok).toBe(false);
    if (!result.ok) {
      expect(result.failedStep).toBe("boom");
      expect(result.completed).toEqual(["ok"]);
    }
  });
});
