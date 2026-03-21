import type { BoLedgerResponse } from "../generated";

import { HttpClient } from "../client/HttpClient";

export interface LedgerRequest {
  fromDate?: string;
  toDate?: string;
}

export class Statements {
  constructor(private readonly httpClient: HttpClient) {}

  public async ledger(request: LedgerRequest = {}): Promise<BoLedgerResponse> {
    return this.httpClient.request<BoLedgerResponse>({
      method: "GET",
      url: "/ledger",
      params: {
        "from-date": request.fromDate,
        "to-date": request.toDate,
      },
      safeToRetry: true,
    });
  }
}
