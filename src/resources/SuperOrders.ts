import { randomUUID } from "crypto";
import { ZodError } from "zod";

import { HttpClient } from "../client/HttpClient";
import { superOrderSchema } from "../contracts/super-order.schema";
import { ValidationError } from "../errors";
import type { OrderOperationResult } from "../types/common.types";
import type {
  CancelSuperOrderRequest,
  ModifySuperOrderRequest,
  PlaceSuperOrderRequest,
  SuperOrderResponse,
} from "../types/super-order.types";

export class SuperOrders {
  constructor(private readonly httpClient: HttpClient) {}

  public async place(
    request: PlaceSuperOrderRequest,
  ): Promise<OrderOperationResult<SuperOrderResponse>> {
    const payload = this.parsePlaceRequest(request);
    const data = await this.httpClient.request<
      SuperOrderResponse,
      PlaceSuperOrderRequest
    >({
      method: "POST",
      url: "/super/orders",
      data: payload,
      safeToRetry: false,
      tier: "order_api",
    });

    return {
      correlationId: payload.correlationId,
      data: {
        ...data,
        correlationId: data.correlationId ?? payload.correlationId,
      },
    };
  }

  public async list(): Promise<SuperOrderResponse[]> {
    return this.httpClient.request<SuperOrderResponse[]>({
      method: "GET",
      url: "/super/orders",
      safeToRetry: true,
      tier: "order_api",
    });
  }

  public async modify(
    request: ModifySuperOrderRequest,
  ): Promise<SuperOrderResponse> {
    return this.httpClient.request<
      SuperOrderResponse,
      Omit<ModifySuperOrderRequest, "orderId">
    >({
      method: "PUT",
      url: `/super/orders/${encodeURIComponent(request.orderId)}`,
      data: {
        price: request.price,
        targetPrice: request.targetPrice,
        stopLossPrice: request.stopLossPrice,
        quantity: request.quantity,
      },
      safeToRetry: false,
      tier: "order_api",
    });
  }

  public async cancel(
    request: CancelSuperOrderRequest,
  ): Promise<SuperOrderResponse> {
    return this.httpClient.request<SuperOrderResponse>({
      method: "DELETE",
      url: `/super/orders/${encodeURIComponent(request.orderId)}/${encodeURIComponent(
        request.orderLeg,
      )}`,
      safeToRetry: false,
      tier: "order_api",
    });
  }

  private parsePlaceRequest(
    request: PlaceSuperOrderRequest,
  ): PlaceSuperOrderRequest & {
    correlationId: string;
    dhanClientId: string;
  } {
    const payload: PlaceSuperOrderRequest & {
      correlationId: string;
      dhanClientId: string;
    } = {
      ...request,
      correlationId: request.correlationId ?? randomUUID(),
      dhanClientId: request.dhanClientId ?? this.httpClient.getClientId(),
    };

    try {
      return superOrderSchema.parse(payload) as PlaceSuperOrderRequest & {
        correlationId: string;
        dhanClientId: string;
      };
    } catch (error) {
      if (error instanceof ZodError) {
        throw new ValidationError(error);
      }

      throw error;
    }
  }
}
