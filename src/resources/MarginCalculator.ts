import type { MultiScripMarginCalcRequest, MultiScripMarginCalcResponse, ScriptItem } from "../generated";
import type { KnowYourMarginResponse as MarginCalculationResponse } from "../generated";
import { ScriptItem as ScriptItemEnum } from "../generated/models/ScriptItem";

import { HttpClient } from "../client/HttpClient";

/**
 * Margin Calculator API wrapper.
 * 
 * Supports both single-order and multi-leg margin calculations with hedge benefits.
 * For F&O strategies (spreads, iron condors, etc.), use the multi-leg endpoint to
 * get combined margin requirements with hedging benefits applied.
 * 
 * @see https://dhan.co/help/docs/api/v2/#margin-calculator
 */
export class MarginCalculator {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Calculate margin for a single order.
   * 
   * @example
   * ```ts
   * const margin = await client.marginCalculator.calculateSingle({
   *   exchangeSegment: "NSE_FNO",
   *   productType: "INTRADAY",
   *   optionType: "CALL",
   *   instrumentType: "OPTIDX",
   *   securityId: "44000", // NIFTY 24500 CE
   *   transactionType: "BUY",
   *   quantity: 50,
   *   price: 150.00,
   * });
   * ```
   */
  public async calculateSingle(
    request: Omit<ScriptItem, "scripList">,
  ): Promise<MultiScripMarginCalcResponse> {
    return this.httpClient.request<MultiScripMarginCalcResponse, MultiScripMarginCalcRequest>({
      method: "POST",
      url: "/margincalculator",
      data: {
        scripList: [request],
      },
      safeToRetry: true,
    });
  }

  /**
   * Calculate margin for multiple legs with hedge benefits.
   * 
   * This is essential for multi-leg strategies like spreads, straddles, and iron condors,
   * where margin benefits are applied due to hedging.
   * 
   * @example
   * ```ts
   * // Bull Call Spread: Buy lower strike call, sell higher strike call
   * const margin = await client.marginCalculator.calculateMulti([\n   *   {\n   *     exchangeSegment: "NSE_FNO",\n   *     productType: "INTRADAY",\n   *     optionType: "CALL",\n   *     instrumentType: "OPTIDX",\n   *     securityId: "44000", // NIFTY 24500 CE\n   *     transactionType: "BUY",\n   *     quantity: 50,\n   *     price: 150.00,\n   *   },\n   *   {\n   *     exchangeSegment: "NSE_FNO",\n   *     productType: "INTRADAY",\n   *     optionType: "CALL",\n   *     instrumentType: "OPTIDX",\n   *     securityId: "44050", // NIFTY 24600 CE\n   *     transactionType: "SELL",\n   *     quantity: 50,\n   *     price: 100.00,\n   *   },\n   * ]);\n   * \n   * // The response will show reduced margin due to hedge benefits
   * ```
   * 
   * @param legs Array of order legs for the strategy
   */
  public async calculateMulti(
    legs: Array<Omit<ScriptItem, "scripList">>,
  ): Promise<MultiScripMarginCalcResponse> {
    return this.httpClient.request<MultiScripMarginCalcResponse, MultiScripMarginCalcRequest>({
      method: "POST",
      url: "/margincalculator",
      data: {
        scripList: legs,
      },
      safeToRetry: true,
    });
  }

  /**
   * Helper: Build a bull call spread margin calculation.
   * 
   * @example
   * ```ts
   * const margin = await client.marginCalculator.bullCallSpread({
   *   longStrikeSecurityId: "44000", // Lower strike (buy)
   *   shortStrikeSecurityId: "44050", // Higher strike (sell)
   *   quantity: 50,
   *   longPrice: 150.00,
   *   shortPrice: 100.00,
   * });
   * ```
   */
  public async bullCallSpread(options: {
    longStrikeSecurityId: string;
    shortStrikeSecurityId: string;
    quantity: number;
    longPrice: number;
    shortPrice: number;
    productType?: "INTRADAY" | "DELIVERY";
  }): Promise<MarginCalculationResponse> {
    const {
      longStrikeSecurityId,
      shortStrikeSecurityId,
      quantity,
      longPrice,
      shortPrice,
      productType = "INTRADAY",
    } = options;

    return this.calculateMulti([
      {
        exchangeSegment: ScriptItemEnum.exchangeSegment.NSE_FNO,
        productType: productType as ScriptItemEnum.productType,
        securityId: longStrikeSecurityId,
        transactionType: ScriptItemEnum.transactionType.BUY,
        quantity,
        price: longPrice,
      },
      {
        exchangeSegment: ScriptItemEnum.exchangeSegment.NSE_FNO,
        productType: productType as ScriptItemEnum.productType,
        securityId: shortStrikeSecurityId,
        transactionType: ScriptItemEnum.transactionType.SELL,
        quantity,
        price: shortPrice,
      },
    ]);
  }

