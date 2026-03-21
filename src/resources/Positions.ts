import { HttpClient } from "../client/HttpClient";

export interface PositionResponse {
  [key: string]: unknown;
}

export class Positions {
  constructor(private readonly httpClient: HttpClient) {}

  public async list(): Promise<PositionResponse[]> {
    return this.httpClient.request<PositionResponse[]>({
      method: "GET",
      url: "/positions",
      safeToRetry: true,
    });
  }

  public async listHoldings(): Promise<PositionResponse[]> {
    return this.httpClient.request<PositionResponse[]>({
      method: "GET",
      url: "/holdings",
      safeToRetry: true,
    });
  }
}
