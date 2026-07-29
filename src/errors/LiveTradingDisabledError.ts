import { DhanError } from "./DhanError";

/**
 * A write tool was invoked without the live-trading gate open.
 *
 * Agent and MCP write paths require both `DHANHQ_MCP_ENABLE_WRITES=true` and
 * `LIVE_TRADING=true`, so an agent cannot place orders by default.
 */
export class LiveTradingDisabledError extends DhanError {
  constructor(
    message = "Write tools require DHANHQ_MCP_ENABLE_WRITES=true and LIVE_TRADING=true",
  ) {
    super(message, { code: "LIVE_TRADING_DISABLED" });
    this.name = "LiveTradingDisabledError";
  }
}
