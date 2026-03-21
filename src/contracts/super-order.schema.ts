import { z } from "zod";

export const superOrderSchema = z
  .object({
    dhanClientId: z.string().min(1).optional(),
    correlationId: z.string().min(1).max(128).optional(),
    transactionType: z.enum(["BUY", "SELL"]),
    exchangeSegment: z.enum([
      "NSE_EQ",
      "NSE_FNO",
      "NSE_COMM",
      "BSE_EQ",
      "BSE_FNO",
      "MCX_COMM",
    ]),
    productType: z.enum(["CNC", "INTRADAY", "MARGIN", "MTF"]),
    orderType: z.enum(["MARKET", "LIMIT"]),
    quantity: z.number().int().positive(),
    price: z.number().nonnegative().optional(),
    targetPrice: z.number().nonnegative().optional(),
    stopLossPrice: z.number().nonnegative().optional(),
    trailingJump: z.number().nonnegative().optional(),
    securityId: z.string().min(1),
  })
  .superRefine((value, ctx) => {
    if (value.orderType === "LIMIT" && value.price === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "price is required for LIMIT super orders",
        path: ["price"],
      });
    }

    if (value.targetPrice === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "targetPrice is required for super orders",
        path: ["targetPrice"],
      });
    }

    if (value.stopLossPrice === undefined) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: "stopLossPrice is required for super orders",
        path: ["stopLossPrice"],
      });
    }
  });
