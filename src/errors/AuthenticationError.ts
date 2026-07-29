import { DhanError } from "./DhanError";

/**
 * A token generation or renewal call was refused.
 *
 * Carries the broker's own `errorMessage` where one was returned, since
 * "Invalid PIN" and "TOTP expired" need different fixes and the HTTP status
 * alone does not distinguish them.
 */
export class AuthenticationError extends DhanError {
  /** The auth operation that failed, e.g. `"GenerateAccessToken"`. */
  public readonly context: string;

  constructor(
    context: string,
    message: string,
    options: { status?: number; details?: unknown; cause?: unknown } = {},
  ) {
    super(`${context} failed: ${message}`, {
      code: "AUTHENTICATION_ERROR",
      status: options.status,
      details: options.details,
      cause: options.cause,
    });
    this.name = "AuthenticationError";
    this.context = context;
  }
}
