---
title: DhanHQ TypeScript SDK — Installation & Authentication
description: Install and configure the DhanHQ TypeScript SDK for Node.js. Learn authentication methods including static tokens, auto-renewal, and custom token endpoints.
---

# Getting Started

## Installation

```bash
npm install @shubhamtaywade82/dhanhq-ts
```

Requires **Node.js 18 or newer**. Ships both ESM and CommonJS builds with TypeScript declarations.

## Quick Start

```ts
import { DhanClient } from "@shubhamtaywade82/dhanhq-ts";

const client = new DhanClient({
  token: process.env.DHAN_TOKEN!,
  clientId: process.env.DHAN_CLIENT_ID!,
});

const orderDetail = await client.orders.getById("12345");
console.log(orderDetail);
```

## Authentication

Five ways to supply a token:

### 1. Static Token

```ts
new DhanClient({ clientId, token });
```

### 2. Provider Callback

Re-resolved on every request:

```ts
new DhanClient({
  clientId,
  tokenProvider: () => vault.read("dhan/token"),
});
```

### 3. Auto-Renewal (PIN + TOTP)

Generate from PIN + TOTP secret, renew before expiry:

```ts
client.auth.enableAutoTokenManagement({
  clientId: "YOUR_CLIENT_ID",
  pin: "YOUR_PIN",
  totpSecret: "YOUR_TOTP_SECRET",
});
```

### 4. Environment Variables

```ts
const client = DhanClient.fromEnv();
// reads DHAN_CLIENT_ID and DHAN_ACCESS_TOKEN
```

### 5. Custom Token Endpoint

```ts
const client = await DhanClient.fromTokenEndpoint({
  endpointBaseUrl: "https://your-auth-service.com",
  bearerToken: process.env.DHAN_TOKEN_ACCESS_TOKEN!,
});
```

See the full [authentication guide](https://github.com/shubhamtaywade82/dhanhq-ts/blob/main/docs/AUTHENTICATION.md) for details on TOTP generation, SELF vs PARTNER auth, and token lifecycle.
