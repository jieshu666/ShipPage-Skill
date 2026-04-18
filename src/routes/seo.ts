import { Hono } from 'hono';
import type { AppBindings } from '../types';
import { posts } from '../content/blog';
import { templates } from '../content/templates';
import { changelog } from '../content/changelog';

const seo = new Hono<AppBindings>();

seo.get('/robots.txt', (c) => {
  const body = `User-agent: *
Allow: /
Disallow: /claim
Disallow: /account
Disallow: /auth
Disallow: /v1/

User-agent: GPTBot
Allow: /
Allow: /blog/
Allow: /templates/
Allow: /showcase/

User-agent: ClaudeBot
Allow: /

User-agent: PerplexityBot
Allow: /

User-agent: Google-Extended
Allow: /

Sitemap: ${c.env.SITE_URL}/sitemap.xml
`;
  return new Response(body, {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
});

seo.get('/sitemap.xml', async (c) => {
  const cached = await c.env.META.get('cache:sitemap');
  if (cached) {
    return new Response(cached, {
      headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  }

  const base = c.env.SITE_URL;
  const now = new Date().toISOString().split('T')[0];
  const urls: Array<{ loc: string; changefreq: string; priority: string; lastmod?: string }> = [
    { loc: `${base}/`, changefreq: 'weekly', priority: '1.0', lastmod: now },
    { loc: `${base}/?lang=zh`, changefreq: 'weekly', priority: '0.9', lastmod: now },
    { loc: `${base}/blog`, changefreq: 'weekly', priority: '0.9', lastmod: now },
    { loc: `${base}/templates`, changefreq: 'monthly', priority: '0.8', lastmod: now },
    { loc: `${base}/showcase`, changefreq: 'daily', priority: '0.7', lastmod: now },
    { loc: `${base}/changelog`, changefreq: 'weekly', priority: '0.7', lastmod: changelog[0]?.date || now },
    { loc: `${base}/claim`, changefreq: 'monthly', priority: '0.5' },
  ];

  for (const p of posts) {
    urls.push({
      loc: `${base}/blog/${p.slug}`,
      changefreq: 'monthly',
      priority: '0.8',
      lastmod: p.updatedAt || p.publishedAt,
    });
  }

  for (const tpl of templates) {
    urls.push({
      loc: `${base}/templates/${tpl.slug}`,
      changefreq: 'monthly',
      priority: '0.7',
      lastmod: now,
    });
  }

  try {
    const list = await c.env.META.list({ prefix: 'page:', limit: 1000 });
    for (const key of list.keys) {
      const slug = key.name.slice('page:'.length);
      const metaStr = await c.env.META.get(key.name);
      if (!metaStr) continue;
      const meta = JSON.parse(metaStr);
      if (meta.is_public !== true) continue;
      if (meta.expires_at && new Date(meta.expires_at) < new Date()) continue;
      urls.push({
        loc: `${base}/p/${slug}`,
        changefreq: 'weekly',
        priority: '0.7',
        lastmod: meta.created_at ? meta.created_at.split('T')[0] : now,
      });
    }
  } catch {}

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9" xmlns:xhtml="http://www.w3.org/1999/xhtml">
${urls.map((u) => `  <url>
    <loc>${u.loc}</loc>${u.lastmod ? `
    <lastmod>${u.lastmod}</lastmod>` : ''}
    <changefreq>${u.changefreq}</changefreq>
    <priority>${u.priority}</priority>
  </url>`).join('\n')}
</urlset>`;

  await c.env.META.put('cache:sitemap', xml, { expirationTtl: 3600 });

  return new Response(xml, {
    headers: { 'Content-Type': 'application/xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
});

const LLMS_TXT = (siteUrl: string) => `# ShipPage

> ShipPage is a zero-config HTML publishing service for AI agents. HTML in. URL out. One API call. No registration, no setup — auto-registers on first publish.

ShipPage turns any HTML or Markdown into a live webpage via a single POST request. It is purpose-built for AI agents (Claude, Cursor, Codex, GPT-based tools) that generate web content and need to deliver it as a shareable URL. Built on Cloudflare Workers + R2 + KV for sub-100ms edge performance. Free tier: 20 publishes/month, 14-day retention, 500KB per page.

## Core endpoints

- [POST /v1/publish](${siteUrl}/v1/publish): Publish HTML or Markdown, returns public URL. Auto-registers agent on first call.
- [GET /v1/pages](${siteUrl}/v1/pages): List all pages owned by the authenticated agent.
- [PUT /v1/pages/:slug](${siteUrl}/v1/pages/:slug): Update a published page (HTML, title, password, expiry, visibility).
- [DELETE /v1/pages/:slug](${siteUrl}/v1/pages/:slug): Delete a published page.
- [GET /p/:slug](${siteUrl}/p/:slug): Render a published page.

## Install

- OpenClaw Skill (Claude Code): \`clawhub install shippage\`
- MCP Server (Claude Desktop, Cursor): \`npx shippage-mcp\`
- Direct HTTP: POST to ${siteUrl}/v1/publish with JSON body \`{ "html": "..." }\`

## Docs

- [Landing page](${siteUrl}/)
- [Blog](${siteUrl}/blog)
- [Templates](${siteUrl}/templates)
- [Showcase](${siteUrl}/showcase)
- [Changelog](${siteUrl}/changelog)
- [GitHub repository](https://github.com/jieshu666/ShipPage-Skill)
- [npm package (shippage-mcp)](https://www.npmjs.com/package/shippage-mcp)

## Blog posts

${posts.map((p) => `- [${p.title}](${siteUrl}/blog/${p.slug}) — ${p.description}`).join('\n')}

## Templates

${templates.map((t) => `- [${t.title}](${siteUrl}/templates/${t.slug}) — ${t.description}`).join('\n')}
`;

seo.get('/llms.txt', (c) => {
  return new Response(LLMS_TXT(c.env.SITE_URL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
});

const LLMS_FULL_TXT = (siteUrl: string) => `${LLMS_TXT(siteUrl)}

## POST /v1/publish — Request body

| Field | Type | Required | Description |
|-------|------|----------|-------------|
| html | string | yes | HTML content to publish (max 500KB on free tier) |
| title | string | no | Display title for the page |
| slug | string | no | Custom URL slug; path becomes /p/{slug} |
| password | string | no | Require a password to view the page (SHA-256 hashed) |
| expires_in | number | no | TTL in seconds; default 14 days (1,209,600) |
| public | boolean | no | If true, page is indexable by search engines and included in sitemap. Default false (noindex). |

## POST /v1/publish — Response (first call, agent not registered)

\`\`\`json
{
  "ok": true,
  "url": "https://shippage.ai/p/x7k2m9",
  "slug": "x7k2m9",
  "expires_at": "2026-05-01T14:30:00Z",
  "password_protected": false,
  "_registration": {
    "agent_id": "agt_...",
    "api_key": "sk_...",
    "claim_url": "https://shippage.ai/claim/ABCD-1234"
  }
}
\`\`\`

Save \`api_key\` to \`~/.shippage/credentials.json\` for subsequent requests. Pass as \`Authorization: Bearer sk_...\` header.

## Differentiation vs. alternative services

- vs. PageDrop: ShipPage adds agent identity, full CRUD, password protection, custom slugs, Skill/MCP integrations. PageDrop is anonymous-only.
- vs. Vercel / Netlify: ShipPage is a single API call with zero account setup. Vercel/Netlify require accounts, git repos, and build configs.
- vs. GitHub Pages / Cloudflare Pages: ShipPage publishes ephemeral HTML at an endpoint; no repo, no build, no CI.
- vs. self-hosted static servers: ShipPage requires zero infrastructure; publish from any agent, anywhere, in under a second.

## When to use ShipPage

- AI agents that generate HTML reports, dashboards, or one-shot web pages and need to share them.
- Claude Code / Cursor users who want to turn a response into a shareable URL without leaving the agent.
- Scripts or automations that produce HTML artifacts needing public distribution.
- Zero-config prototyping when you do not want to manage a deployment pipeline.

## License and source

MIT License. Source: https://github.com/jieshu666/ShipPage-Skill
`;

seo.get('/llms-full.txt', (c) => {
  return new Response(LLMS_FULL_TXT(c.env.SITE_URL), {
    headers: { 'Content-Type': 'text/plain; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
});

seo.get('/og.svg', (c) => {
  const svg = `<svg xmlns="http://www.w3.org/2000/svg" width="1200" height="630" viewBox="0 0 1200 630">
  <defs>
    <linearGradient id="bg" x1="0" y1="0" x2="1" y2="1">
      <stop offset="0" stop-color="#0a0a0a"/>
      <stop offset="1" stop-color="#1a1a1a"/>
    </linearGradient>
    <linearGradient id="accent" x1="0" y1="0" x2="1" y2="0">
      <stop offset="0" stop-color="#f97316"/>
      <stop offset="1" stop-color="#fb923c"/>
    </linearGradient>
  </defs>
  <rect width="1200" height="630" fill="url(#bg)"/>
  <rect x="0" y="0" width="1200" height="4" fill="url(#accent)"/>
  <text x="80" y="160" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="48" font-weight="800" fill="#888">ShipPage</text>
  <text x="80" y="310" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="96" font-weight="800" fill="#f0f0f0">HTML in.</text>
  <text x="80" y="420" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="96" font-weight="800" fill="#f97316">URL out.</text>
  <text x="80" y="510" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="48" font-weight="400" fill="#888">Zero config. For AI agents.</text>
  <text x="80" y="580" font-family="-apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif" font-size="24" font-weight="500" fill="#555">shippage.ai  ·  clawhub install shippage  ·  npx shippage-mcp</text>
</svg>`;
  return new Response(svg, {
    headers: {
      'Content-Type': 'image/svg+xml; charset=utf-8',
      'Cache-Control': 'public, max-age=86400, immutable',
    },
  });
});

export default seo;
