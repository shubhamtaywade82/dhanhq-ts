import { HttpClient } from "../client/HttpClient";
import { expiredOptionsDataSchema } from "../contracts/expired-options.schema";
import { ValidationError } from "../errors";

export interface ExpiredOptionsDataRequest {
  securityId: string | number;
  exchangeSegment: string;
  instrument?: "INDEX" | "OPTIDX" | "OPTSTK" | "EQUITY" | string;
  instrumentType?: "INDEX" | "STOCK" | string;
  expiryFlag: "WEEK" | "MONTH" | "WEEKLY" | "MONTHLY" | string;
  expiryCode: number;
  strike: string; // e.g., "ATM", "ATM+1", "ATM-2"
  drvOptionType: "CALL" | "PUT" | string;
  interval?: "1" | "5" | "15" | "25" | "60" | string;
  requiredData?: ("open" | "high" | "low" | "close" | "volume" | "oi" | string)[];
  fromDate: string; // YYYY-MM-DD
  toDate: string; // YYYY-MM-DD
}

export interface ExpiredOptionsDataPoint {
  timestamp: string;
  open?: number;
  high?: number;
  low?: number;
  close?: number;
  volume?: number;
  oi?: number;
}

export interface ExpiredOptionsDataResponse {
  status?: string;
  data?: ExpiredOptionsDataPoint[];
  [key: string]: unknown;
}

/**
 * Expired Options Historical Data API wrapper.
 * 
 * Fetches historical data for expired F&O contracts — essential for
 * backtesting options strategies against past expiry series.
 * 
 * @see https://dhan.co/help/docs/api/v2/#expired-options-data
 */
export class ExpiredOptionsData {
  constructor(private readonly httpClient: HttpClient) {}

  /**
   * Fetch historical data for an expired option contract.
   * 
   * @example
   * ```ts
   * // Fetch NIFTY weekly 24000 CE expired data for January 2026
   * const data = await client.expiredOptionsData.fetch({
   *   securityId: "1333", // Nifty 50 index
   *   exchangeSegment: "NSE_FNO",
   *   instrumentType: "INDEX",
   *   expiryFlag: "WEEKLY",
   *   expiryCode: 1, // 1st weekly expiry
   *   strike: "ATM",
   *   drvOptionType: "CALL",
   *   requiredData: ["open", "high", "low", "close", "volume"],
   *   fromDate: "2026-01-01",
   *   toDate: "2026-01-31",
   * });
   * 
   * // Fetch BANKNIFTY monthly 48000 PE expired data
   * const peData = await client.expiredOptionsData.fetch({
   *   securityId: "1334", // Bank Nifty index
   *   exchangeSegment: "NSE_FNO",
   *   instrumentType: "INDEX",
   *   expiryFlag: "MONTHLY",
   *   expiryCode: 1,
   *   strike: "ATM-1", // One strike below ATM
   *   drvOptionType: "PUT",
   *   requiredData: ["close", "volume", "oi"],
   *   fromDate: "2025-12-01",
   *   toDate: "2025-12-31",
   * });
   * ```
   */
  public async fetch(
    request: ExpiredOptionsDataRequest,
  ): Promise<ExpiredOptionsDataResponse> {
    const validated = expiredOptionsDataSchema.safeParse(request);
    if (!validated.success) {
      throw new ValidationError(validated.error);
    }

    const payload = {
      instrument: request.instrument ?? request.instrumentType,
      ...request,
    };
    return this.httpClient.request<
      ExpiredOptionsDataResponse,
      typeof payload
    >({
      method: "POST",
      url: "/charts/rollingoption",
      data: payload,
      safeToRetry: true,
    });
  }

  /**
   * Helper: Build a request for ATM strike expired data.
   */
  public static buildAtmRequest(options: {
    securityId: string;
    exchangeSegment: string;
    instrumentType: "INDEX" | "STOCK";
    expiryFlag: "WEEKLY" | "MONTHLY" | "QUARTERLY";
    expiryCode: number;
    optionType: "CALL" | "PUT";
    fromDate: string;
    toDate: string;
    requiredData?: ("open" | "high" | "low" | "close" | "volume" | "oi")[];
  }): ExpiredOptionsDataRequest {
    return {
      securityId: options.securityId,
      exchangeSegment: options.exchangeSegment,
      instrumentType: options.instrumentType,
      expiryFlag: options.expiryFlag,
      expiryCode: options.expiryCode,
      strike: "ATM",
      drvOptionType: options.optionType,
      requiredData: options.requiredData ?? ["close", "volume"],
      fromDate: options.fromDate,
      toDate: options.toDate,
    };
  }

  /**
   * Helper: Build a request for offset ATM strikes (e.g., ATM+1, ATM-2).
   */
  public static buildOffsetAtmRequest(options: {
    securityId: string;
    exchangeSegment: string;
    instrumentType: "INDEX" | "STOCK";
    expiryFlag: "WEEKLY" | "MONTHLY" | "QUARTERLY";
    expiryCode: number;
    optionType: "CALL" | "PUT";
    offset: number; // Positive for OTM calls/ITM puts, negative for ITM calls/OTM puts
    fromDate: string;
    toDate: string;
    requiredData?: ("open" | "high" | "low" | "close" | "volume" | "oi")[];
  }): ExpiredOptionsDataRequest {
    const { offset, ...rest } = options;
    const strike = offset >= 0 ? `ATM+${offset}` : `ATM${offset}`;

    return {
      securityId: rest.securityId,
      exchangeSegment: rest.exchangeSegment,
      instrumentType: rest.instrumentType,
      expiryFlag: rest.expiryFlag,
      expiryCode: rest.expiryCode,
      strike,
      drvOptionType: rest.optionType,
      requiredData: rest.requiredData ?? ["close", "volume"],
      fromDate: rest.fromDate,
      toDate: rest.toDate,
    };
  }
}
