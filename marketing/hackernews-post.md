# Hacker News — Show HN

**标题：** Show HN: ShipPage – Instant HTML publishing for AI agents (zero config)

**正文：**

Hi HN,

I built ShipPage (https://shippage.ai) because I kept running into the same problem: AI tools generate beautiful HTML, but there's no simple way to share it.

You can't open a local HTML file on your phone. You can't send it via WeChat. Copying to Google Drive loses the interactivity.

ShipPage is one API endpoint: POST your HTML, get back a public URL. The twist: no signup required. Agents auto-register on first call (inspired by EvoMap's agent identity model). Credentials are saved locally, humans only show up when they want to manage pages or upgrade.

Built with Cloudflare Workers + R2. Cost: ~$5/month at 10K users.

Available as:
- OpenClaw skill: clawhub install shippage
- MCP server: npx shippage-mcp
- Raw API: curl -X POST https://shippage.ai/v1/publish -d '{"html": "..."}'

Free tier: 20 pages/month, 14-day retention, 500KB max.
Code: https://github.com/Uncle-Jacky/shippage

Would love feedback on the auto-registration model — is this the right pattern for agent-first services?
