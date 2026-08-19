# Authentication

Every request carries an `access-token` header. This page covers the ways to
supply one, and when each is appropriate.

## The five methods

| Method | Use when |
| --- | --- |
| Static token | Scripts, notebooks, anything short-lived |
| `tokenProvider` callback | The token lives somewhere else — a vault, a sidecar, another service |
| Automatic management | Long-running processes that must not stop at expiry |
| `DhanClient.fromEnv()` | Containers and CI, where config arrives as environment variables |
| `DhanClient.fromTokenEndpoint()` | A service of yours already brokers Dhan tokens |

Partner credentials (`partnerId` / `partnerSecret`) are separate — see
[Partner authentication](#partner-authentication).

### 1. Static token

```ts
const client = new DhanClient({
  clientId: process.env.DHAN_CLIENT_ID!,
  token: process.env.DHAN_ACCESS_TOKEN!,
});
```

Simplest, and correct for anything that runs for less time than the token
lives. The SDK will not refresh it — when it expires, requests fail with
`ApiResponseError` (401).

### 2. Token provider

Called before every request, so the freshest value always wins.

```ts
const client = new DhanClient({
  clientId: process.env.DHAN_CLIENT_ID!,
  tokenProvider: async () => vault.read("dhan/access-token"),
  onTokenExpired: async (error) => {
    // Called on a 401 before the SDK retries once with a re-resolved token.
    await vault.refresh("dhan/access-token");
  },
});
```

The provider is not memoized. If yours is expensive, cache inside it.

### 3. Automatic token management

Generates a token from client id + PIN + TOTP, then renews it before expiry.

```ts
const manager = client.auth.enableAutoTokenManagement({
  clientId: process.env.DHAN_CLIENT_ID!,
  pin: process.env.DHAN_PIN!,
  totpSecret: process.env.DHAN_TOTP_SECRET!,
  renewBeforeMs: 5 * 60 * 1000,      // default
  onToken: (token) => log.info({ expiresAt: token.expiresAt }, "token renewed"),
});
```

This installs a `tokenProvider`, so every request thereafter goes through the
manager and nothing else needs changing.

Concurrent callers arriving while the token is stale **share one login**.
That matters: generating a token can invalidate the previous one, so five
parallel logins can leave the SDK holding a token the broker has already
replaced.

Renewal (`/RenewToken`) only works while the current token is still valid.
Once it has expired, the manager falls back to a full PIN/TOTP login
automatically.

#### Supplying the TOTP yourself

`totpSecret` means the process holds a credential equivalent to a second
factor — anything with the secret and the PIN can mint tokens indefinitely.
Where that is unacceptable, pass a provider instead and keep the secret in a
hardware token or an MFA service:

```ts
client.auth.enableAutoTokenManagement({
  clientId, pin,
  totpProvider: async () => mfaService.currentCode("dhan"),
});
```

Either `totpSecret` or `totpProvider` is required; the constructor throws if
neither is given, rather than failing later at the first login.

### 4. From environment

```ts
const client = DhanClient.fromEnv();
```

Reads `DHAN_CLIENT_ID` and `DHAN_ACCESS_TOKEN`, plus optional
`DHAN_BASE_URL`, `DHAN_PARTNER_ID` and `DHAN_PARTNER_SECRET`. Throws at
construction when a required variable is missing — a missing credential is a
startup problem, not something to discover on the first order.

Overrides merge on top:

```ts
DhanClient.fromEnv(process.env, { tokenProvider: () => vault.read("...") });
```

### 5. From your own token endpoint

```ts
const client = await DhanClient.fromTokenEndpoint({
  endpointBaseUrl: "https://internal.example.com",
  bearerToken: serviceToken,
});
```

For setups where a service of yours already holds the Dhan relationship and
hands out tokens.

## Generating tokens directly

```ts
import { DhanAuth } from "@nemesis-oss/dhanhq-sdk";

const totp = DhanAuth.generateTotp(process.env.DHAN_TOTP_SECRET!);
const token = await DhanAuth.generateAccessToken({ clientId, pin, totp });

token.accessToken;
token.expiresAt;              // epoch ms
token.isExpired();
token.expiresIn();            // ms remaining, floored at 0
token.needsRefresh(300_000);  // inside 5 minutes of expiry
token.clientName;             // plus ucc, powerOfAttorney
```

`DhanAuth.totpSecondsRemaining()` reports how long the current code lasts —
useful for avoiding a login that starts at second 29 of a 30-second window.

Renewal:

```ts
const renewed = await DhanAuth.renewWebToken({ token: current, clientId });
```

## Expiry handling

Dhan returns IST timestamps, and some carry no timezone designator. The
ECMAScript spec parses such a string as **local** time, so on a UTC server an
IST expiry reads 5.5 hours later than it really is — the token looks valid
long after the API has started rejecting it.

`parseExpiry` pins offset-less timestamps to IST. Timestamps with an explicit
`Z` or `±HH:MM` are respected as given.

A response with no parseable expiry is treated as **expired**, so an
unrecognized payload fails closed rather than being trusted indefinitely.

## Errors

Auth failures raise `AuthenticationError`, carrying the broker's own message:

```ts
try {
  await DhanAuth.generateAccessToken({ clientId, pin, totp });
} catch (error) {
  if (error instanceof AuthenticationError) {
    error.context;  // "GenerateAccessToken"
    error.message;  // "GenerateAccessToken failed: Invalid PIN"
    error.status;   // 401
    error.details;  // the raw response body
  }
}
```

`error.message` is the part that matters: "Invalid PIN" and "TOTP expired"
need different fixes, and the HTTP status alone does not distinguish them.

A 401 on a normal API call surfaces as `ApiResponseError`, not
`AuthenticationError` — `AuthenticationError` is specifically about obtaining
a token.

## Partner authentication

Partner credentials authenticate the **order-update WebSocket** as a partner
rather than an individual:

```ts
const client = new DhanClient({
  clientId: process.env.DHAN_CLIENT_ID!,
  token: process.env.DHAN_ACCESS_TOKEN!,
  wsOrderUserType: "PARTNER",
  partnerId: process.env.DHAN_PARTNER_ID!,
  partnerSecret: process.env.DHAN_PARTNER_SECRET!,
});
```

The login frame then sends the partner id and secret instead of the access
token. REST calls still use the access token as usual.

## Handling secrets

- Never commit a PIN, TOTP secret or access token. `.env` is gitignored.
- A TOTP secret plus a PIN is full account access with no second factor left.
  Prefer `totpProvider` when the process does not need to hold the secret.
- Never ship any of these to a browser — see [`BROWSER.md`](BROWSER.md).
- For the MCP server, credentials come from the environment and writes stay
  closed unless `DHANHQ_MCP_ENABLE_WRITES=true` *and* `LIVE_TRADING=true`.
