import { GeneratedClient } from "./GeneratedClient";
import { HttpClient, type HttpClientDependencies } from "./HttpClient";
import type { DhanClientConfig } from "../types/common.types";
import { Orders, Positions, SuperOrders } from "../resources";
import { DhanWS } from "../ws";

export interface DhanClientDependencies extends HttpClientDependencies {}

export class DhanClient {
  public readonly generated: GeneratedClient;
  public readonly orders: Orders;
  public readonly superOrders: SuperOrders;
  public readonly positions: Positions;
  public readonly ws: DhanWS;

  constructor(
    private readonly config: DhanClientConfig,
    dependencies: DhanClientDependencies = {},
  ) {
    const httpClient = new HttpClient(config, dependencies);

    this.generated = new GeneratedClient(config);
    this.orders = new Orders(httpClient);
    this.superOrders = new SuperOrders(httpClient);
    this.positions = new Positions(httpClient);
    this.ws = new DhanWS({
      token: config.token,
      clientId: config.clientId,
      url: config.wsUrl,
    });
  }

  public getConfig(): DhanClientConfig {
    return this.config;
  }
}
