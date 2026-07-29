import type { AxiosInstance } from "axios";

import {
  AuthenticationError,
  AuthResolver,
  DhanAuth,
  DhanClient,
  parseExpiry,
  TokenManager,
  TokenResponse,
} from "../src";

function axiosStub(
  handler: (config: unknown) => Promise<{ data: unknown }>,
): AxiosInstance {
  return { post: jest.fn(handler), get: jest.fn(handler) } as unknown as AxiosInstance;
}

function httpError(status: number, data: unknown) {
  const error = new Error(`Request failed with status code ${status}`) as Error & {
    isAxiosError: boolean;
    response: { status: number; data: unknown };
  };
  error.isAxiosError = true;
  error.response = { status, data };
  return error;
}

const TOKEN_PAYLOAD = {
  dhanClientId: "1000000001",
  dhanClientName: "Test User",
  dhanClientUcc: "UCC123",
  givenPowerOfAttorney: true,
  accessToken: "token-1",
  expiryTime: "2030-01-01T09:30:00",
};

describe("TOTP", () => {
  it("matches the RFC 6238 test vector", () => {
    expect(DhanAuth.generateTotp("JBSWY3DPEHPK3PXP", { timestamp: 0 })).toBe(
      "282760",
    );
  });

  it("changes on the next time step and honours digit count", () => {
    const first = DhanAuth.generateTotp("JBSWY3DPEHPK3PXP", { timestamp: 0 });
    const next = DhanAuth.generateTotp("JBSWY3DPEHPK3PXP", { timestamp: 30_000 });

    expect(next).not.toBe(first);
    expect(
      DhanAuth.generateTotp("JBSWY3DPEHPK3PXP", { timestamp: 0, digits: 8 }),
    ).toHaveLength(8);
  });

  it("reports the seconds left in the current window", () => {
    expect(DhanAuth.totpSecondsRemaining({ timestamp: 0 })).toBe(30);
    expect(DhanAuth.totpSecondsRemaining({ timestamp: 25_000 })).toBe(5);
  });

  it("rejects a malformed base32 secret", () => {
    expect(() => DhanAuth.generateTotp("not-base32!")).toThrow(
      /Invalid base32 character/,
    );
  });
});

describe("expiry parsing", () => {
  it("treats a timestamp without an offset as IST, not local time", () => {
    // 09:30 IST is 04:00 UTC. Parsed as local time on a UTC host this would
    // land 5.5 hours late, leaving an expired token looking valid.
    expect(parseExpiry("2030-01-01T09:30:00")).toBe(
      Date.parse("2030-01-01T04:00:00Z"),
    );
  });

  it("respects an explicit offset when one is present", () => {
    expect(parseExpiry("2030-01-01T04:00:00Z")).toBe(
      Date.parse("2030-01-01T04:00:00Z"),
    );
    expect(parseExpiry("2030-01-01T09:30:00+05:30")).toBe(
      Date.parse("2030-01-01T04:00:00Z"),
    );
  });

  it("accepts a space-separated timestamp", () => {
    expect(parseExpiry("2030-01-01 09:30:00")).toBe(
      Date.parse("2030-01-01T04:00:00Z"),
    );
  });

  it("returns undefined for empty or unparseable input", () => {
    expect(parseExpiry(undefined)).toBeUndefined();
    expect(parseExpiry("   ")).toBeUndefined();
    expect(parseExpiry("not a date")).toBeUndefined();
  });
});

describe("TokenResponse", () => {
  it("exposes the account fields from the payload", () => {
    const token = new TokenResponse(TOKEN_PAYLOAD);

    expect(token).toMatchObject({
      accessToken: "token-1",
      clientId: "1000000001",
      clientName: "Test User",
      ucc: "UCC123",
      powerOfAttorney: true,
    });
  });

  it("accepts snake_case payloads", () => {
    const token = new TokenResponse({
      access_token: "token-2",
      expiry_time: "2030-01-01T09:30:00",
    });

    expect(token.accessToken).toBe("token-2");
    expect(token.expiresAt).toBeDefined();
  });

  it("throws when no access token is present", () => {
    expect(() => new TokenResponse({})).toThrow(/did not contain an accessToken/);
  });

  it("reports expiry, time remaining and refresh need", () => {
    const expiresAt = Date.parse("2030-01-01T04:00:00Z");
    const token = new TokenResponse(TOKEN_PAYLOAD);

    expect(token.expiresAt).toBe(expiresAt);
    expect(token.isExpired(expiresAt - 1000)).toBe(false);
    expect(token.isExpired(expiresAt)).toBe(true);
    expect(token.expiresIn(expiresAt - 60_000)).toBe(60_000);
    // Never negative, even well past expiry.
    expect(token.expiresIn(expiresAt + 60_000)).toBe(0);

    expect(token.needsRefresh(5 * 60_000, expiresAt - 6 * 60_000)).toBe(false);
    expect(token.needsRefresh(5 * 60_000, expiresAt - 4 * 60_000)).toBe(true);
  });

  it("fails closed when the payload carries no expiry", () => {
    const token = new TokenResponse({ accessToken: "t" });

    // Unknown expiry is treated as expired rather than trusted forever.
    expect(token.isExpired()).toBe(true);
    expect(token.needsRefresh()).toBe(true);
    expect(token.expiresIn()).toBe(0);
  });
});

