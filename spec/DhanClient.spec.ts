import type { AxiosInstance } from "axios";

import {
  ApiResponseError,
  DhanClient,
  HttpClient,
  MarketFeedWS,
  OrderUpdateWS,
  ValidationError,
} from "../src";

function createAxiosStub() {
  const requests: Array<{
    method?: string;
    url?: string;
    data?: unknown;
    headers?: unknown;
  }> = [];
  const queue: Array<() => Promise<{ data: unknown }>> = [];

  const axiosInstance = {
    request: jest.fn(async (config) => {
      requests.push(config);
      const next = queue.shift();
      if (!next) {
        throw new Error("No response queued");
      }

      return next();
    }),
  } as unknown as AxiosInstance;

  return {
    axiosInstance,
    requests,
    enqueueSuccess(data: unknown) {
      queue.push(async () => ({ data }));
    },
    enqueueFailure(error: Error) {
      queue.push(async () => {
        throw error;
      });
    },
  };
}

class FakeSocket {
  private readonly handlers = new Map<string, Array<(...args: unknown[]) => void>>();
  public readonly sent: string[] = [];
  public closed = false;
  public readonly url?: string;

  constructor(url?: string) {
    this.url = url;
  }

  public on(event: string, listener: (...args: unknown[]) => void): void {
    const existing = this.handlers.get(event) ?? [];
    existing.push(listener);
    this.handlers.set(event, existing);
  }

  public send(data: string | Buffer): void {
    this.sent.push(typeof data === "string" ? data : data.toString("hex"));
  }

  public close(): void {
    this.closed = true;
  }

  public emit(event: string, ...args: unknown[]): void {
    const handlers = this.handlers.get(event);
    if (handlers) {
      for (const handler of handlers) {
        handler(...args);
      }
    }
  }
}

function createFullPacket(options: {
  responseCode?: number;
  exchangeSegmentCode?: number;
  securityId?: number;
  ltp?: number;
}) {
  const buffer = Buffer.alloc(162);
  buffer.writeUInt8(options.responseCode ?? 8, 0);
  buffer.writeInt16LE(162, 1);
  buffer.writeUInt8(options.exchangeSegmentCode ?? 1, 3);
  buffer.writeInt32LE(options.securityId ?? 12345, 4);
  buffer.writeFloatLE(options.ltp ?? 100.5, 8);
  buffer.writeInt16LE(2, 12);
  buffer.writeInt32LE(1711000000, 14);
  buffer.writeFloatLE(100.25, 18);
  buffer.writeInt32LE(5000, 22);
  buffer.writeInt32LE(2000, 26);
  buffer.writeInt32LE(3000, 30);
  buffer.writeInt32LE(100, 34);
  buffer.writeInt32LE(125, 38);
  buffer.writeInt32LE(95, 42);
  buffer.writeFloatLE(99, 46);
  buffer.writeFloatLE(98, 50);
  buffer.writeFloatLE(101, 54);
  buffer.writeFloatLE(97, 58);
  return buffer;
}

