import type { AxiosInstance } from "axios";

import {
  ApiResponseError,
  DhanClient,
  DhanWS,
  HttpClient,
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
  private readonly handlers = new Map<string, (...args: unknown[]) => void>();
  public readonly sent: string[] = [];
  public closed = false;

  public on(event: string, listener: (...args: unknown[]) => void): void {
    this.handlers.set(event, listener);
  }

  public send(data: string): void {
    this.sent.push(data);
  }

  public close(): void {
    this.closed = true;
  }

  public emit(event: string, ...args: unknown[]): void {
    const handler = this.handlers.get(event);
    if (handler) {
      handler(...args);
    }
  }
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

  it("tracks ws subscriptions and emits ticks", () => {
    const socket = new FakeSocket();
    const ws = new DhanWS({
      token: "token",
      clientId: "client-id",
      webSocketFactory: () => socket,
    });
    const onTick = jest.fn();
    const onOpen = jest.fn();

    ws.on("tick", onTick);
    ws.on("open", onOpen);

    ws.subscribe([{ securityId: "12345", exchangeSegment: "NSE_FNO" }]);
    ws.connect();

    socket.emit("open");

    expect(onOpen).toHaveBeenCalled();
    expect(socket.sent).toEqual([
      JSON.stringify({
        action: "authenticate",
        token: "token",
        clientId: "client-id",
      }),
      JSON.stringify({
        action: "subscribe",
        instruments: [{ securityId: "12345", exchangeSegment: "NSE_FNO" }],
      }),
    ]);

    socket.emit(
      "message",
      JSON.stringify({
        securityId: "12345",
        exchangeSegment: "NSE_FNO",
        ltp: 100.5,
      }),
    );

    expect(onTick).toHaveBeenCalledWith(
      expect.objectContaining({
        securityId: "12345",
        exchangeSegment: "NSE_FNO",
        ltp: 100.5,
      }),
    );
  });
});
