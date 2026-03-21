import type {
  HoldingResponse,
  PositionConversionRequest,
  PositionResponse,
  UserIPResponse,
} from "../generated";

import { HttpClient } from "../client/HttpClient";

export class Positions {
  constructor(private readonly httpClient: HttpClient) {}

  public async list(): Promise<PositionResponse[]> {
    return this.httpClient.request<PositionResponse[]>({
      method: "GET",
      url: "/positions",
      safeToRetry: true,
    });
  }

  public async listHoldings(): Promise<HoldingResponse[]> {
    return this.httpClient.request<HoldingResponse[]>({
      method: "GET",
      url: "/holdings",
      safeToRetry: true,
    });
  }

  public async convert(
    request: PositionConversionRequest,
  ): Promise<unknown> {
    return this.httpClient.request<unknown, PositionConversionRequest>({
      method: "POST",
      url: "/positions/convert",
      data: request,
      safeToRetry: false,
    });
  }

  public async exitAll(): Promise<UserIPResponse> {
    return this.httpClient.request<UserIPResponse>({
      method: "DELETE",
      url: "/positions",
      safeToRetry: false,
    });
  }
}
