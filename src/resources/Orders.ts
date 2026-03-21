import { randomUUID } from "crypto";
import { ZodError } from "zod";

import { orderSchema } from "../contracts/order.schema";
import { ValidationError } from "../errors";
import type {
  OrderOperationResult,
  TickEvent,
} from "../types/common.types";
import type {
  ModifyOrderRequest,
  OrderResponse,
  PlaceOrderRequest,
  TradeResponse,
} from "../types/order.types";
import { HttpClient } from "../client/HttpClient";

export class Orders {
  constructor(private readonly httpClient: HttpClient) {}

  public async place(
    request: PlaceOrderRequest,
  ): Promise<OrderOperationResult<OrderResponse>> {
    const payload = this.parsePlaceRequest(request);
    const data = await this.httpClient.request<OrderResponse, PlaceOrderRequest>({
      method: "POST",
      url: "/orders",
      data: payload,
      safeToRetry: false,
    });

    return {
      correlationId: payload.correlationId,
      data: {
        ...data,
        correlationId: data.correlationId ?? payload.correlationId,
      },
    };
  }

  public async list(): Promise<OrderResponse[]> {
    return this.httpClient.request<OrderResponse[]>({
      method: "GET",
      url: "/orders",
      safeToRetry: true,
    });
  }

  public async getById(orderId: string): Promise<OrderResponse> {
    return this.httpClient.request<OrderResponse>({
      method: "GET",
      url: `/orders/${encodeURIComponent(orderId)}`,
      safeToRetry: true,
    });
  }

  public async getByCorrelationId(
    correlationId: string,
  ): Promise<OrderResponse> {
    return this.httpClient.request<OrderResponse>({
      method: "GET",
      url: `/orders/external/${encodeURIComponent(correlationId)}`,
      safeToRetry: true,
    });
  }

  public async getTrades(orderId: string): Promise<TradeResponse[]> {
    return this.httpClient.request<TradeResponse[]>({
      method: "GET",
      url: `/trades/${encodeURIComponent(orderId)}`,
      safeToRetry: true,
    });
  }

  public async modify(request: ModifyOrderRequest): Promise<OrderResponse> {
    return this.httpClient.request<OrderResponse, Omit<ModifyOrderRequest, "orderId">>(
      {
        method: "PUT",
        url: `/orders/${encodeURIComponent(request.orderId)}`,
        data: {
          orderType: request.orderType,
          validity: request.validity,
          quantity: request.quantity,
          disclosedQuantity: request.disclosedQuantity,
          price: request.price,
          triggerPrice: request.triggerPrice,
        },
        safeToRetry: false,
      },
    );
  }

  public async cancel(orderId: string): Promise<OrderResponse> {
    return this.httpClient.request<OrderResponse>({
      method: "DELETE",
      url: `/orders/${encodeURIComponent(orderId)}`,
      safeToRetry: false,
    });
  }

  private parsePlaceRequest(
    request: PlaceOrderRequest,
  ): PlaceOrderRequest & { correlationId: string; dhanClientId: string } {
    const payload: PlaceOrderRequest & {
      correlationId: string;
      dhanClientId: string;
    } = {
      ...request,
      correlationId: request.correlationId ?? randomUUID(),
      dhanClientId: request.dhanClientId ?? this.httpClient.getClientId(),
    };

    try {
      return orderSchema.parse(payload) as PlaceOrderRequest & {
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
