import type { AxiosInstance } from "axios";

import { HttpClient } from "../src/client/HttpClient";
import { RateLimiter } from "../src/client/RateLimiter";
import { Orders } from "../src/resources/Orders";
import { OptionChain } from "../src/resources/OptionChain";

function createAxiosStub() {
  const axiosInstance = {
    request: jest.fn(async () => ({ data: {} })),
  } as unknown as AxiosInstance;

  return axiosInstance;
}

function createSpyRateLimiter() {
  const calls: Array<{ kind: "read" | "write" | "tier"; tier?: string; isWrite?: boolean }> = [];

  const rateLimiter = {
    scheduleRead: jest.fn((task: () => Promise<unknown>) => {
      calls.push({ kind: "read" });
      return task();
    }),
    scheduleWrite: jest.fn((task: () => Promise<unknown>) => {
      calls.push({ kind: "write" });
      return task();
    }),
    scheduleTier: jest.fn((tier: string, isWrite: boolean, task: () => Promise<unknown>) => {
      calls.push({ kind: "tier", tier, isWrite });
      return task();
    }),
  } as unknown as RateLimiter;

  return { rateLimiter, calls };
}

function createHttpClient(rateLimiter: RateLimiter) {
  return new HttpClient(
    { clientId: "client", token: "token" },
    { axiosInstance: createAxiosStub(), rateLimiter },
  );
}

describe("tiered rate limiting — resource wiring", () => {
  it("tags option chain fetch and expiryList as the option_chain tier", async () => {
    const { rateLimiter, calls } = createSpyRateLimiter();
    const optionChain = new OptionChain(createHttpClient(rateLimiter));

    await optionChain.fetch({
      underlyingScrip: 13,
      underlyingSeg: "IDX_I",
      expiry: "2026-08-28",
    });
    await optionChain.expiryList({ underlyingScrip: 13, underlyingSeg: "IDX_I" });

    expect(calls).toEqual([
      { kind: "tier", tier: "option_chain", isWrite: true },
      { kind: "tier", tier: "option_chain", isWrite: true },
    ]);
  });

  it("tags every Orders call as the order_api tier, GETs included", async () => {
    const { rateLimiter, calls } = createSpyRateLimiter();
    const orders = new Orders(createHttpClient(rateLimiter));

    await orders.list();
    await orders.getById("1");
    await orders.cancel("1");

    expect(calls).toEqual([
      { kind: "tier", tier: "order_api", isWrite: false },
      { kind: "tier", tier: "order_api", isWrite: false },
      { kind: "tier", tier: "order_api", isWrite: true },
    ]);
  });

  it("leaves untagged requests on the generic read/write queue", async () => {
    const { rateLimiter, calls } = createSpyRateLimiter();
    const httpClient = createHttpClient(rateLimiter);

    await httpClient.request({ method: "GET", url: "/profile" });
    await httpClient.request({ method: "POST", url: "/whatever" });

    expect(calls).toEqual([{ kind: "read" }, { kind: "write" }]);
  });
});

describe("RateLimiter — actual throttling", () => {
  it("spaces same-tier calls at least 1000/perSecond ms apart (order_api: 100ms)", async () => {
    const rateLimiter = new RateLimiter();
    const timestamps: number[] = [];
    const record = async () => {
      timestamps.push(Date.now());
    };

    await Promise.all([
      rateLimiter.scheduleTier("order_api", true, record),
      rateLimiter.scheduleTier("order_api", true, record),
      rateLimiter.scheduleTier("order_api", true, record),
    ]);

    expect(timestamps[1] - timestamps[0]).toBeGreaterThanOrEqual(95);
    expect(timestamps[2] - timestamps[1]).toBeGreaterThanOrEqual(95);
  }, 10000);

  it("does not let one tier block another running concurrently", async () => {
    const rateLimiter = new RateLimiter();
    const start = Date.now();

    // order_api is 100ms/call; option_chain is 3000ms/call. A single call on
    // each, run concurrently, should both land near `start`, not summed.
    const [orderAt, chainAt] = await Promise.all([
      rateLimiter.scheduleTier("order_api", true, async () => Date.now()),
      rateLimiter.scheduleTier("option_chain", true, async () => Date.now()),
    ]);

    // Generous bound for CI jitter — the point is "nowhere near 3000ms",
    // i.e. option_chain isn't queued behind order_api or vice versa.
    expect(orderAt - start).toBeLessThan(1000);
    expect(chainAt - start).toBeLessThan(1000);
  });
});
