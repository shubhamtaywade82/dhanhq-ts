import { randomUUID } from "crypto";
import { ZodError } from "zod";

import { HttpClient } from "../client/HttpClient";
import { GlobalStocks as GlobalConstants } from "../constants";
import {
  globalEstimateSchema,
  globalModifyOrderSchema,
  globalPlaceOrderSchema,
} from "../contracts/global-stocks.schema";
import { ValidationError } from "../errors";
import type { OrderOperationResult } from "../types/common.types";
import type {
  GlobalEstimateRequest,
  GlobalFundsResponse,
  GlobalHoldingResponse,
  GlobalMarginResponse,
  GlobalMarketStatusResponse,
  GlobalModifyOrderRequest,
  GlobalOrderCostSummary,
  GlobalOrderEstimateResponse,
  GlobalOrderResponse,
  GlobalPlaceOrderRequest,
  GlobalTradeResponse,
} from "../types/global-stocks.types";

const BASE = "/globalstocks";

/**
 * Orders on the Global Stocks (US equities) book.
 *
 * Note the domestic risk pipeline does **not** apply here: its checks resolve
 * instruments from the Indian scrip master and encode NSE/BSE rules. Writes
 * through the agent layer are still gated by scope and the live-trading flag.
 */
export class GlobalStocksOrders {
  constructor(private readonly httpClient: HttpClient) {}

  public async place(
    request: GlobalPlaceOrderRequest,
  ): Promise<OrderOperationResult<GlobalOrderResponse>> {
    const payload = this.parsePlaceRequest(request);

    const data = await this.httpClient.request<
      GlobalOrderResponse,
      GlobalPlaceOrderRequest
    >({
      method: "POST",
      url: `${BASE}/orders`,
      data: payload,
      safeToRetry: false,
    });

    return {
      correlationId: payload.correlationId,
      data: {
        ...data,
        correlationId: data.correlationId ?? payload.correlationId,
      },
    };
  }

  public async modify(
    request: GlobalModifyOrderRequest,
  ): Promise<GlobalOrderResponse> {
    const payload = parse(globalModifyOrderSchema, {
      ...request,
      dhanClientId: request.dhanClientId ?? this.httpClient.getClientId(),
    });

    const { orderId, ...body } = payload;

    return this.httpClient.request<GlobalOrderResponse>({
      method: "PUT",
      url: `${BASE}/orders/${encodeURIComponent(orderId)}`,
      data: body,
      safeToRetry: false,
    });
  }

  public async cancel(orderId: string): Promise<GlobalOrderResponse> {
    return this.httpClient.request<GlobalOrderResponse>({
      method: "DELETE",
      url: `${BASE}/orders/${encodeURIComponent(orderId)}`,
      safeToRetry: false,
    });
  }

  public async list(): Promise<GlobalOrderResponse[]> {
    return this.httpClient.request<GlobalOrderResponse[]>({
      method: "GET",
      url: `${BASE}/orders`,
      safeToRetry: true,
    });
  }

  public async getById(orderId: string): Promise<GlobalOrderResponse> {
    return this.httpClient.request<GlobalOrderResponse>({
      method: "GET",
      url: `${BASE}/orders/${encodeURIComponent(orderId)}`,
      safeToRetry: true,
    });
  }

  private parsePlaceRequest(
    request: GlobalPlaceOrderRequest,
  ): GlobalPlaceOrderRequest & { correlationId: string } {
    return parse(globalPlaceOrderSchema, {
      ...request,
      correlationId: request.correlationId ?? shortCorrelationId(),
      dhanClientId: request.dhanClientId ?? this.httpClient.getClientId(),
    }) as GlobalPlaceOrderRequest & { correlationId: string };
  }
}

export class GlobalStocksHoldings {
  constructor(private readonly httpClient: HttpClient) {}

  public async list(): Promise<GlobalHoldingResponse[]> {
    return this.httpClient.request<GlobalHoldingResponse[]>({
      method: "GET",
      url: `${BASE}/holdings`,
      safeToRetry: true,
    });
  }

  /** Total current value of the US book, in USD. */
  public async totalCurrentValue(): Promise<number> {
    const holdings = await this.list();
    return holdings.reduce(
      (total, holding) => total + Number(holding.currentValue ?? 0),
      0,
    );
  }
}

export class GlobalStocksTrades {
  constructor(private readonly httpClient: HttpClient) {}

  public async list(): Promise<GlobalTradeResponse[]> {
    return this.httpClient.request<GlobalTradeResponse[]>({
      method: "GET",
      url: `${BASE}/trades`,
      safeToRetry: true,
    });
  }

  public async bySecurityId(
    securityId: string,
  ): Promise<GlobalTradeResponse[]> {
    return this.httpClient.request<GlobalTradeResponse[]>({
      method: "GET",
      url: `${BASE}/trades/${encodeURIComponent(securityId)}`,
      safeToRetry: true,
    });
  }
}

