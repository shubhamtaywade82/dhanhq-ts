import { ZodError } from "zod";

import { orderSchema } from "../contracts/order.schema";
import type { Pipeline } from "../risk/Pipeline";
import { riskTypeFor } from "../risk/Pipeline";
import type { Instrument } from "../resources/Instruments";
import type { RiskOrderArgs } from "../risk/types";

export interface OrderPreviewResult {
  valid: boolean;
  errors: string[];
  warnings: string[];
  action: "place_order";
  risk: "live_order_requires_confirmation";
  requires: string[];
  summary: string;
  riskChecks?: Array<{ check: string; message: string }>;
  order: Record<string, unknown>;
}

export interface OrderPreviewOptions {
  pipeline?: Pipeline;
  instrument?: Instrument;
}

/**
 * Validates and summarizes an order without placing it.
 *
 * Runs the same contract the live order path uses, then — when a risk pipeline
 * is supplied — collects *every* risk violation rather than stopping at the
 * first, so an agent sees the full picture before asking for confirmation.
 */
export async function previewOrder(
  params: Record<string, unknown>,
  options: OrderPreviewOptions = {},
): Promise<OrderPreviewResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  try {
    orderSchema.parse(params);
  } catch (error) {
    if (error instanceof ZodError) {
      errors.push(
        ...error.issues.map(
          (issue) => `${issue.path.join(".") || "order"}: ${issue.message}`,
        ),
      );
    } else {
      throw error;
    }
  }

  if (!params.correlationId) {
    warnings.push("correlationId is recommended for agent-originated orders");
  }

  let riskChecks: OrderPreviewResult["riskChecks"];
  if (options.pipeline) {
    const report = await options.pipeline.report({
      args: params as RiskOrderArgs,
      instrument: options.instrument,
      type: riskTypeFor(options.instrument),
    });

    riskChecks = report.violations;
    errors.push(...report.violations.map((v) => `${v.check}: ${v.message}`));
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
    action: "place_order",
    risk: "live_order_requires_confirmation",
    requires: ["orders:write", "DHANHQ_MCP_ENABLE_WRITES", "LIVE_TRADING"],
    summary: summarize(params),
    riskChecks,
    order: params,
  };
}

function summarize(params: Record<string, unknown>): string {
  const price = params.price === undefined ? "" : ` @ ${params.price}`;

  return (
    `${params.transactionType} ${params.quantity} of ` +
    `${params.exchangeSegment}:${params.securityId} as ${params.orderType}${price}`
  );
}
