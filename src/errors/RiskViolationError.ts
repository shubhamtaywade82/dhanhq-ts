import { DhanError } from "./DhanError";

/**
 * A pre-trade risk check rejected the order. Raised by the risk pipeline
 * before anything reaches the broker, so no order was placed.
 */
export class RiskViolationError extends DhanError {
  /** Name of the check that rejected the order, e.g. `"quantity"`. */
  public readonly check: string;

  constructor(check: string, message: string, details?: unknown) {
    super(message, { code: "RISK_VIOLATION", details });
    this.name = "RiskViolationError";
    this.check = check;
  }
}
