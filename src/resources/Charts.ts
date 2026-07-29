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
    request: IntradayChartsRequest,
  ): Promise<ChartsResponse> {
    const validated = intradayChartsSchema.safeParse(request);
    if (!validated.success) {
      throw new ValidationError(validated.error);
    }

    return this.httpClient.request<ChartsResponse, IntradayChartsRequest>({
      method: "POST",
      url: "/charts/intraday",
      data: request,
      safeToRetry: false,
    });
  }

  public async historical(
    request: HistoricalChartsRequest,
  ): Promise<ChartsResponse> {
    const validated = historicalChartsSchema.safeParse(request);
    if (!validated.success) {
      throw new ValidationError(validated.error);
    }

    return this.httpClient.request<ChartsResponse, HistoricalChartsRequest>({
      method: "POST",
      url: "/charts/historical",
      data: request,
      safeToRetry: false,
    });
  }
}
