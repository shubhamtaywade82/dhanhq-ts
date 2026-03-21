import type {
  EdisBulkFormRequest,
  EdisFormRequest,
  EdisFormResponse,
  EdisQtyStatusResponse,
} from "../generated";

import { HttpClient } from "../client/HttpClient";

export class Edis {
  constructor(private readonly httpClient: HttpClient) {}

  public async form(
    request: EdisFormRequest,
  ): Promise<EdisFormResponse> {
    return this.httpClient.request<EdisFormResponse, EdisFormRequest>({
      method: "POST",
      url: "/edis/form",
      data: request,
      safeToRetry: false,
    });
  }

  public async bulkForm(
    request: EdisBulkFormRequest,
  ): Promise<EdisFormResponse> {
    return this.httpClient.request<EdisFormResponse, EdisBulkFormRequest>({
      method: "POST",
      url: "/edis/bulkform",
      data: request,
      safeToRetry: false,
    });
  }

  public async requestTpin(): Promise<unknown> {
    return this.httpClient.request<unknown>({
      method: "GET",
      url: "/edis/tpin",
      safeToRetry: true,
    });
  }

  public async getQuantityStatus(isin: string): Promise<EdisQtyStatusResponse> {
    return this.httpClient.request<EdisQtyStatusResponse>({
      method: "GET",
      url: `/edis/inquire/${encodeURIComponent(isin)}`,
      safeToRetry: true,
    });
  }
}
