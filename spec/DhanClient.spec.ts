import { DhanClient } from "../src";

describe("DhanClient", () => {
  it("wires orders and ws resources", () => {
    const client = new DhanClient({
      token: "token",
      clientId: "client-id",
    });

    expect(client.orders.getConfig()).toEqual({
      token: "token",
      clientId: "client-id",
    });
    expect(client.ws.connect()).toEqual({
      token: "token",
      clientId: "client-id",
    });
  });
});
