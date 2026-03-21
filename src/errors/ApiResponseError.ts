import { DhanError } from "./DhanError";

export class ApiResponseError extends DhanError {
  constructor(message: string, status: number, details?: unknown, cause?: unknown) {
    super(message, {
      code: "API_RESPONSE_ERROR",
      status,
      details,
      cause,
    });
    this.name = "ApiResponseError";
  }
}
