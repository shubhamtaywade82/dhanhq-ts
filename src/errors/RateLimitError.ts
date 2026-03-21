import { DhanError } from "./DhanError";

export class RateLimitError extends DhanError {
  constructor(message = "Request rate limit exhausted", cause?: unknown) {
    super(message, {
      code: "RATE_LIMIT_ERROR",
      cause,
    });
    this.name = "RateLimitError";
  }
}
