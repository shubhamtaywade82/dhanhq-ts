import { ZodError } from "zod";

import { DhanError } from "./DhanError";

export class ValidationError extends DhanError {
  public readonly issues: ZodError["issues"];

  constructor(error: ZodError) {
    super("Request validation failed", {
      code: "VALIDATION_ERROR",
      details: error.flatten(),
      cause: error,
    });
    this.name = "ValidationError";
    this.issues = error.issues;
  }
}
