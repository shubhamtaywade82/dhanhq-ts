import { z } from "zod";

export const superOrderSchema = z
  .object({
    dhanClientId: z.string().min(1).optional(),
    correlationId: z.string().min(1).max(128).optional(),
    transactionType: z.enum(["BUY", "SELL"]),
    exchangeSegment: z.enum([
      "NSE_EQ",
      "NSE_FNO",
      "NSE_CURRENCY",
      "BSE_EQ",
      "MCX_COMM",
    ]),
    productType: z.enum(["CNC", "INTRADAY", "MARGIN", "MTF", "BO", "CO"]),
    orderType: z.enum([
      "MARKET",
      "LIMIT",
      "STOP_LOSS",
      "STOP_LOSS_MARKET",
    ]),
    validity: z.enum(["DAY", "IOC"]).optional(),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative().optional(),
    triggerPrice: z.number().nonnegative().optional(),
    targetPrice: z.number().nonnegative().optional(),
    stopLossPrice: z.number().nonnegative().optional(),
    trailingJump: z.number().nonnegative().optional(),
    securityId: z.string().min(1),
  })
  .superRefine((value, ctx) => {
    if (
      (value.orderType === "LIMIT" || value.orderType === "STOP_LOSS") &&
      value.price === undefined
    ) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "price is required for LIMIT and STOP_LOSS super orders",
        path: ["price"],
      });
    }

    if (value.productType === "BO") {
      if (value.targetPrice === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "targetPrice is required for BO super orders",
          path: ["targetPrice"],
        });
      }

      if (value.stopLossPrice === undefined) {
        ctx.addIssue({
          code: z.ZodIssueCode.custom,
          message: "stopLossPrice is required for BO super orders",
          path: ["stopLossPrice"],
        });
      }
    }
  });
