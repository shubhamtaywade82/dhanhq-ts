import { z } from "zod";

const DATE_REGEX = /^\d{4}-\d{2}-\d{2}$/;

export const intradayChartsSchema = z
  .object({
    securityId: z.string().min(1, "securityId is required"),
    exchangeSegment: z.enum([
      "NSE_EQ",
      "NSE_FNO",
      "BSE_EQ",
      "BSE_FNO",
      "MCX_COMM",
      "IDX_I",
      "NSE_CURRENCY",
    ]),
    instrument: z.enum([
      "INDEX",
      "FUTIDX",
      "OPTIDX",
      "EQUITY",
      "FUTSTK",
      "OPTSTK",
      "FUTCOM",
      "OPTFUT",
    ]),
    interval: z.enum(["1", "5", "15", "25", "60"]).or(z.number().transform(String)),
    oi: z.boolean().optional(),
    fromDate: z.string().regex(DATE_REGEX, "fromDate must be YYYY-MM-DD format").optional(),
    toDate: z.string().regex(DATE_REGEX, "toDate must be YYYY-MM-DD format").optional(),
  })
  .superRefine((val, ctx) => {
    if (val.fromDate && val.toDate && val.fromDate > val.toDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `fromDate (${val.fromDate}) must be <= toDate (${val.toDate})`,
        path: ["fromDate"],
      });
    }
  });

export const historicalChartsSchema = z
  .object({
    securityId: z.string().min(1, "securityId is required"),
    exchangeSegment: z.enum([
      "NSE_EQ",
      "NSE_FNO",
      "BSE_EQ",
      "BSE_FNO",
      "MCX_COMM",
      "IDX_I",
      "NSE_CURRENCY",
    ]),
    instrument: z.enum([
      "INDEX",
      "FUTIDX",
      "OPTIDX",
      "EQUITY",
      "FUTSTK",
      "OPTSTK",
      "FUTCOM",
      "OPTFUT",
    ]),
    fromDate: z.string().regex(DATE_REGEX, "fromDate must be YYYY-MM-DD format"),
    toDate: z.string().regex(DATE_REGEX, "toDate must be YYYY-MM-DD format"),
  })
  .superRefine((val, ctx) => {
    if (val.fromDate > val.toDate) {
      ctx.addIssue({
        code: z.ZodIssueCode.custom,
        message: `fromDate (${val.fromDate}) must be <= toDate (${val.toDate})`,
        path: ["fromDate"],
      });
    }
  });
