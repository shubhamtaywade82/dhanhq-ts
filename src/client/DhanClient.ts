import { OrdersResource } from "../resources/OrdersResource";
import { DhanWS } from "../ws";

export interface DhanClientConfig {
  token: string;
  clientId: string;
}

export class DhanClient {
  public orders: OrdersResource;
  public ws: DhanWS;

  constructor(config: DhanClientConfig) {
    this.orders = new OrdersResource(config);
    this.ws = new DhanWS(config.token, config.clientId);
  }
}
