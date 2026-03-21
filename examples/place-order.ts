import { DhanClient } from "../src";

const client = new DhanClient({
  token: process.env.DHAN_TOKEN ?? "",
  clientId: process.env.DHAN_CLIENT_ID ?? "",
});

async function main() {
  const result = await client.orders.place({
    transactionType: "BUY",
    exchangeSegment: "NSE_FNO",
    productType: "INTRADAY",
    orderType: "MARKET",
    quantity: 1,
    securityId: "12345",
  });

  console.log(result);
}

void main();
