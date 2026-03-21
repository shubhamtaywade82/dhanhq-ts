import { parseMarketFeedPacket, splitPackets } from "../src";

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
});
