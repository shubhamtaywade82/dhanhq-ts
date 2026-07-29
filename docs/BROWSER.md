# Browser usage

Short version: **do not put this SDK in a browser with real credentials.**
Run it on a server and expose a narrow read-only API to your frontend.

This page explains why, and gives the pattern that does work.

## Two independent blockers

**1. Credentials.** A Dhan access token is a bearer credential for a live
trading account. Anything shipped to a browser is readable — bundle
inspection, devtools, a malicious extension, a compromised npm dependency in
your frontend build. There is no obfuscation that fixes this. A leaked token
lets someone else trade your account.

**2. CORS.** Even if you accepted the credential risk, `api.dhan.co` does not
send `Access-Control-Allow-Origin` for browser origins. The browser blocks the
response before your code sees it. This is not something the SDK can work
around — it is enforced by the browser, not the library.

The market-feed WebSocket is not subject to CORS, so it *can* be opened from a
browser. It still needs the access token to authenticate, so blocker 1 applies
unchanged.

## The pattern that works

Put the SDK behind your own backend. The browser talks to you; only your
server talks to Dhan.

```
Browser  ──▶  Your API  ──▶  DhanHQ
(no token)   (holds token)
```

```ts
// server.ts — the only place the token exists
import express from "express";
import { DhanClient } from "@shubhamtaywade82/dhanhq-ts";

const client = new DhanClient({
  clientId: process.env.DHAN_CLIENT_ID!,
  token: process.env.DHAN_ACCESS_TOKEN!,
});

const app = express();

// Expose specific reads. Never proxy arbitrary paths through to Dhan — an
// open proxy hands your trading account to anyone who can reach the endpoint.
app.get("/api/holdings", requireSession, async (_req, res) => {
  res.json(await client.positions.listHoldings());
});

app.get("/api/quote/:segment/:securityId", requireSession, async (req, res) => {
  const ltp = await client.marketFeed.ltpFor(
    req.params.segment,
    req.params.securityId,
  );
  res.json({ ltp });
});
```

Three rules for that backend:

- **Authenticate your own users.** The Dhan token authenticates *you* to Dhan;
  it says nothing about who is calling your API.
- **Allowlist endpoints, never proxy paths.** `/api/holdings` is fine.
  `/api/dhan/*` forwarding straight through is an open trading proxy.
- **Keep writes off the browser path entirely.** Order placement should be
  triggered by server-side strategy code, not by an HTTP call a browser can
  forge.

## Streaming prices to a browser

Run one market-feed connection on the server and fan it out over your own
WebSocket. This is better than one browser connection per user regardless of
security: Dhan caps concurrent feed connections per client id.

```ts
client.ws.market.on("tick", (tick) => {
  // Forward only what the frontend needs — never the raw packet, which can
  // carry more than you intend to expose.
  broadcast({
    securityId: tick.securityId,
    ltp: "ltp" in tick ? tick.ltp : undefined,
  });
});
```

## What is browser-safe

Parts of this SDK are pure computation with no credentials and no network, and
those bundle into a frontend fine:

| Module | Browser-safe | Notes |
| --- | --- | --- |
| `src/ta` (indicators, candles, calendar) | ✅ | Pure functions over arrays |
| `src/analytics` (Black-Scholes, max pain) | ✅ | Pure math |
| `src/risk` sizing and stops | ✅ | `fixedRiskSize`, `TrailManager`, etc. |
| `src/constants` | ✅ | Data only |
| `src/risk` `Pipeline` | ⚠️ | Pure without a `provider`; needs the API with one |
| `src/execution` | ⚠️ | Pure decisions, but you must feed it ticks |
| `src/resources`, `src/client` | ❌ | Needs a token, blocked by CORS |
| `src/ws` | ❌ | Needs a token |
| `src/agent`, `src/mcp` | ❌ | Node-only; MCP reads stdin/stdout |

Import the safe parts directly so bundlers can tree-shake the rest — the
package sets `sideEffects: false`:

```ts
// Charting a position in the browser, no credentials involved
import { rsi, latest, bollingerBands } from "@shubhamtaywade82/dhanhq-ts";
import { greeks } from "@shubhamtaywade82/dhanhq-ts";

const signal = latest(rsi(closesFromYourApi, 14));
```

`PositionMonitor` also works in a browser, since it only turns ticks into exit
*signals* and never places an order. Feed it ticks from your own WebSocket and
let the server act on the decision:

```ts
import { PositionMonitor } from "@shubhamtaywade82/dhanhq-ts";

const monitor = new PositionMonitor();
monitor.track({ securityId: "2885", exchangeSegment: "NSE_EQ", quantity: 10, entryPrice: 1400, stopLoss: 1386 });
monitor.on("exit", (signal) => fetch("/api/exit", { method: "POST", body: JSON.stringify(signal) }));
socket.onmessage = (event) => monitor.onTick(JSON.parse(event.data));
```

## If you are building a read-only dashboard

That is the one case where browser use is reasonable — and it still runs
through your backend. The token stays server-side, your API exposes only the
reads the dashboard needs, and the indicator and analytics modules run in the
browser against data your API returned. No credential ever leaves your server.
