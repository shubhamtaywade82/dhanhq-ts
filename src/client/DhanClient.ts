import axios, { type AxiosInstance } from "axios";

import {
  DhanAuth,
  TokenManager,
  type EnableAutoTokenManagementOptions,
} from "../auth";
import { AuthenticationError } from "../errors";
import { GeneratedClient } from "./GeneratedClient";
import { HttpClient, type HttpClientDependencies } from "./HttpClient";
import type { DhanClientConfig } from "../types/common.types";
import {
  Alerts,
  Charts,
  ConditionalTriggers,
  Edis,
  ForeverOrders,
  Funds,
  GlobalStocks,
  Instruments,
  IpSetup,
  MarketFeed,
  OptionChain,
  Orders,
  Positions,
  Profile,
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
  public readonly conditionalTriggers: ConditionalTriggers;
  public readonly foreverOrders: ForeverOrders;
  public readonly funds: Funds;
  public readonly charts: Charts;
  public readonly edis: Edis;
  public readonly statements: Statements;
  public readonly traderControls: TraderControls;
  public readonly ipSetup: IpSetup;
  public readonly profile: Profile;
  public readonly marketFeed: MarketFeed;
  public readonly optionChain: OptionChain;
  public readonly instruments: Instruments;
  /** The US equities book — a separate namespace so USD and INR never mix. */
  public readonly globalStocks: GlobalStocks;
  public readonly ws: DhanWS;
  public readonly auth: {
    generateAccessToken: typeof DhanAuth.generateAccessToken;
    generateTotp: typeof DhanAuth.generateTotp;
    renewWebToken: typeof DhanAuth.renewWebToken;
    enableAutoTokenManagement: (
      options: EnableAutoTokenManagementOptions,
    ) => TokenManager;
  };
  private tokenManager?: TokenManager;

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
    this.conditionalTriggers = new ConditionalTriggers(httpClient);
    this.foreverOrders = new ForeverOrders(httpClient);
    this.funds = new Funds(httpClient);
    this.charts = new Charts(httpClient);
    this.edis = new Edis(httpClient);
    this.statements = new Statements(httpClient);
    this.traderControls = new TraderControls(httpClient);
    this.ipSetup = new IpSetup(httpClient);
    this.profile = new Profile(httpClient);
    this.marketFeed = new MarketFeed(httpClient);
    this.optionChain = new OptionChain(httpClient);
    this.instruments = new Instruments(httpClient, {
      cacheTtlMs: config.instrumentCacheTtlMs,
    });
    this.globalStocks = new GlobalStocks(httpClient);
    this.ws = new DhanWS({
      token: config.token,
      tokenProvider: config.tokenProvider,
      clientId: config.clientId,
      marketFeedUrl: config.marketFeedUrl ?? config.wsUrl,
      orderUpdateUrl: config.orderUpdateUrl,
      reconnectDelayMs: config.wsReconnectDelayMs,
      orderUserType: config.wsOrderUserType,
      partnerId: config.partnerId,
      partnerSecret: config.partnerSecret,
    });
    this.auth = {
      generateAccessToken: DhanAuth.generateAccessToken,
      generateTotp: DhanAuth.generateTotp,
      renewWebToken: DhanAuth.renewWebToken,
      enableAutoTokenManagement: (options) => {
        this.tokenManager = new TokenManager(this.config, options);
        this.config.tokenProvider = () => {
          if (!this.tokenManager) {
            throw new Error("Token manager is not initialized");
          }
          return this.tokenManager.ensureValidToken();
        };
        return this.tokenManager;
      },
    };
  }

  public getConfig(): DhanClientConfig {
    return this.config;
  }

  /**
   * Builds a client from the standard environment variables:
   * `DHAN_CLIENT_ID`, `DHAN_ACCESS_TOKEN` and optionally `DHAN_BASE_URL`,
   * `DHAN_PARTNER_ID` and `DHAN_PARTNER_SECRET`.
   *
   * Throws rather than constructing a client that would fail on its first
   * request — a missing credential is a startup problem, not a runtime one.
   */
  public static fromEnv(
    env: NodeJS.ProcessEnv = process.env,
    overrides: Partial<DhanClientConfig> = {},
  ): DhanClient {
    const clientId = env.DHAN_CLIENT_ID;
    const token = env.DHAN_ACCESS_TOKEN;

    if (!clientId) {
      throw new AuthenticationError("Configuration", "DHAN_CLIENT_ID is not set");
    }

    if (!token && !overrides.token && !overrides.tokenProvider) {
      throw new AuthenticationError(
        "Configuration",
        "DHAN_ACCESS_TOKEN is not set — provide it, or pass a tokenProvider override",
      );
    }

    return new DhanClient({
      clientId,
      token,
      baseURL: env.DHAN_BASE_URL,
      partnerId: env.DHAN_PARTNER_ID,
      partnerSecret: env.DHAN_PARTNER_SECRET,
      ...overrides,
    });
  }

  public static async fromTokenEndpoint(options: {
    endpointBaseUrl: string;
    bearerToken: string;
    axiosInstance?: AxiosInstance;
  }): Promise<DhanClient> {
    const client =
      options.axiosInstance ??
      axios.create({
        baseURL: options.endpointBaseUrl,
        timeout: 5000,
      });
    const response = await client.get<{
      access_token?: string;
      client_id?: string;
      base_url?: string;
    }>("/auth/dhan/token", {
      headers: {
        Authorization: `Bearer ${options.bearerToken}`,
        Accept: "application/json",
      },
    });

    return new DhanClient({
      token: response.data.access_token,
      clientId: response.data.client_id ?? "",
      baseURL: response.data.base_url,
    });
  }
}