describe("DhanClient", () => {
  it("injects correlationId and client id for order placement", async () => {
    const axiosStub = createAxiosStub();
    axiosStub.enqueueSuccess({
      orderId: "order-1",
      orderStatus: "PENDING",
    });

    const client = new DhanClient(
      {
        token: "token",
        clientId: "client-id",
      },
      { axiosInstance: axiosStub.axiosInstance },
    );

    const result = await client.orders.place({
      transactionType: "BUY",
      exchangeSegment: "NSE_FNO",
      productType: "INTRADAY",
      orderType: "MARKET",
      quantity: 10,
      securityId: "12345",
    });

    expect(result.data.orderId).toBe("order-1");
    expect(result.correlationId).toBeTruthy();
    expect(axiosStub.requests[0]).toMatchObject({
      method: "POST",
      url: "/orders",
    });
    expect(axiosStub.requests[0]?.data).toMatchObject({
      dhanClientId: "client-id",
      correlationId: result.correlationId,
    });
  });

  it("preserves caller correlationId on order placement", async () => {
    const axiosStub = createAxiosStub();
    axiosStub.enqueueSuccess({
      orderId: "order-2",
    });

    const client = new DhanClient(
      {
        token: "token",
        clientId: "client-id",
      },
      { axiosInstance: axiosStub.axiosInstance },
    );

    const result = await client.orders.place({
      correlationId: "corr-1",
      transactionType: "BUY",
      exchangeSegment: "NSE_EQ",
      productType: "CNC",
      orderType: "MARKET",
      quantity: 1,
      securityId: "12345",
    });

    expect(result.correlationId).toBe("corr-1");
    expect(axiosStub.requests[0]?.data).toMatchObject({
      correlationId: "corr-1",
    });
  });

  it("rejects invalid order payloads before transport", async () => {
    const axiosStub = createAxiosStub();
    const client = new DhanClient(
      {
        token: "token",
        clientId: "client-id",
      },
      { axiosInstance: axiosStub.axiosInstance },
    );

    await expect(
      client.orders.place({
        transactionType: "BUY",
        exchangeSegment: "NSE_FNO",
        productType: "INTRADAY",
        orderType: "STOP_LOSS",
        quantity: 10,
        securityId: "12345",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
    expect(axiosStub.requests).toHaveLength(0);
  });

  it("retries safe GET requests once on server errors", async () => {
    const axiosStub = createAxiosStub();
    axiosStub.enqueueFailure({
      isAxiosError: true,
      response: {
        status: 503,
        data: { message: "busy" },
      },
      message: "server error",
      name: "AxiosError",
    } as never);
    axiosStub.enqueueSuccess([{ orderId: "order-1" }]);

    const httpClient = new HttpClient(
      {
        token: "token",
        clientId: "client-id",
      },
      { axiosInstance: axiosStub.axiosInstance },
    );

    const response = await httpClient.request<Array<{ orderId: string }>>({
      method: "GET",
      url: "/orders",
      safeToRetry: true,
    });

    expect(response).toEqual([{ orderId: "order-1" }]);
    expect(axiosStub.requests).toHaveLength(2);
  });

  it("does not retry unsafe writes on API failures", async () => {
    const axiosStub = createAxiosStub();
    axiosStub.enqueueFailure({
      isAxiosError: true,
      response: {
        status: 503,
        data: { message: "busy" },
      },
      message: "server error",
      name: "AxiosError",
    } as never);

    const client = new DhanClient(
      {
        token: "token",
        clientId: "client-id",
      },
      { axiosInstance: axiosStub.axiosInstance },
    );

    await expect(
      client.orders.place({
        transactionType: "BUY",
        exchangeSegment: "NSE_FNO",
        productType: "INTRADAY",
        orderType: "MARKET",
        quantity: 10,
        securityId: "12345",
      }),
    ).rejects.toBeInstanceOf(ApiResponseError);

    expect(axiosStub.requests).toHaveLength(1);
  });

  it("tracks market feed subscriptions and updates ltp store", () => {
    const socket = new FakeSocket();
    const market = new MarketFeedWS(
      {
        token: "token",
        clientId: "client-id",
        webSocketFactory: () => socket,
      },
      clientLtpStore(),
    );
    const onTick = jest.fn();
    const onOpen = jest.fn();

    market.on("tick", onTick);
    market.on("open", onOpen);

    market.subscribe([{ securityId: "12345", exchangeSegment: "NSE_FNO" }]);
    market.connect();

    socket.emit("open");

    expect(onOpen).toHaveBeenCalled();
    expect(JSON.parse(socket.sent[0] ?? "")).toEqual({
      RequestCode: 21,
      InstrumentCount: 1,
      InstrumentList: [{ SecurityId: "12345", ExchangeSegment: "NSE_FNO" }],
    });

    socket.emit("message", createFullPacket({ securityId: 12345, ltp: 100.5 }));

    expect(onTick).toHaveBeenCalledWith(
      expect.objectContaining({
        type: "full",
        securityId: "12345",
        exchangeSegment: "NSE_FNO",
        ltp: 100.5,
      }),
    );
  });

  it("authenticates order update ws and stores events", () => {
    const socket = new FakeSocket();
    const orderStore = clientOrderStore();
    const orders = new OrderUpdateWS({
      token: "token",
      clientId: "client-id",
      webSocketFactory: () => socket,
    }, orderStore);
    const onOrder = jest.fn();
    const onOpen = jest.fn();

    orders.on("order", onOrder);
    orders.on("open", onOpen);

    orders.connect();

    socket.emit("open");

    expect(onOpen).toHaveBeenCalled();
    expect(socket.sent).toEqual([
      JSON.stringify({
        LoginReq: {
          MsgCode: 42,
          ClientId: "client-id",
          Token: "token",
        },
        UserType: "SELF",
      }),
    ]);

    socket.emit(
      "message",
      JSON.stringify({
        Type: "order_alert",
        Data: {
          OrderNo: "order-1",
          CorrelationId: "corr-1",
          Status: "TRADED",
          TradedQty: 10,
          AvgTradedPrice: 100.5,
          SecurityId: "12345",
        },
      }),
    );

    expect(onOrder).toHaveBeenCalledWith(
      expect.objectContaining({
        orderId: "order-1",
        correlationId: "corr-1",
        status: "TRADED",
      }),
    );
    expect(orderStore.getByOrderId("order-1")).toEqual(
      expect.objectContaining({
        correlationId: "corr-1",
        status: "TRADED",
      }),
    );
  });
});

function clientLtpStore() {
  const { LTPStore } = require("../src");
  return new LTPStore();
}

function clientOrderStore() {
  const { OrderStore } = require("../src");
  return new OrderStore();
}
