import { DhanError } from "./DhanError";

export class NetworkError extends DhanError {
  constructor(message: string, cause?: unknown) {
    super(message, {
      code: "NETWORK_ERROR",
      cause,
    });
    this.name = "NetworkError";
  }
}
