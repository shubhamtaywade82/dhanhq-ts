import type {
  FundLimitResponse,
  KnowYourMarginReq,
  KnowYourMarginResponse,
  MultiScripMarginCalcRequest,
  MultiScripMarginCalcResponse,
} from "../generated";

import { HttpClient } from "../client/HttpClient";

export class Funds {
  constructor(private readonly httpClient: HttpClient) {}

  public async getLimit(): Promise<FundLimitResponse> {
    return this.httpClient.request<FundLimitResponse>({
      method: "GET",
      url: "/fundlimit",
      safeToRetry: true,
    });
  }

  public async calculateMargin(
    request: KnowYourMarginReq,
  ): Promise<KnowYourMarginResponse> {
    return this.httpClient.request<KnowYourMarginResponse, KnowYourMarginReq>({
      method: "POST",
      url: "/margincalculator",
      data: request,
      safeToRetry: false,
    });
  }

  public async calculateMultiMargin(
    request: MultiScripMarginCalcRequest,
  ): Promise<MultiScripMarginCalcResponse> {
    return this.httpClient.request<
      MultiScripMarginCalcResponse,
      MultiScripMarginCalcRequest
    >({
      method: "POST",
      url: "/margincalculator/multi",
      data: request,
      safeToRetry: false,
    });
  }
}
