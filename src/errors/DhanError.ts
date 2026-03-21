export class DhanError extends Error {
  public readonly code: string;
  public readonly status?: number;
  public readonly details?: unknown;
  public readonly cause?: unknown;

  constructor(
    message: string,
    options: {
      code?: string;
      status?: number;
      details?: unknown;
      cause?: unknown;
    } = {},
  ) {
    super(message);
    this.name = "DhanError";
    this.code = options.code ?? "DHAN_ERROR";
    this.status = options.status;
    this.details = options.details;
    this.cause = options.cause;
  }
}
