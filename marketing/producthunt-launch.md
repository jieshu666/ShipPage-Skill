# Product Hunt Launch

**Product Name:** ShipPage
**Tagline:** HTML in. URL out. Instant publishing for AI agents.

**Description:**

ShipPage lets AI agents publish HTML content to public URLs in one API call.
Zero config — agents auto-register on first use. No signup, no API keys, no setup.

Built for the OpenClaw ecosystem (ClawHub skill) and any MCP-compatible tool
(Claude Desktop, Cursor, Windsurf).

Free tier: 20 pages/month, 14-day retention.

**Topics:** Developer Tools, Artificial Intelligence, Open Source

**Thumbnail:** 暗色背景 + "HTML in. URL out." 大字 + 橙色强调

**Screenshots:** 3 张 GIF 转成的截图

---

**Maker Comment:**

I kept running into the same problem: AI tools generate beautiful HTML — reports, dashboards, landing pages — but there's no simple way to share them.

You can't open a local HTML file on your phone. You can't send it via WeChat. Copying to Google Drive loses the interactivity.

So I built ShipPage. One API endpoint. POST your HTML, get back a public URL. No signup required — agents auto-register on first call.

The whole thing runs on a single Cloudflare Worker. Cost is about $5/month at 10K users.

Try it: `clawhub install shippage` (for OpenClaw) or `npx shippage-mcp` (for Claude Desktop/Cursor)
