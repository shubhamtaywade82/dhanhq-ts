import { DhanClient } from "../src";

const client = new DhanClient({
  token: "your-token",
  clientId: "your-client-id",
});

client.ws.connect();