describe("DhanAuth error normalization", () => {
  it("surfaces the broker's errorMessage as an AuthenticationError", async () => {
    const stub = axiosStub(async () => {
      throw httpError(401, { errorMessage: "Invalid PIN" });
    });

    const failure = DhanAuth.generateAccessToken(
      { clientId: "c", pin: "0000", totp: "000000" },
      { axiosInstance: stub },
    );

    await expect(failure).rejects.toBeInstanceOf(AuthenticationError);
    await expect(failure).rejects.toThrow(
      "GenerateAccessToken failed: Invalid PIN",
    );

    await failure.catch((error: AuthenticationError) => {
      expect(error.status).toBe(401);
      expect(error.code).toBe("AUTHENTICATION_ERROR");
      expect(error.context).toBe("GenerateAccessToken");
    });
  });

  it("falls back to the status when the body carries no message", async () => {
    const stub = axiosStub(async () => {
      throw httpError(500, {});
    });

    await expect(
      DhanAuth.generateAccessToken(
        { clientId: "c", pin: "0", totp: "0" },
        { axiosInstance: stub },
      ),
    ).rejects.toThrow(/HTTP 500/);
  });

  it("wraps transport failures with no response", async () => {
    const stub = axiosStub(async () => {
      throw new Error("socket hang up");
    });

    await expect(
      DhanAuth.renewWebToken(
        { token: "t", clientId: "c" },
        { axiosInstance: stub },
      ),
    ).rejects.toThrow("RenewToken failed: socket hang up");
  });

  it("returns a parsed TokenResponse on success", async () => {
    const stub = axiosStub(async () => ({ data: TOKEN_PAYLOAD }));

    const token = await DhanAuth.generateAccessToken(
      { clientId: "c", pin: "1234", totp: "123456" },
      { axiosInstance: stub },
    );

    expect(token).toBeInstanceOf(TokenResponse);
    expect(token.accessToken).toBe("token-1");
  });
});

