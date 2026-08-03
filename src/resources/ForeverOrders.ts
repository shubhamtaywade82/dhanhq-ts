import type {
  GttModifyRequest,
  GTTOrderModel,
  GttOrderResponse,
  GttOrderStatusResponse,
} from "../generated";

import { HttpClient } from "../client/HttpClient";

export class ForeverOrders {
  constructor(private readonly httpClient: HttpClient) {}

  public async list(): Promise<GttOrderResponse[]> {
    return this.httpClient.request<GttOrderResponse[]>({
      method: "GET",
      url: "/forever/orders",
      safeToRetry: true,
      tier: "order_api",
    });
  }

  public async place(
    request: GTTOrderModel,
  ): Promise<GttOrderStatusResponse> {
    return this.httpClient.request<GttOrderStatusResponse, GTTOrderModel>({
      method: "POST",
      url: "/forever/orders",
      data: request,
      safeToRetry: false,
      tier: "order_api",
    });
  }

  public async modify(
    orderId: string,
    request: GttModifyRequest,
  ): Promise<GttOrderStatusResponse> {
    return this.httpClient.request<GttOrderStatusResponse, GttModifyRequest>({
      method: "PUT",
      url: `/forever/orders/${encodeURIComponent(orderId)}`,
      data: request,
      safeToRetry: false,
      tier: "order_api",
    });
  }

  public async cancel(orderId: string): Promise<GttOrderStatusResponse> {
    return this.httpClient.request<GttOrderStatusResponse>({
      method: "DELETE",
      url: `/forever/orders/${encodeURIComponent(orderId)}`,
      safeToRetry: false,
      tier: "order_api",
    });
  }
}
