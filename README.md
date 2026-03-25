# ShipPage — HTML in. URL out. Zero config.

[![npm version](https://img.shields.io/npm/v/shippage-mcp)](https://www.npmjs.com/package/shippage-mcp)
[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)

> Instant HTML & Markdown publishing service for AI agents. Publish any HTML or Markdown to a public URL with a single API call. No registration, no API keys to configure — auto-registers on first use.

**Official Website: [shippage.ai](https://shippage.ai)**

[English](#) | [中文](./README.zh-CN.md)

---

## What is ShipPage?

ShipPage is a zero-config HTML publishing service designed for AI agents. It turns any HTML content into a publicly accessible URL with a single API call. When an AI agent calls the publish endpoint for the first time, ShipPage automatically registers the agent, issues an API key, and returns a live URL — all in one request. No human setup required.

ShipPage is built on Cloudflare Workers, R2, and KV for edge-deployed, globally fast performance (<100ms response time). It supports password-protected pages, custom URL slugs, full CRUD management, and integrates with the OpenClaw and MCP ecosystems.

## Quick Start

### Option 1: OpenClaw Skill (Claude Code)

```bash
clawhub install shippage
```

Then tell your AI: *"Publish this as a webpage"* — done.

### Option 2: MCP Server (Claude Desktop / Cursor)

Add to your `claude_desktop_config.json`:

```json
{
  "mcpServers": {
    "shippage": {
      "command": "npx",
      "args": ["shippage-mcp"]
    }
  }
}
```

No API key needed. No environment variables.

### Option 3: Direct API

```bash
curl -X POST https://shippage.ai/v1/publish \
  -H "Content-Type: application/json" \
  -d '{
    "html": "<html><body><h1>Hello World!</h1></body></html>",
    "title": "My Page"
  }'
```

Response:

```json
{
  "ok": true,
  "url": "https://shippage.ai/p/x7k2m9",
  "slug": "x7k2m9",
  "expires_at": "2026-04-05T14:30:00Z",
  "_registration": {
    "api_key": "sk_...",
    "claim_url": "https://shippage.ai/claim/ABCD-1234"
  }
}
```

Save the `api_key` for subsequent requests. The `claim_url` lets the user manage pages via web UI (optional).

## API Reference

| Method | Endpoint | Description | Auth |
|--------|----------|-------------|------|
| `POST` | `/v1/publish` | Publish HTML, returns public URL | Optional (auto-registers if missing) |
| `GET` | `/v1/pages` | List all published pages | Required |
| `PUT` | `/v1/pages/:slug` | Update a page | Required |
| `DELETE` | `/v1/pages/:slug` | Delete a page | Required |
| `GET` | `/p/:slug` | View a published page | None |

### POST /v1/publish Parameters

| Parameter | Required | Type | Description |
|-----------|----------|------|-------------|
| `html` | Yes | string | The HTML content to publish |
| `title` | No | string | Display name for the page |
| `slug` | No | string | Custom URL path (e.g., `my-page` → `shippage.ai/p/my-page`) |
| `password` | No | string | Require a password to view the page |
| `expires_in` | No | number | Seconds until expiry (default: 1,209,600 = 14 days) |

## Features

| Feature | ShipPage | PageDrop | Manual Deploy |
|---------|----------|----------|---------------|
| Zero config | ✅ | ✅ | ❌ |
| Agent identity system | ✅ | ❌ | ❌ |
| Page management (CRUD) | ✅ | ❌ | Varies |
| Password protection | ✅ | ❌ | Varies |
| Custom URL slugs | ✅ | ❌ | ✅ |
| OpenClaw + MCP ecosystem | ✅ | ❌ | ❌ |
| Auto-expiry & cleanup | ✅ | ✅ | ❌ |

## How It Works

```
Agent calls POST /v1/publish (no auth needed)
    │
    ├─ First time? → Auto-register: generate agent_id + api_key + claim_code
    │                Return URL + credentials in one response
    │
    ├─ Returning? → Verify API key, check quota
    │
    ▼
Store HTML in R2 → Store metadata in KV → Return public URL
```

- **Infrastructure**: Cloudflare Workers + R2 (storage) + KV (metadata)
- **Response time**: <100ms (edge-deployed on 300+ data centers)
- **Daily cleanup**: Cron job removes expired pages automatically

## Free Tier

| Limit | Value |
|-------|-------|
| Publishes per month | 20 |
| Max page size | 500 KB |
| Page retention | 14 days |
| Password protection | ✅ Included |
| Custom slugs | ✅ Included |

No credit card required.

## FAQ

**Q: Do I need to register before using ShipPage?**
A: No. ShipPage auto-registers your AI agent on the first API call. No signup, no forms, no email verification.

**Q: What happens when my pages expire?**
A: Free-tier pages expire after 14 days and are automatically cleaned up. You can re-publish at any time. Pro tier (coming soon) offers permanent pages.

**Q: Can I use ShipPage without Claude?**
A: Yes. ShipPage works with any HTTP client. The API is a standard REST endpoint — use it from any AI agent, script, or tool.

**Q: Is ShipPage open source?**
A: Yes. The source code is available at [github.com/Uncle-Jacky/ShipPage-Skill](https://github.com/Uncle-Jacky/ShipPage-Skill) under the MIT license.

## Tech Stack

- **Runtime**: [Cloudflare Workers](https://workers.cloudflare.com/) + [Hono](https://hono.dev/)
- **Storage**: [Cloudflare R2](https://www.cloudflare.com/r2/) (HTML files)
- **Metadata**: [Cloudflare KV](https://www.cloudflare.com/kv/) (agent records, page metadata)
- **Language**: TypeScript

## Contributing

Contributions are welcome! Please open an issue or submit a pull request.

## License

[MIT](LICENSE)
