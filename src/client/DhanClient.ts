import { GeneratedClient } from "./GeneratedClient";
import { HttpClient, type HttpClientDependencies } from "./HttpClient";
import type { DhanClientConfig } from "../types/common.types";
import {
  Alerts,
  Charts,
  Edis,
  ForeverOrders,
  Funds,
  IpSetup,
  Orders,
  Positions,
  Statements,
  SuperOrders,
  TraderControls,
} from "../resources";
import { DhanWS } from "../ws";

export interface DhanClientDependencies extends HttpClientDependencies {}

export class DhanClient {
  public readonly generated: GeneratedClient;
  public readonly orders: Orders;
  public readonly superOrders: SuperOrders;
  public readonly positions: Positions;
  public readonly alerts: Alerts;
  public readonly foreverOrders: ForeverOrders;
  public readonly funds: Funds;
  public readonly charts: Charts;
  public readonly edis: Edis;
  public readonly statements: Statements;
  public readonly traderControls: TraderControls;
  public readonly ipSetup: IpSetup;
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
    this.alerts = new Alerts(httpClient);
    this.foreverOrders = new ForeverOrders(httpClient);
    this.funds = new Funds(httpClient);
    this.charts = new Charts(httpClient);
    this.edis = new Edis(httpClient);
    this.statements = new Statements(httpClient);
    this.traderControls = new TraderControls(httpClient);
    this.ipSetup = new IpSetup(httpClient);
    this.ws = new DhanWS({
      token: config.token,
      clientId: config.clientId,
      marketFeedUrl: config.marketFeedUrl ?? config.wsUrl,
      orderUpdateUrl: config.orderUpdateUrl,
      reconnectDelayMs: config.wsReconnectDelayMs,
    });
  }

  public getConfig(): DhanClientConfig {
    return this.config;
  }
}
