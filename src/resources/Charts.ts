import type {
  ChartsResponse,
  HistoricalChartsRequest,
  IntradayChartsRequest,
  OptionChartRequest,
  OptionChartResponse,
} from "../generated";

import { HttpClient } from "../client/HttpClient";
import { historicalChartsSchema, intradayChartsSchema } from "../contracts/charts.schema";
import { ValidationError } from "../errors";
import { adjustTradingDateRange } from "../ta/marketCalendar";

export interface ExtendedIntradayChartsRequest extends IntradayChartsRequest {
  autoAdjustDates?: boolean;
}

export interface ExtendedHistoricalChartsRequest extends HistoricalChartsRequest {
  autoAdjustDates?: boolean;
}

export class Charts {
  constructor(private readonly httpClient: HttpClient) {}

  public async option(
    request: OptionChartRequest,
  ): Promise<OptionChartResponse> {
    return this.httpClient.request<OptionChartResponse, OptionChartRequest>({
      method: "POST",
      url: "/charts/rollingoption",
      data: request,
      safeToRetry: false,
    });
  }

  public async intraday(
    request: ExtendedIntradayChartsRequest,
  ): Promise<ChartsResponse> {
    let payload = { ...request };
    delete payload.autoAdjustDates;

    // Auto-adjust enabled by default unless explicitly disabled with autoAdjustDates: false
    if (request.autoAdjustDates !== false) {
      const adjusted = adjustTradingDateRange(
        { fromDate: request.fromDate, toDate: request.toDate },
        { maxDays: 90, clampFuture: true, adjustNonTradingDays: true },
      );
      payload.fromDate = adjusted.fromDate;
      payload.toDate = adjusted.toDate;
    }

    const validated = intradayChartsSchema.safeParse(payload);
    if (!validated.success) {
      throw new ValidationError(validated.error);
    }

    return this.httpClient.request<ChartsResponse, IntradayChartsRequest>({
      method: "POST",
      url: "/charts/intraday",
      data: payload,
      safeToRetry: false,
    });
  }

  public async historical(
    request: ExtendedHistoricalChartsRequest,
  ): Promise<ChartsResponse> {
    let payload = { ...request };
    delete payload.autoAdjustDates;

    // Auto-adjust enabled by default unless explicitly disabled with autoAdjustDates: false
    if (request.autoAdjustDates !== false) {
      const adjusted = adjustTradingDateRange(
        { fromDate: request.fromDate, toDate: request.toDate },
        { maxDays: 3650, clampFuture: true, adjustNonTradingDays: true },
      );
      payload.fromDate = adjusted.fromDate;
      payload.toDate = adjusted.toDate;
    }

    const validated = historicalChartsSchema.safeParse(payload);
    if (!validated.success) {
      throw new ValidationError(validated.error);
    }

    return this.httpClient.request<ChartsResponse, HistoricalChartsRequest>({
      method: "POST",
      url: "/charts/historical",
      data: payload,
      safeToRetry: false,
    });
  }
}
