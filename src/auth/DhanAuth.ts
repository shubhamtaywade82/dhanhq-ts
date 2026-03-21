import { createHmac } from "crypto";

import axios, { type AxiosInstance } from "axios";

export interface GenerateAccessTokenRequest {
  clientId: string;
  pin: string;
  totp: string;
}

export interface RenewWebTokenRequest {
  token: string;
  clientId: string;
  baseURL?: string;
}

export interface TokenResponse {
  accessToken?: string;
  expiryTime?: string;
  dhanClientId?: string;
  access_token?: string;
  expiry_time?: string;
  [key: string]: unknown;
}

export interface DhanAuthDependencies {
  axiosInstance?: AxiosInstance;
}

export class DhanAuth {
  public static generateTotp(
    secret: string,
    options: { timestamp?: number; digits?: number; period?: number } = {},
  ): string {
    const digits = options.digits ?? 6;
    const period = options.period ?? 30;
    const timestamp = options.timestamp ?? Date.now();
    const counter = Math.floor(timestamp / 1000 / period);
    const key = base32Decode(secret);
    const buffer = Buffer.alloc(8);
    buffer.writeUInt32BE(Math.floor(counter / 0x100000000), 0);
    buffer.writeUInt32BE(counter % 0x100000000, 4);

    const digest = createHmac("sha1", key).update(buffer).digest();
    const offset = digest[digest.length - 1] & 0x0f;
    const code = (digest.readUInt32BE(offset) & 0x7fffffff) % 10 ** digits;

    return code.toString().padStart(digits, "0");
  }

  public static async generateAccessToken(
    request: GenerateAccessTokenRequest,
    dependencies: DhanAuthDependencies = {},
  ): Promise<TokenResponse> {
    const client =
      dependencies.axiosInstance ??
      axios.create({
        baseURL: "https://auth.dhan.co",
        timeout: 5000,
      });

    const response = await client.post<TokenResponse>(
      "/app/generateAccessToken",
      undefined,
      {
        params: {
          dhanClientId: request.clientId,
          pin: request.pin,
          totp: request.totp,
        },
        headers: {
          Accept: "application/json",
        },
      },
    );

    return response.data;
  }

  public static async renewWebToken(
    request: RenewWebTokenRequest,
    dependencies: DhanAuthDependencies = {},
  ): Promise<TokenResponse> {
    const client =
      dependencies.axiosInstance ??
      axios.create({
        baseURL: request.baseURL ?? "https://api.dhan.co/v2",
        timeout: 5000,
      });

    const response = await client.post<TokenResponse>(
      "/RenewToken",
      undefined,
      {
        headers: {
          "access-token": request.token,
          dhanClientId: request.clientId,
          Accept: "application/json",
        },
      },
    );

    return response.data;
  }
}

function base32Decode(input: string): Buffer {
  const alphabet = "ABCDEFGHIJKLMNOPQRSTUVWXYZ234567";
  const cleaned = input.toUpperCase().replace(/=+$/g, "").replace(/\s+/g, "");
  let bits = "";

  for (const char of cleaned) {
    const index = alphabet.indexOf(char);
    if (index === -1) {
      throw new Error(`Invalid base32 character: ${char}`);
    }
    bits += index.toString(2).padStart(5, "0");
  }

  const bytes: number[] = [];
  for (let offset = 0; offset + 8 <= bits.length; offset += 8) {
    bytes.push(Number.parseInt(bits.slice(offset, offset + 8), 2));
  }

  return Buffer.from(bytes);
}
