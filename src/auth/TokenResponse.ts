import { MARKET_HOURS } from "../constants";

/** Raw token payload, as returned by the auth endpoints. */
export interface RawTokenResponse {
  dhanClientId?: string;
  dhanClientName?: string;
  dhanClientUcc?: string;
  givenPowerOfAttorney?: boolean;
  accessToken?: string;
  expiryTime?: string;
  /** Some responses use snake_case; both spellings are accepted. */
  access_token?: string;
  expiry_time?: string;
  [key: string]: unknown;
}

const DEFAULT_REFRESH_BUFFER_MS = 5 * 60 * 1000;

/**
 * A parsed access token with its expiry.
 *
 * Wraps the raw payload so expiry handling lives in one place rather than
 * being re-derived by every caller that needs to know whether a token is
 * still good.
 */
export class TokenResponse {
  public readonly accessToken: string;
  public readonly clientId?: string;
  public readonly clientName?: string;
  public readonly ucc?: string;
  public readonly powerOfAttorney?: boolean;
  /** Epoch milliseconds, or `undefined` when the response carried no expiry. */
  public readonly expiresAt?: number;
  public readonly raw: RawTokenResponse;

  constructor(raw: RawTokenResponse) {
    const accessToken = raw.accessToken ?? raw.access_token;

    if (typeof accessToken !== "string" || accessToken.length === 0) {
      throw new Error("Token response did not contain an accessToken");
    }

    this.accessToken = accessToken;
    this.clientId = raw.dhanClientId;
    this.clientName = raw.dhanClientName;
    this.ucc = raw.dhanClientUcc;
    this.powerOfAttorney = raw.givenPowerOfAttorney;
    this.expiresAt = parseExpiry(raw.expiryTime ?? raw.expiry_time);
    this.raw = raw;
  }

  /**
   * True when the token is past its expiry. A response with no expiry is
   * treated as expired, so an unparseable payload fails closed rather than
   * being trusted indefinitely.
   */
  public isExpired(now: number = Date.now()): boolean {
    return this.expiresAt === undefined || now >= this.expiresAt;
  }

  /** Milliseconds until expiry, floored at 0. */
  public expiresIn(now: number = Date.now()): number {
    if (this.expiresAt === undefined) {
      return 0;
    }

    return Math.max(this.expiresAt - now, 0);
  }

  /** True once the token is inside `bufferMs` of expiring. */
  public needsRefresh(
    bufferMs: number = DEFAULT_REFRESH_BUFFER_MS,
    now: number = Date.now(),
  ): boolean {
    if (this.expiresAt === undefined) {
      return true;
    }

    return now >= this.expiresAt - bufferMs;
  }
}

/**
 * Parses a Dhan expiry timestamp.
 *
 * Dhan returns IST timestamps, and the ECMAScript spec parses a date-time
 * string with no timezone designator as *local* time. On a UTC server that
 * reads an IST expiry as 5.5 hours later than it really is, so the token
 * looks valid well after the API has started rejecting it. Timestamps
 * without an explicit offset are therefore pinned to IST.
 */
export function parseExpiry(value: string | undefined): number | undefined {
  if (!value || value.trim().length === 0) {
    return undefined;
  }

  const trimmed = value.trim();
  const hasZone = /(?:Z|[+-]\d{2}:?\d{2})$/.test(trimmed);
  const istOffset = `+${String(Math.floor(MARKET_HOURS.timezoneOffsetMinutes / 60)).padStart(2, "0")}:${String(
    MARKET_HOURS.timezoneOffsetMinutes % 60,
  ).padStart(2, "0")}`;

  // A bare `YYYY-MM-DD HH:mm:ss` needs the separator normalized before an
  // offset can be appended.
  const normalized = hasZone
    ? trimmed
    : `${trimmed.replace(" ", "T")}${istOffset}`;

  const parsed = Date.parse(normalized);
  return Number.isNaN(parsed) ? undefined : parsed;
}
