import { z } from "zod";

import {
  GLOBAL_LEG_NAMES,
  GLOBAL_ORDER_TYPES,
  GLOBAL_PRICED_ORDER_TYPES,
  GLOBAL_TRIGGERED_ORDER_TYPES,
  GlobalStocks,
  TRANSACTION_TYPES,
} from "../constants";

/**
 * Runtime contracts for the Global Stocks book.
 *
 * Deliberately separate from the domestic order schema: these requests carry
 * no exchange segment, product type or validity, and quantity is fractional
 * rather than a whole number of shares.
 */

const transactionType = z.enum(TRANSACTION_TYPES);
const globalOrderType = z.enum(GLOBAL_ORDER_TYPES);

export const globalPlaceOrderSchema = z
  .object({
    dhanClientId: z.string().min(1).optional(),
    correlationId: z
      .string()
      .min(1)
      .max(30)
      .regex(
        /^[a-zA-Z0-9 _-]*$/,
        "correlationId may only contain letters, numbers, spaces, underscores and hyphens",
      )
      .optional(),
    transactionType,
    orderType: globalOrderType,
    securityId: z.string().min(1).max(50),
    // Fractional, unlike the domestic book where quantity is a whole number.
    quantity: z.number().positive().optional(),
    price: z.number().nonnegative().finite().optional(),
    triggerPrice: z.number().positive().optional(),
    stopLossPrice: z.number().positive().optional(),
    targetPrice: z.number().positive().optional(),
    amount: z.number().positive().optional(),
    afterMarketOrder: z.boolean().optional(),
  })
  .superRefine((value, ctx) => {
    // An AMOUNT order spends dollars instead of buying a share count, so
    // exactly one of `amount` and `quantity` applies.
    if (value.orderType === GlobalStocks.OrderType.AMOUNT) {
      if (value.amount === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "amount is required for AMOUNT orders",
          path: ["amount"],
        });
      }
    } else if (value.quantity === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "quantity is required unless orderType is AMOUNT",
        path: ["quantity"],
      });
    }

    if (
      (GLOBAL_PRICED_ORDER_TYPES as readonly string[]).includes(
        value.orderType,
      ) &&
      !(value.price !== undefined && value.price > 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "price must be greater than 0 for LIMIT orders",
        path: ["price"],
      });
    }

    if (
      (GLOBAL_TRIGGERED_ORDER_TYPES as readonly string[]).includes(
        value.orderType,
      ) &&
      value.triggerPrice === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "triggerPrice is required for STOP_LOSS orders",
        path: ["triggerPrice"],
      });
    }

    // Bracket levels have to sit on the correct side of entry, or the order
    // is an instant stop-out rather than the position the caller intended.
    if (value.price === undefined || value.price <= 0) {
      return;
    }

    const { price, targetPrice, stopLossPrice } = value;

    if (value.transactionType === "BUY") {
      if (targetPrice !== undefined && targetPrice <= price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "targetPrice must be greater than price for BUY orders",
          path: ["targetPrice"],
        });
      }

      if (stopLossPrice !== undefined && stopLossPrice >= price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "stopLossPrice must be less than price for BUY orders",
          path: ["stopLossPrice"],
        });
      }
    } else {
      if (targetPrice !== undefined && targetPrice >= price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "targetPrice must be less than price for SELL orders",
          path: ["targetPrice"],
        });
      }

      if (stopLossPrice !== undefined && stopLossPrice <= price) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "stopLossPrice must be greater than price for SELL orders",
          path: ["stopLossPrice"],
        });
      }
    }
  });

export const globalModifyOrderSchema = z
  .object({
    orderId: z.string().min(1),
    transactionType,
    orderType: globalOrderType,
    securityId: z.string().min(1).max(50),
    quantity: z.number().positive().optional(),
    price: z.number().nonnegative().finite().optional(),
    legName: z.enum(GLOBAL_LEG_NAMES).optional(),
    dhanClientId: z.string().min(1).optional(),
  })
  .superRefine((value, ctx) => {
    if (
      (GLOBAL_PRICED_ORDER_TYPES as readonly string[]).includes(
        value.orderType,
      ) &&
      !(value.price !== undefined && value.price > 0)
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "price must be greater than 0 for LIMIT orders",
        path: ["price"],
      });
    }
  });

export const globalEstimateSchema = z.object({
  securityId: z.string().min(1).max(50),
  transactionType,
  price: z.number().nonnegative().finite(),
  quantity: z.number().positive().finite(),
});
