import type {
  AlertCondition,
  AlertOrder,
  AlertOrderRequest,
  AlertOrderResponse,
  GetAlertResponse,
} from "../generated";

import { HttpClient } from "../client/HttpClient";

/**
 * Conditional Trigger Orders (Alert Orders) API wrapper.
 * 
 * This wraps the /v2/alerts/orders endpoints for placing orders triggered by
 * price or technical indicators. Unlike standard GTT/Forever orders, conditional
 * triggers support:
 * - PRICE_WITH_VALUE: Trigger when price crosses a specific value
 * - TECHNICAL_WITH_VALUE: Trigger when an indicator (SMA, RSI, etc.) crosses a value
 * - TECHNICAL_WITH_INDICATOR: Trigger when one indicator crosses another (e.g., SMA_20 > SMA_50)
 * - Multiple orders can be triggered from a single condition
 * 
 * @see https://dhan.co/help/docs/api/v2/#alerts-orders
 */
export class ConditionalTriggers {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * List all conditional trigger orders.
   */
  public async list(): Promise<GetAlertResponse[]> {
    return this.httpClient.request<GetAlertResponse[]>({
      method: "GET",
      url: "/alerts/orders",
      safeToRetry: true,
    });
  }

  /**
   * Get a specific conditional trigger order by ID.
   */
  public async getById(alertId: string): Promise<GetAlertResponse> {
    return this.httpClient.request<GetAlertResponse>({
      method: "GET",
      url: `/alerts/orders/${encodeURIComponent(alertId)}`,
      safeToRetry: true,
    });
  }

  /**
   * Place a new conditional trigger order.
   * 
   * @example
   * ```ts
   * // Price-based trigger: Buy NIFTY 24500 CE when Nifty spot crosses 24,500
   * await client.conditionalTriggers.place({
   *   condition: {
   *     comparisonType: "PRICE_WITH_VALUE",
   *     exchangeSegment: "IDX_I",
   *     securityId: "1333", // Nifty 50 index
   *     operator: "GREATER_THAN",
   *     comparingValue: 24500,
   *     frequency: "ONCE",
   *   },
   *   orders: [{
   *     transactionType: "BUY",
   *     exchangeSegment: "NSE_FNO",
   *     productType: "INTRADAY",
   *     orderType: "MARKET",
   *     validity: "DAY",
   *     securityId: "44000", // NIFTY 24500 CE
   *     quantity: 50,
   *   }],
   * });
   * 
   * // Technical trigger: Buy when RSI crosses above 30
   * await client.conditionalTriggers.place({
   *   condition: {
   *     comparisonType: "TECHNICAL_WITH_VALUE",
   *     exchangeSegment: "NSE_EQ",
   *     securityId: "26009", // RELIANCE
   *     indicatorName: "RSI_14",
   *     timeFrame: "FIFTEEN_MIN",
   *     operator: "CROSSING_UP",
   *     comparingValue: 30,
   *     frequency: "ONCE",
   *   },
   *   orders: [{ ... }],
   * });
   * ```
   */
  public async place(
    request: AlertOrderRequest,
  ): Promise<AlertOrderResponse> {
    return this.httpClient.request<AlertOrderResponse, AlertOrderRequest>({
      method: "POST",
      url: "/alerts/orders",
      data: request,
      safeToRetry: false,
    });
  }

  /**
   * Modify an existing conditional trigger order.
   */
  public async modify(
    alertId: string,
    request: Partial<AlertOrderRequest>,
  ): Promise<AlertOrderResponse> {
    return this.httpClient.request<AlertOrderResponse, Partial<AlertOrderRequest>>({
      method: "PUT",
      url: `/alerts/orders/${encodeURIComponent(alertId)}`,
      data: request,
      safeToRetry: false,
    });
  }

  /**
   * Cancel/delete a conditional trigger order.
   */
  public async cancel(alertId: string): Promise<AlertOrderResponse> {
    return this.httpClient.request<AlertOrderResponse>({
      method: "DELETE",
      url: `/alerts/orders/${encodeURIComponent(alertId)}`,
      safeToRetry: false,
    });
  }

  /**
   * Helper: Build a price-based condition for options buying stop-loss.
   * 
   * @example
   * ```ts
   * const condition = ConditionalTriggers.buildPriceCondition({
   *   exchangeSegment: "IDX_I",
   *   securityId: "1333", // Nifty
   *   triggerAbove: 24500, // Trigger when Nifty goes above 24500
   * });
   * ```
   */
  public static buildPriceCondition(options: {
    exchangeSegment: string;
    securityId: string;
    triggerAbove?: number;
    triggerBelow?: number;
    frequency?: "ONCE";
  }): AlertCondition {
    const { exchangeSegment, securityId, frequency = "ONCE" } = options;
    
    if (options.triggerAbove !== undefined && options.triggerBelow !== undefined) {
      throw new Error("Specify either triggerAbove or triggerBelow, not both");
    }

    if (options.triggerAbove !== undefined) {
      return {
        comparisonType: "PRICE_WITH_VALUE",
        exchangeSegment,
        securityId,
        operator: "GREATER_THAN",
        comparingValue: options.triggerAbove,
        frequency,
      };
    }

    if (options.triggerBelow !== undefined) {
      return {
        comparisonType: "PRICE_WITH_VALUE",
        exchangeSegment,
        securityId,
        operator: "LESS_THAN",
        comparingValue: options.triggerBelow,
        frequency,
      };
    }

    throw new Error("Must specify either triggerAbove or triggerBelow");
  }

  /**
   * Helper: Build a technical indicator-based condition.
   * 
   * @example
   * ```ts
   * const condition = ConditionalTriggers.buildTechnicalCondition({
   *   exchangeSegment: "NSE_EQ",
   *   securityId: "26009", // RELIANCE
   *   indicatorName: "SMA_20",
   *   timeFrame: "FIFTEEN_MIN",
   *   crossingAbove: 2500, // Trigger when SMA_20 crosses above 2500
   * });
   * ```
   */
  public static buildTechnicalCondition(options: {
    exchangeSegment: string;
    securityId: string;
    indicatorName: AlertCondition["indicatorName"];
    timeFrame?: AlertCondition["timeFrame"];
    crossingAbove?: number;
    crossingBelow?: number;
    frequency?: "ONCE";
  }): AlertCondition {
    const { exchangeSegment, securityId, indicatorName, timeFrame = "FIFTEEN_MIN", frequency = "ONCE" } = options;
    
    if (options.crossingAbove !== undefined && options.crossingBelow !== undefined) {
      throw new Error("Specify either crossingAbove or crossingBelow, not both");
    }

    if (options.crossingAbove !== undefined) {
      return {
        comparisonType: "TECHNICAL_WITH_VALUE",
        exchangeSegment,
        securityId,
        indicatorName,
        timeFrame,
        operator: "CROSSING_UP",
        comparingValue: options.crossingAbove,
        frequency,
      };
    }

    if (options.crossingBelow !== undefined) {
      return {
        comparisonType: "TECHNICAL_WITH_VALUE",
        exchangeSegment,
        securityId,
        indicatorName,
        timeFrame,
        operator: "CROSSING_DOWN",
        comparingValue: options.crossingBelow,
        frequency,
      };
    }

    throw new Error("Must specify either crossingAbove or crossingBelow");
  }
}
