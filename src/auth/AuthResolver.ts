import { DhanError } from "../errors";
import type { DhanClientConfig } from "../types/common.types";

export class AuthResolver {
  constructor(private readonly config: DhanClientConfig) {}

  public async resolveAccessToken(): Promise<string> {
    if (this.config.tokenProvider) {
      const token = await this.config.tokenProvider();
      if (!token || token.trim().length === 0) {
        throw new DhanError("tokenProvider returned an empty token", {
          code: "AUTHENTICATION_ERROR",
        });
      }

      return token;
    }

    if (!this.config.token || this.config.token.trim().length === 0) {
      throw new DhanError("Missing access token", {
        code: "AUTHENTICATION_ERROR",
      });
    }

    return this.config.token;
  }

  public async handleTokenExpired(error: unknown): Promise<void> {
    await this.config.onTokenExpired?.(error);
  }
}