export class GlobalStocksFunds {
  constructor(private readonly httpClient: HttpClient) {}

  /** USD fund limits — a separate balance from the domestic INR book. */
  public async getLimit(): Promise<GlobalFundsResponse> {
    return this.httpClient.request<GlobalFundsResponse>({
      method: "GET",
      url: `${BASE}/fundlimit`,
      safeToRetry: true,
    });
  }
}

export class GlobalStocksMarketStatus {
  constructor(private readonly httpClient: HttpClient) {}

  public async get(): Promise<GlobalMarketStatusResponse> {
    return this.httpClient.request<GlobalMarketStatusResponse>({
      method: "GET",
      url: `${BASE}/marketstatus`,
      safeToRetry: true,
    });
  }

  public async isOpen(): Promise<boolean> {
    const status = await this.get();
    return status.status === GlobalConstants.MarketStatus.OPEN;
  }
}

export class GlobalStocksMarginCalculator {
  constructor(private readonly httpClient: HttpClient) {}

  /** Margin required for a prospective US order. */
  public async calculate(
    request: GlobalEstimateRequest,
  ): Promise<GlobalMarginResponse> {
    return this.httpClient.request<GlobalMarginResponse>({
      method: "POST",
      url: `${BASE}/margincalculator`,
      data: wireParams(request),
      safeToRetry: true,
    });
  }

  /** Brokerage and statutory charges for a prospective US order. */
  public async estimate(
    request: GlobalEstimateRequest,
  ): Promise<GlobalOrderEstimateResponse> {
    return this.httpClient.request<GlobalOrderEstimateResponse>({
      method: "POST",
      url: `${BASE}/transEstimate`,
      data: wireParams(request),
      safeToRetry: true,
    });
  }
}

/**
 * The Global Stocks book, hung off `client.globalStocks`.
 *
 * Kept in its own namespace so an agent asked for "my holdings" cannot
 * silently blend USD positions into the INR book.
 */
export class GlobalStocks {
  public readonly orders: GlobalStocksOrders;
  public readonly holdings: GlobalStocksHoldings;
  public readonly trades: GlobalStocksTrades;
  public readonly funds: GlobalStocksFunds;
  public readonly marketStatus: GlobalStocksMarketStatus;
  public readonly margin: GlobalStocksMarginCalculator;

  constructor(httpClient: HttpClient) {
    this.orders = new GlobalStocksOrders(httpClient);
    this.holdings = new GlobalStocksHoldings(httpClient);
    this.trades = new GlobalStocksTrades(httpClient);
    this.funds = new GlobalStocksFunds(httpClient);
    this.marketStatus = new GlobalStocksMarketStatus(httpClient);
    this.margin = new GlobalStocksMarginCalculator(httpClient);
  }

  /**
   * Charges and margin together, so a caller can decide affordability in one
   * step rather than reconciling two responses.
   */
  public async costSummary(
    request: GlobalEstimateRequest,
  ): Promise<GlobalOrderCostSummary> {
    const [estimate, margin] = await Promise.all([
      this.margin.estimate(request),
      this.margin.calculate(request),
    ]);

    const totalCharges =
      Number(estimate.brokerage ?? 0) +
      Number(estimate.orderCharges ?? 0) +
      Number(estimate.exchangeCharges ?? 0) +
      Number(estimate.turnOverFee ?? 0) +
      Number(estimate.stampDuty ?? 0) +
      Number(estimate.gst ?? 0);

    const totalMargin = Number(margin.totalMargin ?? 0);
    const availableBalance = Number(margin.availableBal ?? 0);

    return {
      totalCharges,
      brokerage: Number(estimate.brokerage ?? 0),
      totalMargin,
      availableBalance,
      sufficient: availableBalance >= totalMargin,
    };
  }
}

/**
 * The estimator endpoints expect `price` and `quantity` as strings, with
 * whole numbers sent without a decimal part.
 */
function wireParams(
  request: GlobalEstimateRequest,
): Record<string, string | number> {
  const validated = parse(globalEstimateSchema, request);

  return {
    ...validated,
    price: formatNumber(validated.price),
    quantity: formatNumber(validated.quantity),
  };
}

function formatNumber(value: number): string {
  return Number.isInteger(value) ? String(Math.trunc(value)) : String(value);
}

/**
 * Global Stocks caps `correlationId` at 30 characters and rejects the hyphens
 * of a bare UUID beyond that length, so this trims to a 30-char hex string.
 */
function shortCorrelationId(): string {
  return randomUUID().replace(/-/g, "").slice(0, 30);
}

function parse<T>(schema: { parse(value: unknown): T }, value: unknown): T {
  try {
    return schema.parse(value);
  } catch (error) {
    if (error instanceof ZodError) {
      throw new ValidationError(error);
    }

    throw error;
  }
}
