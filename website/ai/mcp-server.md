---
title: DhanHQ MCP Server — AI Trading Agent Integration
description: Expose DhanHQ trading APIs as MCP (Model Context Protocol) tools for AI agents. Run the MCP server for Claude, ChatGPT, Cursor, and other LLM clients.
---

# MCP Server & AI Agent Tools

Expose the entire DhanHQ SDK as [Model Context Protocol (MCP)](https://modelcontextprotocol.io) tools for AI trading agents.

## Quick Start

```bash
# Set credentials
export DHAN_CLIENT_ID=your_client_id
export DHAN_ACCESS_TOKEN=your_access_token

# Run the MCP server over stdio
npx dhanhq-mcp
```

## Claude Desktop Configuration

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "dhanhq": {
      "command": "npx",
      "args": ["-y", "@shubhamtaywade82/dhanhq-ts", "dhanhq-mcp"],
      "env": {
        "DHAN_CLIENT_ID": "YOUR_CLIENT_ID",
        "DHAN_ACCESS_TOKEN": "YOUR_ACCESS_TOKEN",
        "DHANHQ_AGENT_SCOPES": "portfolio:read,market:read,orders:read"
      }
    }
  }
}
```

## Agent Tools

The MCP server exposes tools backed by the SDK:

| Tool | Description | Scope Required |
|------|-------------|----------------|
| `dhan_search_instruments` | Search scrip master | `market:read` |
| `dhan_get_quote` | Snapshot market data | `market:read` |
| `dhan_get_option_chain` | Fetch option chain | `market:read` |
| `dhan_compute_greeks` | Calculate option Greeks | `market:read` |
| `dhan_technical_analysis` | Compute indicators | `market:read` |
| `dhan_order_preview` | Validate without placing | `orders:read` |
| `dhan_place_order` | Execute a trade | `orders:write` |
| `dhan_get_positions` | Current positions | `portfolio:read` |
| `dhan_get_holdings` | Current holdings | `portfolio:read` |
| `dhan_get_funds` | Available funds | `portfolio:read` |

## Policy Gates

Two independent gates guard writes:

1. **Policy scope** — the agent must hold `orders:write` scope
2. **Environment flags** — both `DHANHQ_MCP_ENABLE_WRITES=true` and `LIVE_TRADING=true`

```ts
import { AgentToolRegistry, Policy } from "@shubhamtaywade82/dhanhq-ts";

// Read-only access
const tools = new AgentToolRegistry({
  client,
  policy: Policy.readOnly(),
});

await tools.execute("dhan_search_instruments", { query: "NIFTY" });
await tools.execute("dhan_order_preview", order);
// dhan_place_order would throw — read-only policy
```

## Resources

The server exposes these resources:

| URI | Description |
|-----|-------------|
| `dhanhq://account/profile` | Account profile |
| `dhanhq://account/funds` | Available funds |
| `dhanhq://account/positions` | Current positions |
| `dhanhq://account/holdings` | Current holdings |
| `dhanhq://account/orders` | Recent orders |
| `dhanhq://market/capabilities` | Market status |

## Prompt Templates

Five built-in prompt templates for common trading tasks:
- `analyze_market` — Market analysis workflow
- `evaluate_option_strategy` — Options strategy evaluation  
- `assess_risk` — Risk assessment
- `prepare_order` — Order preparation with validation
- `review_portfolio` — Portfolio review

## Security

- Writes require both policy scope AND environment flags
- Never expose `LIVE_TRADING=true` in non-production environments
- Use `DHANHQ_AGENT_SCOPES` to limit tool availability
- Tokens are bearer credentials — never ship to client-side code

## Programmatic Use

```ts
import { AgentToolRegistry, Policy } from "@shubhamtaywade82/dhanhq-ts";

const tools = new AgentToolRegistry({
  client,
  policy: Policy.fromScopes(
    "market:read",
    "portfolio:read",
    "orders:read",
  ),
});

// Execute any tool
const result = await tools.execute("dhan_get_option_chain", {
  underlyingScrip: 13,
  underlyingSeg: "IDX_I",
  expiry: "2026-08-04",
});
```
