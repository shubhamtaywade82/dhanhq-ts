import { DhanClient, ValidationError } from "../src";

describe("order safety", () => {
  it("rejects invalid stop loss orders before transport", async () => {
    const client = new DhanClient({
      token: "token",
      clientId: "client-id",
    });

    await expect(
      client.orders.place({
        transactionType: "BUY",
        exchangeSegment: "NSE_FNO",
        productType: "INTRADAY",
        orderType: "STOP_LOSS",
        quantity: 1,
        securityId: "12345",
      }),
    ).rejects.toBeInstanceOf(ValidationError);
  });
});
