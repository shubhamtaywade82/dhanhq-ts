import type {
  AlertModifyRequest,
  AlertOrderRequest,
  AlertOrderResponse,
  GetAlertResponse,
} from "../generated";

import { HttpClient } from "../client/HttpClient";

export class Alerts {
  constructor(private readonly httpClient: HttpClient) {}

  public async list(): Promise<GetAlertResponse[]> {
    return this.httpClient.request<GetAlertResponse[]>({
      method: "GET",
      url: "/alerts/orders",
      safeToRetry: true,
    });
  }

  public async getById(alertId: string): Promise<GetAlertResponse> {
    return this.httpClient.request<GetAlertResponse>({
      method: "GET",
      url: `/alerts/orders/${encodeURIComponent(alertId)}`,
      safeToRetry: true,
    });
  }

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

  public async modify(
    alertId: string,
    request: AlertModifyRequest,
  ): Promise<AlertOrderResponse> {
    return this.httpClient.request<AlertOrderResponse, AlertModifyRequest>({
      method: "PUT",
      url: `/alerts/orders/${encodeURIComponent(alertId)}`,
      data: request,
      safeToRetry: false,
    });
  }

  public async delete(alertId: string): Promise<AlertOrderResponse> {
    return this.httpClient.request<AlertOrderResponse>({
      method: "DELETE",
      url: `/alerts/orders/${encodeURIComponent(alertId)}`,
      safeToRetry: false,
    });
  }
}
