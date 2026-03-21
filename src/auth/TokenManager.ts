import type { DhanClientConfig } from "../types/common.types";
import { DhanAuth, type TokenResponse } from "./DhanAuth";

export interface EnableAutoTokenManagementOptions {
  clientId: string;
  pin: string;
  totpSecret: string;
  renewBeforeMs?: number;
}

export class TokenManager {
  private token?: string;
  private expiryAt?: number;
  private readonly renewBeforeMs: number;

  constructor(
    private readonly config: DhanClientConfig,
    private readonly options: EnableAutoTokenManagementOptions,
  ) {
    this.renewBeforeMs = options.renewBeforeMs ?? 5 * 60 * 1000;
  }

  public async ensureValidToken(): Promise<string> {
    if (!this.token) {
      return this.generate();
    }

    if (!this.needsRefresh()) {
      return this.token;
    }

    return this.refresh();
  }

  public async generate(): Promise<string> {
    const totp = DhanAuth.generateTotp(this.options.totpSecret);
    const response = await DhanAuth.generateAccessToken({
      clientId: this.options.clientId,
      pin: this.options.pin,
      totp,
    });

    return this.apply(response);
  }

  public async refresh(): Promise<string> {
    if (!this.token) {
      return this.generate();
    }

    try {
      const response = await DhanAuth.renewWebToken({
        token: this.token,
        clientId: this.options.clientId,
        baseURL: this.config.baseURL,
      });

      return this.apply(response);
    } catch {
      return this.generate();
    }
  }

  private apply(response: TokenResponse): string {
    const accessToken =
      typeof response.accessToken === "string"
        ? response.accessToken
        : typeof response.access_token === "string"
          ? response.access_token
          : undefined;

    if (!accessToken) {
      throw new Error("Token response did not contain accessToken");
    }

    this.token = accessToken;
    this.config.token = accessToken;

    const expiryTime =
      typeof response.expiryTime === "string"
        ? response.expiryTime
        : typeof response.expiry_time === "string"
          ? response.expiry_time
          : undefined;

    this.expiryAt = expiryTime ? Date.parse(expiryTime) : undefined;
    return accessToken;
  }

  private needsRefresh(): boolean {
    if (!this.expiryAt) {
      return false;
    }

    return Date.now() >= this.expiryAt - this.renewBeforeMs;
  }
}
