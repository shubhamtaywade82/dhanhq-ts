import { AuthenticationError } from "../errors";
import type { DhanClientConfig } from "../types/common.types";

export class AuthResolver {
  constructor(private readonly config: DhanClientConfig) {}

  public async resolveAccessToken(): Promise<string> {
    if (this.config.tokenProvider) {
      const token = await this.config.tokenProvider();
      if (!token || token.trim().length === 0) {
        throw new AuthenticationError(
          "ResolveAccessToken",
          "tokenProvider returned an empty token",
        );
      }

      return token;
    }

    if (!this.config.token || this.config.token.trim().length === 0) {
      throw new AuthenticationError(
        "ResolveAccessToken",
        "no access token configured — set `token`, `tokenProvider`, or call " +
          "`client.auth.enableAutoTokenManagement(...)`",
      );
    }

    return this.config.token;
  }

  public async handleTokenExpired(error: unknown): Promise<void> {
    await this.config.onTokenExpired?.(error);
  }
}
