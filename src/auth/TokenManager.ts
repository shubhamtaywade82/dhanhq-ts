import { AuthenticationError } from "../errors";
import type { DhanClientConfig } from "../types/common.types";
import { DhanAuth } from "./DhanAuth";
import type { TokenResponse } from "./TokenResponse";

export interface EnableAutoTokenManagementOptions {
  clientId: string;
  pin: string;
  /**
   * Base32 TOTP secret. Either this or {@link totpProvider} is required —
   * supply `totpProvider` instead when the code comes from a hardware token
   * or an external MFA service rather than a stored secret.
   */
  totpSecret?: string;
  /** Returns a current 6-digit code. Takes precedence over `totpSecret`. */
  totpProvider?: () => string | Promise<string>;
  /** How long before expiry to renew. Defaults to 5 minutes. */
  renewBeforeMs?: number;
  /** Called after every successful generate or renew. */
  onToken?: (token: TokenResponse) => void;
}

/**
 * Keeps a valid access token available, renewing it before it expires.
 *
 * Concurrent callers share one in-flight auth call. Without that, every
 * request arriving while the token is stale would start its own login, and
 * since generating a token can invalidate the previous one, a burst of
 * traffic could leave the SDK holding a token the broker has already
 * replaced.
 */
export class TokenManager {
  private token?: TokenResponse;
  private inFlight?: Promise<string>;
  private readonly renewBeforeMs: number;

  constructor(
    private readonly config: DhanClientConfig,
    private readonly options: EnableAutoTokenManagementOptions,
  ) {
    if (!options.totpSecret && !options.totpProvider) {
      throw new AuthenticationError(
        "TokenManager",
        "either totpSecret or totpProvider is required",
      );
    }

    this.renewBeforeMs = options.renewBeforeMs ?? 5 * 60 * 1000;
  }

  /** Returns a usable token, generating or renewing only when needed. */
  public async ensureValidToken(): Promise<string> {
    if (this.token && !this.token.needsRefresh(this.renewBeforeMs)) {
      return this.token.accessToken;
    }

    // Coalesce: whoever arrives while a login is in progress waits on it
    // rather than starting a competing one.
    this.inFlight ??= this.acquire().finally(() => {
      this.inFlight = undefined;
    });

    return this.inFlight;
  }

  /** Forces a fresh login, ignoring any cached token. */
  public async generate(): Promise<string> {
    const token = await DhanAuth.generateAccessToken({
      clientId: this.options.clientId,
      pin: this.options.pin,
      totp: await this.resolveTotp(),
    });

    return this.apply(token);
  }

  /**
   * Extends the current token, falling back to a full login.
   *
   * Renewal only works while the existing token is still valid, so an expired
   * or rejected token has to go through the PIN/TOTP path again.
   */
  public async refresh(): Promise<string> {
    if (!this.token) {
      return this.generate();
    }

    try {
      const renewed = await DhanAuth.renewWebToken({
        token: this.token.accessToken,
        clientId: this.options.clientId,
        baseURL: this.config.baseURL,
      });

      return this.apply(renewed);
    } catch (error) {
      if (error instanceof AuthenticationError) {
        return this.generate();
      }

      throw error;
    }
  }

  /** The current token, if one has been obtained. */
  public getToken(): TokenResponse | undefined {
    return this.token;
  }

  /** Drops the cached token so the next call logs in again. */
  public clear(): void {
    this.token = undefined;
    this.config.token = undefined;
  }

  private async acquire(): Promise<string> {
    return this.token ? this.refresh() : this.generate();
  }

  private async resolveTotp(): Promise<string> {
    if (this.options.totpProvider) {
      const totp = (await this.options.totpProvider()).trim();

      if (totp.length === 0) {
        throw new AuthenticationError(
          "TokenManager",
          "totpProvider returned an empty code",
        );
      }

      return totp;
    }

    return DhanAuth.generateTotp(this.options.totpSecret as string);
  }

  private apply(token: TokenResponse): string {
    this.token = token;
    this.config.token = token.accessToken;

    if (token.clientId) {
      this.config.clientId = token.clientId;
    }

    this.options.onToken?.(token);
    return token.accessToken;
  }
}
