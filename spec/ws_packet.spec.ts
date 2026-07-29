import {
  BaseWS,
  MarketDepthWS,
  parseMarketDepth20Packet,
  parseMarketDepth200Packet,
  parseMarketFeedPacket,
  splitPackets,
} from "../src";

function createTickerPacket() {
  const buffer = Buffer.alloc(16);
  buffer.writeUInt8(2, 0);
  buffer.writeInt16LE(16, 1);
  buffer.writeUInt8(1, 3);
  buffer.writeInt32LE(12345, 4);
  buffer.writeFloatLE(100.5, 8);
  buffer.writeInt32LE(1711000000, 12);
  return buffer;
}

function createDepth20Packet(respCode = 41) {
  // 12 byte header + 1 level (16 bytes) = 28 bytes
  const buffer = Buffer.alloc(28);
  buffer.writeInt16LE(28, 0);
  buffer.writeUInt8(respCode, 2); // 41=Bid, 51=Ask
  buffer.writeUInt8(1, 3); // NSE_EQ
  buffer.writeInt32LE(1333, 4); // HDFC Bank
  buffer.writeUInt32LE(0, 8); // seq

  buffer.writeDoubleLE(750.35, 12);
  buffer.writeUInt32LE(100, 20);
  buffer.writeUInt32LE(5, 24);
  return buffer;
}

function createDepth200Packet(respCode = 51) {
  const buffer = Buffer.alloc(28);
  buffer.writeInt16LE(28, 0);
  buffer.writeUInt8(respCode, 2);
  buffer.writeUInt8(1, 3);
  buffer.writeInt32LE(11536, 4); // RELIANCE
  buffer.writeUInt32LE(200, 8); // rowCount

  buffer.writeDoubleLE(2443.5, 12);
  buffer.writeUInt32LE(500, 20);
  buffer.writeUInt32LE(12, 24);
  return buffer;
}

describe("ws packet parsing", () => {
  it("splits stacked packets by header length", () => {
    const first = createTickerPacket();
    const second = createTickerPacket();
    const stacked = Buffer.concat([first, second]);

    const packets = splitPackets(stacked);

    expect(packets).toHaveLength(2);
    expect(packets[0]).toEqual(first);
    expect(packets[1]).toEqual(second);
  });

  it("parses ticker packets against active subscriptions", () => {
    const packet = createTickerPacket();

    const parsed = parseMarketFeedPacket(packet, [
      {
        securityId: "12345",
        exchangeSegment: "NSE_FNO",
        mode: "full",
      },
    ]);

    expect(parsed).toEqual(
      expect.objectContaining({
        type: "ticker",
        securityId: "12345",
        exchangeSegment: "NSE_FNO",
        ltp: 100.5,
      }),
    );
  });

  it("parses 20-level market depth packets with float64 prices and uint32 qtys", () => {
    const packet = createDepth20Packet(41);
    const parsed = parseMarketDepth20Packet(packet);

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(
      expect.objectContaining({
        type: "depth-20-bid",
        securityId: "1333",
        exchangeSegment: "NSE_EQ",
        levels: [
          {
            price: 750.35,
            qty: 100,
            orders: 5,
          },
        ],
      }),
    );
  });

  it("parses 200-level market depth packets correctly", () => {
    const packet = createDepth200Packet(51);
    const parsed = parseMarketDepth200Packet(packet);

    expect(parsed).toHaveLength(1);
    expect(parsed[0]).toEqual(
      expect.objectContaining({
        type: "depth-200-ask",
        securityId: "11536",
        exchangeSegment: "NSE_EQ",
        numRows: 200,
        levels: [
          {
            price: 2443.5,
            qty: 500,
            orders: 12,
          },
        ],
      }),
    );
  });
});

class TestBaseWS extends BaseWS {
  public openCalled = false;
  protected onOpen(): void {
    this.openCalled = true;
  }
  protected onMessage(): void {}
  protected onClose(): void {}
}

describe("BaseWS resilience & reconnect backoff", () => {
  it("stops reconnecting when maxReconnectAttempts is reached", (done) => {
    let attempted = 0;
    const socketMock = {
      on: (event: string, cb: (...args: unknown[]) => void) => {
        if (event === "close") {
          setTimeout(cb, 1);
        }
      },
      send: () => {},
      close: () => {},
    };

    const ws = new TestBaseWS(
      () => {
        attempted++;
        return "wss://test";
      },
      10, // reconnectDelayMs
      () => socketMock as any,
      100, // maxReconnectDelayMs
      2, // maxReconnectAttempts
    );

    ws.on("reconnect_failed", (info) => {
      expect(info.maxAttempts).toBe(2);
      expect(attempted).toBe(3); // 1 initial + 2 reconnect attempts
      done();
    });

    void ws.connect();
  });
});
