import type {
  ExchangeSegment,
  OrderType,
  ProductType,
  TransactionType,
  Validity,
} from "./order.types";
import type { CorrelatedRequest } from "./common.types";

export interface PlaceSuperOrderRequest extends CorrelatedRequest {
  dhanClientId?: string;
  transactionType: TransactionType;
  exchangeSegment: ExchangeSegment;
  productType: Exclude<ProductType, "BO" | "CO"> | "BO" | "CO";
  orderType: OrderType;
  validity?: Validity;
  quantity: number;
  price?: number;
  triggerPrice?: number;
  targetPrice?: number;
  stopLossPrice?: number;
  trailingJump?: number;
  securityId: string;
}

export interface ModifySuperOrderRequest {
  orderId: string;
  price?: number;
  triggerPrice?: number;
  targetPrice?: number;
  stopLossPrice?: number;
  quantity?: number;
}

export interface SuperOrderResponse {
  orderId: string;
  orderStatus?: string;
  correlationId?: string;
  [key: string]: unknown;
}
