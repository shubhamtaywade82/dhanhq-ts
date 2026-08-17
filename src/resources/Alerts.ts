import type {
  AlertOrderResponse,
  GetAlertResponse,
} from "../generated";
import type { AlertConditionInput, AlertOrderInput } from "./ConditionalTriggers";

import { HttpClient } from "../client/HttpClient";

/**
 * Plain string-literal request shapes for {@link Alerts} — mirrors
 * {@link ConditionalTriggers}' `PlaceConditionalTriggerRequest`/
 * `ModifyConditionalTriggerRequest` (both resources wrap the same
 * `/alerts/orders` endpoints). Reusing `AlertConditionInput`/`AlertOrderInput`
 * keeps the enum-to-literal mapping in one place instead of duplicating it.
 */
export interface PlaceAlertRequest {
  dhanClientId: string;
  condition: AlertConditionInput;
  orders: AlertOrderInput[];
}

export interface ModifyAlertRequest {
  dhanClientId?: string;
  alertId?: string;
  condition?: AlertConditionInput;
  orders?: AlertOrderInput[];
}

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
    request: PlaceAlertRequest,
  ): Promise<AlertOrderResponse> {
    return this.httpClient.request<AlertOrderResponse, PlaceAlertRequest>({
      method: "POST",
      url: "/alerts/orders",
      data: request,
      safeToRetry: false,
    });
  }

  public async modify(
    alertId: string,
    request: ModifyAlertRequest,
  ): Promise<AlertOrderResponse> {
    return this.httpClient.request<AlertOrderResponse, ModifyAlertRequest>({
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
