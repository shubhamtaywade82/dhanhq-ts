import { DhanClient } from "../src";

const client = new DhanClient({
  token: "your-token",
  clientId: "your-client-id",
});

client.ws.market.subscribe([
  { securityId: "12345", exchangeSegment: "NSE_FNO" },
]);

client.ws.market.on("tick", (tick) => {
  console.log(tick);
});

client.ws.connect();
