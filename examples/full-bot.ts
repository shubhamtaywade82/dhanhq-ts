import { DhanClient } from "../src";

const client = new DhanClient({
  token: process.env.DHAN_TOKEN ?? "",
  clientId: process.env.DHAN_CLIENT_ID ?? "",
});

client.ws.market.on("tick", (tick) => {
  console.log("tick", tick.securityId, "ltp" in tick ? tick.ltp : undefined);
});

client.ws.orders.on("order", (order) => {
  console.log("order", order.orderId, order.status);
});

client.ws.market.subscribe([
  { exchangeSegment: "NSE_FNO", securityId: "12345" },
]);

client.ws.connect();
