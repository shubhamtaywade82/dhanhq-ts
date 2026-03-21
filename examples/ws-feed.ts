import { DhanClient } from "../src";

const client = new DhanClient({
  token: process.env.DHAN_TOKEN ?? "",
  clientId: process.env.DHAN_CLIENT_ID ?? "",
});

client.ws.market.on("tick", (tick) => {
  console.log(tick);
});

client.ws.market.subscribe([
  { exchangeSegment: "NSE_FNO", securityId: "12345" },
]);

client.ws.connect();