describe("TokenManager", () => {
  function managerWith(handler: () => Promise<{ data: unknown }>) {
    const config = { clientId: "c", token: undefined as string | undefined };
    const generate = jest.spyOn(DhanAuth, "generateAccessToken");
    const renew = jest.spyOn(DhanAuth, "renewWebToken");

    generate.mockImplementation(async () =>
      handler().then((r) => new TokenResponse(r.data as never)),
    );
    renew.mockImplementation(async () =>
      handler().then((r) => new TokenResponse(r.data as never)),
    );

    return { config, generate, renew };
  }

  afterEach(() => {
    jest.restoreAllMocks();
  });

  it("requires either a TOTP secret or a provider", () => {
    expect(
      () =>
        new TokenManager({ clientId: "c" } as never, {
          clientId: "c",
          pin: "1234",
        }),
    ).toThrow(/either totpSecret or totpProvider/);
  });

  it("coalesces concurrent callers into a single login", async () => {
    let calls = 0;
    const { config, generate } = managerWith(async () => {
      calls += 1;
      await new Promise((resolve) => setTimeout(resolve, 10));
      return { data: TOKEN_PAYLOAD };
    });

    const manager = new TokenManager(config as never, {
      clientId: "c",
      pin: "1234",
      totpSecret: "JBSWY3DPEHPK3PXP",
    });

    const tokens = await Promise.all(
      Array.from({ length: 5 }, () => manager.ensureValidToken()),
    );

    // Generating a token can invalidate the previous one, so five parallel
    // logins could leave the SDK holding a token the broker already replaced.
    expect(calls).toBe(1);
    expect(generate).toHaveBeenCalledTimes(1);
    expect(tokens).toEqual(Array(5).fill("token-1"));
  });

  it("serves a cached token without hitting the network again", async () => {
    const { config, generate } = managerWith(async () => ({
      data: TOKEN_PAYLOAD,
    }));

    const manager = new TokenManager(config as never, {
      clientId: "c",
      pin: "1234",
      totpSecret: "JBSWY3DPEHPK3PXP",
    });

    await manager.ensureValidToken();
    await manager.ensureValidToken();

    expect(generate).toHaveBeenCalledTimes(1);
  });

  it("writes the token and client id back onto the config", async () => {
    const { config } = managerWith(async () => ({ data: TOKEN_PAYLOAD }));

    const manager = new TokenManager(config as never, {
      clientId: "c",
      pin: "1234",
      totpSecret: "JBSWY3DPEHPK3PXP",
    });

    await manager.ensureValidToken();

    expect(config.token).toBe("token-1");
    expect(manager.getToken()?.clientName).toBe("Test User");
  });

  it("accepts an externally supplied TOTP", async () => {
    const { config, generate } = managerWith(async () => ({
      data: TOKEN_PAYLOAD,
    }));
    const totpProvider = jest.fn(async () => "654321");

    const manager = new TokenManager(config as never, {
      clientId: "c",
      pin: "1234",
      totpProvider,
    });

    await manager.ensureValidToken();

    expect(totpProvider).toHaveBeenCalled();
    expect(generate).toHaveBeenCalledWith(
      expect.objectContaining({ totp: "654321" }),
    );
  });

  it("rejects an empty code from the provider", async () => {
    const { config } = managerWith(async () => ({ data: TOKEN_PAYLOAD }));

    const manager = new TokenManager(config as never, {
      clientId: "c",
      pin: "1234",
      totpProvider: () => "   ",
    });

    await expect(manager.ensureValidToken()).rejects.toThrow(
      /totpProvider returned an empty code/,
    );
  });

  it("falls back to a full login when renewal is refused", async () => {
    const config = { clientId: "c", token: undefined as string | undefined };
    const generate = jest
      .spyOn(DhanAuth, "generateAccessToken")
      .mockResolvedValue(new TokenResponse(TOKEN_PAYLOAD));
    const renew = jest
      .spyOn(DhanAuth, "renewWebToken")
      .mockRejectedValue(new AuthenticationError("RenewToken", "expired"));

    const manager = new TokenManager(config as never, {
      clientId: "c",
      pin: "1234",
      totpSecret: "JBSWY3DPEHPK3PXP",
    });

    await manager.ensureValidToken();
    await expect(manager.refresh()).resolves.toBe("token-1");

    expect(renew).toHaveBeenCalledTimes(1);
    expect(generate).toHaveBeenCalledTimes(2);
  });

  it("notifies onToken after each successful login", async () => {
    const { config } = managerWith(async () => ({ data: TOKEN_PAYLOAD }));
    const onToken = jest.fn();

    const manager = new TokenManager(config as never, {
      clientId: "c",
      pin: "1234",
      totpSecret: "JBSWY3DPEHPK3PXP",
      onToken,
    });

    await manager.ensureValidToken();

    expect(onToken).toHaveBeenCalledWith(expect.any(TokenResponse));
  });

  it("logs in again after being cleared", async () => {
    const { config, generate } = managerWith(async () => ({
      data: TOKEN_PAYLOAD,
    }));

    const manager = new TokenManager(config as never, {
      clientId: "c",
      pin: "1234",
      totpSecret: "JBSWY3DPEHPK3PXP",
    });

    await manager.ensureValidToken();
    manager.clear();
    await manager.ensureValidToken();

    expect(generate).toHaveBeenCalledTimes(2);
    expect(manager.getToken()).toBeDefined();
  });
});

describe("AuthResolver", () => {
  it("prefers a tokenProvider over a static token", async () => {
    const resolver = new AuthResolver({
      clientId: "c",
      token: "static",
      tokenProvider: () => "dynamic",
    });

    await expect(resolver.resolveAccessToken()).resolves.toBe("dynamic");
  });

  it("names the ways to supply a token when none is configured", async () => {
    const resolver = new AuthResolver({ clientId: "c" });

    await expect(resolver.resolveAccessToken()).rejects.toBeInstanceOf(
      AuthenticationError,
    );
    await expect(resolver.resolveAccessToken()).rejects.toThrow(
      /enableAutoTokenManagement/,
    );
  });

  it("rejects an empty token from the provider", async () => {
    const resolver = new AuthResolver({ clientId: "c", tokenProvider: () => "" });

    await expect(resolver.resolveAccessToken()).rejects.toThrow(
      /returned an empty token/,
    );
  });
});

describe("DhanClient.fromEnv", () => {
  it("builds a client from the standard variables", () => {
    const client = DhanClient.fromEnv({
      DHAN_CLIENT_ID: "1000000001",
      DHAN_ACCESS_TOKEN: "token",
      DHAN_PARTNER_ID: "partner",
      DHAN_PARTNER_SECRET: "secret",
    } as NodeJS.ProcessEnv);

    expect(client.getConfig()).toMatchObject({
      clientId: "1000000001",
      token: "token",
      partnerId: "partner",
      partnerSecret: "secret",
    });
  });

  it("fails at startup rather than on the first request", () => {
    expect(() => DhanClient.fromEnv({} as NodeJS.ProcessEnv)).toThrow(
      /DHAN_CLIENT_ID is not set/,
    );

    expect(() =>
      DhanClient.fromEnv({ DHAN_CLIENT_ID: "x" } as NodeJS.ProcessEnv),
    ).toThrow(/DHAN_ACCESS_TOKEN is not set/);
  });

  it("accepts a tokenProvider in place of a static token", () => {
    const client = DhanClient.fromEnv(
      { DHAN_CLIENT_ID: "x" } as NodeJS.ProcessEnv,
      { tokenProvider: () => "dynamic" },
    );

    expect(client.getConfig().tokenProvider).toBeDefined();
  });
});