  /**
   * Helper: Build a bull put spread margin calculation.
   * 
   * @example
   * ```ts
   * const margin = await client.marginCalculator.bullPutSpread({
   *   longStrikeSecurityId: "43950", // Lower strike (buy put)
   *   shortStrikeSecurityId: "44000", // Higher strike (sell put)
   *   quantity: 50,
   *   longPrice: 80.00,
   *   shortPrice: 120.00,
   * });
   * ```
   */
  public async bullPutSpread(options: {
    longStrikeSecurityId: string;
    shortStrikeSecurityId: string;
    quantity: number;
    longPrice: number;
    shortPrice: number;
    productType?: "INTRADAY" | "DELIVERY";
  }): Promise<MarginCalculationResponse> {
    const {
      longStrikeSecurityId,
      shortStrikeSecurityId,
      quantity,
      longPrice,
      shortPrice,
      productType = "INTRADAY",
    } = options;

    return this.calculateMulti([
      {
        exchangeSegment: ScriptItemEnum.exchangeSegment.NSE_FNO,
        productType: productType as ScriptItemEnum.productType,
        securityId: longStrikeSecurityId,
        transactionType: ScriptItemEnum.transactionType.BUY,
        quantity,
        price: longPrice,
      },
      {
        exchangeSegment: ScriptItemEnum.exchangeSegment.NSE_FNO,
        productType: productType as ScriptItemEnum.productType,
        securityId: shortStrikeSecurityId,
        transactionType: ScriptItemEnum.transactionType.SELL,
        quantity,
        price: shortPrice,
      },
    ]);
  }

  /**
   * Helper: Build an iron condor margin calculation (4 legs).
   * 
   * @example
   * ```ts
   * const margin = await client.marginCalculator.ironCondor({
   *   longPutSecurityId: "43900",
   *   shortPutSecurityId: "43950",
   *   shortCallSecurityId: "44050",
   *   longCallSecurityId: "44100",
   *   quantity: 50,
   *   prices: {
   *     longPut: 50.00,
   *     shortPut: 80.00,
   *     shortCall: 70.00,
   *     longCall: 40.00,
   *   },
   * });
   * ```
   */
  public async ironCondor(options: {
    longPutSecurityId: string;
    shortPutSecurityId: string;
    shortCallSecurityId: string;
    longCallSecurityId: string;
    quantity: number;
    prices: {
      longPut: number;
      shortPut: number;
      shortCall: number;
      longCall: number;
    };
    productType?: "INTRADAY" | "DELIVERY";
  }): Promise<MarginCalculationResponse> {
    const {
      longPutSecurityId,
      shortPutSecurityId,
      shortCallSecurityId,
      longCallSecurityId,
      quantity,
      prices,
      productType = "INTRADAY",
    } = options;

    return this.calculateMulti([
      {
        exchangeSegment: ScriptItemEnum.exchangeSegment.NSE_FNO,
        productType: productType as ScriptItemEnum.productType,
        securityId: longPutSecurityId,
        transactionType: ScriptItemEnum.transactionType.BUY,
        quantity,
        price: prices.longPut,
      },
      {
        exchangeSegment: ScriptItemEnum.exchangeSegment.NSE_FNO,
        productType: productType as ScriptItemEnum.productType,
        securityId: shortPutSecurityId,
        transactionType: ScriptItemEnum.transactionType.SELL,
        quantity,
        price: prices.shortPut,
      },
      {
        exchangeSegment: ScriptItemEnum.exchangeSegment.NSE_FNO,
        productType: productType as ScriptItemEnum.productType,
        securityId: shortCallSecurityId,
        transactionType: ScriptItemEnum.transactionType.SELL,
        quantity,
        price: prices.shortCall,
      },
      {
        exchangeSegment: ScriptItemEnum.exchangeSegment.NSE_FNO,
        productType: productType as ScriptItemEnum.productType,
        securityId: longCallSecurityId,
        transactionType: ScriptItemEnum.transactionType.BUY,
        quantity,
        price: prices.longCall,
      },
    ]);
  }
}
