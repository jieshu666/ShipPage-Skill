import { Hono } from 'hono';
import type { AppBindings } from '../types';

const docs = new Hono<AppBindings>();

// ---------------------------------------------------------------------------
// Docs + high-intent guide pages. Each guide targets a real search/GEO query
// ("publish html from claude code", "mcp server to publish html", ...) and
// carries HowTo / TechArticle JSON-LD so generative engines can lift the steps.
// ---------------------------------------------------------------------------

interface DocPage {
  slug: string;          // '' = /docs hub
  navLabel: string;
  title: string;         // <title> / h1
  description: string;   // meta description
  howto?: { name: string; steps: { name: string; text: string }[] };
  body: (siteUrl: string) => string;
}

const NAV: { slug: string; label: string }[] = [
  { slug: '', label: 'Overview' },
  { slug: 'quickstart', label: 'Quickstart' },
  { slug: 'api', label: 'API reference' },
  { slug: 'claude-code', label: 'Claude Code' },
  { slug: 'claude-desktop', label: 'Claude Desktop & Cursor' },
  { slug: 'http', label: 'Any HTTP client' },
  { slug: 'markdown', label: 'Publishing Markdown' },
];

const code = (s: string) => `<pre class="code"><code>${s
  .replace(/&/g, '&amp;')
  .replace(/</g, '&lt;')
  .replace(/>/g, '&gt;')}</code></pre>`;

const PAGES: DocPage[] = [
  {
    slug: '',
    navLabel: 'Overview',
    title: 'ShipPage Docs — the publishing API for AI agents',
    description: 'How to publish HTML or Markdown to a public URL from an AI agent with a single API call. Quickstart, full API reference, and per-client setup guides.',
    body: (s) => `
      <p class="lead">ShipPage is a publishing API for AI agents. Your agent sends HTML or Markdown in one HTTP POST and gets back a public URL that opens on any device — no account, no API keys to configure, no build step. It auto-registers on the first call.</p>
      <h2>Start here</h2>
      <div class="card-grid">
        <a class="doc-card" href="${s}/docs/quickstart"><strong>Quickstart →</strong><span>Publish your first page in 30 seconds with one curl command.</span></a>
        <a class="doc-card" href="${s}/docs/api"><strong>API reference →</strong><span>Every endpoint, parameter, response, and error code.</span></a>
        <a class="doc-card" href="${s}/docs/claude-code"><strong>Claude Code →</strong><span>Install the skill and say "publish this page".</span></a>
        <a class="doc-card" href="${s}/docs/claude-desktop"><strong>Claude Desktop & Cursor →</strong><span>Add the MCP server. No API key needed.</span></a>
        <a class="doc-card" href="${s}/docs/http"><strong>Any HTTP client →</strong><span>Use ShipPage from any language, script, or agent framework.</span></a>
        <a class="doc-card" href="${s}/docs/markdown"><strong>Publishing Markdown →</strong><span>Turn Markdown into a styled, mobile-friendly page.</span></a>
      </div>
      <h2>What you can build</h2>
      <ul>
        <li>Share an AI-generated report, dashboard, or landing page as a link a client can open.</li>
        <li>Give a headless agent (Claude Code, a cron job, a CI step) a way to hand off a web page — where there is no "share" button.</li>
        <li>Preview generated HTML on your phone, or drop it into a chat or email.</li>
      </ul>
      <p>Free tier: 20 publishes/month, 14-day retention, 500&nbsp;KB per page. No credit card. See <a href="${s}/pricing">pricing</a>.</p>`,
  },
  {
    slug: 'quickstart',
    navLabel: 'Quickstart',
    title: 'Quickstart — publish HTML to a public URL in one call',
    description: 'Publish your first page with ShipPage in 30 seconds using a single curl command. No signup, no API key.',
    howto: {
      name: 'Publish HTML to a public URL with ShipPage',
      steps: [
        { name: 'Send a POST request', text: 'POST your HTML to https://shippage.ai/v1/publish with a JSON body containing an "html" field.' },
        { name: 'Read the URL from the response', text: 'The response contains a "url" field — that is your live public page.' },
        { name: 'Save your API key (optional)', text: 'The first response includes an api_key. Save it to reuse the same agent identity and manage your pages.' },
      ],
    },
    body: () => `
      <p class="lead">No signup. No API key to create. Send one request, get a URL.</p>
      <h2>1. Publish</h2>
      ${code(`curl -X POST https://shippage.ai/v1/publish \\
  -H "Content-Type: application/json" \\
  -d '{"html": "<html><body><h1>Hello from my agent</h1></body></html>", "title": "My Page"}'`)}
      <h2>2. Read the response</h2>
      ${code(`{
  "ok": true,
  "url": "https://shippage.ai/p/x7k2m9",
  "slug": "x7k2m9",
  "expires_at": "2026-07-17T14:30:00Z",
  "password_protected": false,
  "_registration": {
    "api_key": "sk_...",
    "claim_url": "https://shippage.ai/claim/ABCD-1234"
  }
}`)}
      <p>Open <code>url</code> in any browser — it's live. On the first call, ShipPage auto-registers your agent and returns an <code>api_key</code> and a <code>claim_url</code>.</p>
      <h2>3. Reuse your identity (optional)</h2>
      <p>Save the <code>api_key</code> (agents typically write it to <code>~/.shippage/credentials.json</code>) and send it on later requests to keep the same identity and manage your pages:</p>
      ${code(`curl -X POST https://shippage.ai/v1/publish \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"html": "<h1>Another page</h1>"}'`)}
      <p>Prefer to work inside your agent? See <a href="/docs/claude-code">Claude Code</a>, <a href="/docs/claude-desktop">Claude Desktop &amp; Cursor</a>, or the full <a href="/docs/api">API reference</a>.</p>`,
  },
  {
    slug: 'api',
    navLabel: 'API reference',
    title: 'API reference — ShipPage publishing API',
    description: 'Complete ShipPage API reference: POST /v1/publish parameters, authentication, page management (list/update/delete), limits, and error codes.',
    body: (s) => `
      <p class="lead">Base URL <code>${s}</code>. Authentication is optional on publish (the API auto-registers a new agent), required for managing existing pages.</p>

      <h2>Authentication</h2>
      <p>Pass your API key as a bearer token:</p>
      ${code(`Authorization: Bearer sk_...`)}
      <p>Your key is issued in the <code>_registration.api_key</code> field of your first publish response.</p>

      <h2>Endpoints</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Method</th><th>Path</th><th>Auth</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td>POST</td><td><code>/v1/publish</code></td><td>Optional</td><td>Publish a page, returns its URL. Auto-registers if unauthenticated.</td></tr>
          <tr><td>GET</td><td><code>/v1/pages</code></td><td>Required</td><td>List all pages owned by the authenticated agent.</td></tr>
          <tr><td>PUT</td><td><code>/v1/pages/:slug</code></td><td>Required</td><td>Update a page's HTML, title, password, expiry, or visibility.</td></tr>
          <tr><td>DELETE</td><td><code>/v1/pages/:slug</code></td><td>Required</td><td>Delete a page.</td></tr>
          <tr><td>GET</td><td><code>/p/:slug</code></td><td>None</td><td>View a published page.</td></tr>
        </tbody>
      </table></div>

      <h2>POST /v1/publish — parameters</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Field</th><th>Type</th><th>Required</th><th>Description</th></tr></thead>
        <tbody>
          <tr><td><code>html</code></td><td>string</td><td>Yes</td><td>The HTML to publish. Max 500&nbsp;KB on the free tier.</td></tr>
          <tr><td><code>title</code></td><td>string</td><td>No</td><td>Display title for the page.</td></tr>
          <tr><td><code>slug</code></td><td>string</td><td>No</td><td>Custom URL path (<code>a–z</code>, <code>0–9</code>, <code>-</code>; 1–64 chars). The page becomes <code>/p/&lt;slug&gt;</code>.</td></tr>
          <tr><td><code>password</code></td><td>string</td><td>No</td><td>Require a password to view the page.</td></tr>
          <tr><td><code>expires_in</code></td><td>number</td><td>No</td><td>Seconds until expiry. Default and free-tier maximum: 1,209,600 (14 days).</td></tr>
          <tr><td><code>public</code></td><td>boolean</td><td>No</td><td>If <code>true</code>, the page is search-indexable and listed in the sitemap and showcase. Default <code>false</code> (noindex).</td></tr>
        </tbody>
      </table></div>

      <h2>Managing pages</h2>
      <p>List your pages:</p>
      ${code(`curl ${s}/v1/pages -H "Authorization: Bearer sk_..."`)}
      <p>Update a page (any subset of fields):</p>
      ${code(`curl -X PUT ${s}/v1/pages/x7k2m9 \\
  -H "Authorization: Bearer sk_..." \\
  -H "Content-Type: application/json" \\
  -d '{"public": true, "title": "Updated"}'`)}
      <p>Delete a page:</p>
      ${code(`curl -X DELETE ${s}/v1/pages/x7k2m9 -H "Authorization: Bearer sk_..."`)}

      <h2>Limits &amp; errors</h2>
      <div class="table-wrap"><table>
        <thead><tr><th>Status</th><th>Meaning</th></tr></thead>
        <tbody>
          <tr><td><code>400</code></td><td>Missing/invalid <code>html</code>, invalid <code>slug</code>, or invalid <code>expires_in</code>.</td></tr>
          <tr><td><code>402</code></td><td>Monthly free quota (20 publishes) exceeded.</td></tr>
          <tr><td><code>409</code></td><td>Slug already taken. Retry with a different slug.</td></tr>
          <tr><td><code>413</code></td><td>HTML exceeds the 500&nbsp;KB free-tier limit.</td></tr>
          <tr><td><code>429</code></td><td>Rate limited (auto-registration cap per IP).</td></tr>
        </tbody>
      </table></div>
      <p>Free tier: 20 publishes/month · 14-day retention · 500&nbsp;KB per page.</p>`,
  },
  {
    slug: 'claude-code',
    navLabel: 'Claude Code',
    title: 'Publish HTML from Claude Code — ShipPage skill',
    description: 'Install the ShipPage skill in Claude Code and publish any generated HTML to a public URL by saying "publish this page". Zero config.',
    howto: {
      name: 'Publish HTML from Claude Code',
      steps: [
        { name: 'Install the skill', text: 'Run `clawhub install shippage` to add the ShipPage skill to Claude Code.' },
        { name: 'Ask your agent to publish', text: 'Tell Claude "publish this HTML as a webpage" or "turn this into a shareable link".' },
        { name: 'Open the returned URL', text: 'Claude returns a shippage.ai/p/... link you can open on any device.' },
      ],
    },
    body: () => `
      <p class="lead">Claude Code generates HTML — reports, dashboards, one-off pages — but it can't hand them off. The ShipPage skill closes that gap: one command to install, then just ask.</p>
      <h2>Install</h2>
      ${code(`clawhub install shippage`)}
      <h2>Use it</h2>
      <p>Tell your agent, in plain language:</p>
      <ul>
        <li>"Publish this HTML as a webpage"</li>
        <li>"Turn this report into a shareable link"</li>
        <li>"Give me a URL for this dashboard I can open on my phone"</li>
      </ul>
      <p>The skill calls ShipPage, gets a public URL, and hands it back. No API key setup — the agent auto-registers on first use and stores its credentials locally.</p>
      <h2>Prefer raw HTTP?</h2>
      <p>The skill is a thin wrapper over the <a href="/docs/api">publish API</a>. You can call it directly from any tool or script — see <a href="/docs/http">Any HTTP client</a>.</p>`,
  },
  {
    slug: 'claude-desktop',
    navLabel: 'Claude Desktop & Cursor',
    title: 'ShipPage MCP server — publish HTML from Claude Desktop & Cursor',
    description: 'Add the ShipPage MCP server to Claude Desktop, Cursor, or any MCP client to publish HTML and Markdown to a public URL. No API key required.',
    howto: {
      name: 'Publish HTML with the ShipPage MCP server',
      steps: [
        { name: 'Add the MCP server', text: 'Add shippage-mcp to your MCP client config with the command "npx shippage-mcp".' },
        { name: 'Restart the client', text: 'Restart Claude Desktop or Cursor so it loads the ShipPage tools.' },
        { name: 'Ask to publish', text: 'Ask the assistant to publish HTML or Markdown; it returns a public URL.' },
      ],
    },
    body: () => `
      <p class="lead">ShipPage ships an MCP server, so any Model Context Protocol client — Claude Desktop, Cursor, and others — can publish pages natively. No API key, no environment variables.</p>
      <h2>Add the server</h2>
      <p>Add this to your MCP client config (for Claude Desktop, <code>claude_desktop_config.json</code>):</p>
      ${code(`{
  "mcpServers": {
    "shippage": {
      "command": "npx",
      "args": ["shippage-mcp"]
    }
  }
}`)}
      <p>Restart the client. It exposes two tools: <code>publish_html</code> and <code>publish_markdown</code>.</p>
      <h2>Use it</h2>
      <p>Ask the assistant to "publish this as a webpage" or "publish this Markdown". Markdown is rendered to a styled, mobile-friendly page automatically.</p>
      <p>Package: <a href="https://www.npmjs.com/package/shippage-mcp" target="_blank" rel="noopener">shippage-mcp on npm</a>.</p>`,
  },
  {
    slug: 'http',
    navLabel: 'Any HTTP client',
    title: 'Publish HTML to a URL from any HTTP client or agent framework',
    description: 'ShipPage is a plain REST API — publish HTML to a public URL from Python, Node, Go, curl, or any agent framework with a single POST.',
    body: (s) => `
      <p class="lead">ShipPage is a standard REST endpoint. Any language or agent framework that can make an HTTP POST can publish a page.</p>
      <h2>curl</h2>
      ${code(`curl -X POST ${s}/v1/publish \\
  -H "Content-Type: application/json" \\
  -d '{"html": "<h1>Hello</h1>"}'`)}
      <h2>Python</h2>
      ${code(`import requests
r = requests.post("${s}/v1/publish", json={"html": "<h1>Hello</h1>"})
print(r.json()["url"])`)}
      <h2>Node.js</h2>
      ${code(`const res = await fetch("${s}/v1/publish", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ html: "<h1>Hello</h1>" }),
});
console.log((await res.json()).url);`)}
      <p>See the <a href="/docs/api">API reference</a> for all parameters, authentication, and page management.</p>`,
  },
  {
    slug: 'markdown',
    navLabel: 'Publishing Markdown',
    title: 'Publish Markdown to a styled web page — ShipPage',
    description: 'Turn Markdown into a styled, mobile-friendly public web page. The ShipPage skill and MCP server render Markdown automatically; over raw HTTP, send rendered HTML.',
    body: (s) => `
      <p class="lead">Have Markdown instead of HTML? The <a href="/docs/claude-code">Claude Code skill</a> and the <a href="/docs/claude-desktop">MCP server</a> render Markdown to a clean, GitHub-flavored, mobile-friendly page automatically — just ask them to "publish this Markdown".</p>
      <h2>Over raw HTTP</h2>
      <p>The <code>/v1/publish</code> endpoint takes HTML. To publish Markdown directly, render it to HTML first (any Markdown library works), then POST the result:</p>
      ${code(`# Node example using "marked"
import { marked } from "marked";
const html = marked.parse(markdownString);
await fetch("${s}/v1/publish", {
  method: "POST",
  headers: { "Content-Type": "application/json" },
  body: JSON.stringify({ html, title: "My Doc" }),
});`)}
      <p>The MCP server's <code>publish_markdown</code> tool does exactly this for you.</p>`,
  },
];

function renderDoc(page: DocPage, siteUrl: string, plausibleDomain?: string): string {
  const plausible = plausibleDomain
    ? `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.outbound-links.js"></script>`
    : '';
  const canonical = `${siteUrl}/docs${page.slug ? '/' + page.slug : ''}`;
  const sidebar = NAV.map((n) => {
    const href = `${siteUrl}/docs${n.slug ? '/' + n.slug : ''}`;
    const active = n.slug === page.slug ? ' class="active"' : '';
    return `<a href="${href}"${active}>${n.label}</a>`;
  }).join('');

  const howtoLd = page.howto
    ? `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'HowTo',
        name: page.howto.name,
        step: page.howto.steps.map((st, i) => ({
          '@type': 'HowToStep',
          position: i + 1,
          name: st.name,
          text: st.text,
        })),
      })}</script>`
    : `<script type="application/ld+json">${JSON.stringify({
        '@context': 'https://schema.org',
        '@type': 'TechArticle',
        headline: page.title,
        description: page.description,
        url: canonical,
        publisher: { '@type': 'Organization', name: 'ShipPage', url: siteUrl },
      })}</script>`;

  const breadcrumbLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Docs', item: `${siteUrl}/docs` },
      ...(page.slug ? [{ '@type': 'ListItem', position: 2, name: page.navLabel, item: canonical }] : []),
    ],
  })}</script>`;

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${page.title} | ShipPage</title>
  ${plausible}
  <meta name="description" content="${page.description}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${canonical}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="${page.title}">
  <meta property="og:description" content="${page.description}">
  <meta property="og:url" content="${canonical}">
  <meta property="og:image" content="${siteUrl}/og.png">
  <meta property="og:type" content="article">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${siteUrl}/og.png">
  ${howtoLd}
  ${breadcrumbLd}
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{--bg:#0a0a0a;--panel:#141414;--border:#222;--text:#f0f0f0;--muted:#9aa0a6;--dim:#5a6068;--accent:#f97316}
    body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.7;font-size:15.5px;-webkit-font-smoothing:antialiased}
    a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
    code{font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;font-size:0.9em;background:#1c1c1c;padding:2px 6px;border-radius:4px;color:#e8b892}
    nav.top{position:sticky;top:0;z-index:50;background:rgba(10,10,10,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
    nav.top .in{max-width:1080px;margin:0 auto;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 24px}
    .logo{font-size:18px;font-weight:700;color:var(--text)}.logo span{color:var(--accent)}
    nav.top .lk{display:flex;gap:22px;font-size:14px}nav.top .lk a{color:var(--muted)}nav.top .lk a:hover{color:var(--text);text-decoration:none}
    .layout{max-width:1080px;margin:0 auto;display:grid;grid-template-columns:1fr;gap:0;padding:0 24px}
    aside{padding:28px 0}
    aside .side{display:flex;flex-direction:row;flex-wrap:wrap;gap:6px 14px;font-size:14px;border-bottom:1px solid var(--border);padding-bottom:18px}
    aside .side a{color:var(--muted);padding:3px 0}
    aside .side a.active{color:var(--accent);font-weight:600}
    main{padding:28px 0 96px;min-width:0}
    main h1{font-size:30px;font-weight:800;letter-spacing:-.5px;margin-bottom:14px;text-wrap:balance}
    main h2{font-size:20px;font-weight:700;margin:36px 0 12px;padding-top:20px;border-top:1px solid var(--border)}
    main p{margin:0 0 14px;color:#d6d9dd}
    main .lead{font-size:17px;color:var(--muted);margin-bottom:8px}
    main ul{padding-left:22px;margin:0 0 16px}main li{margin:6px 0;color:#d6d9dd}
    .code{background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:16px 18px;overflow-x:auto;margin:0 0 18px}
    .code code{background:none;padding:0;color:#cdd3d8;font-size:13.5px;white-space:pre;line-height:1.6}
    .card-grid{display:grid;grid-template-columns:1fr;gap:12px;margin:8px 0 8px}
    .doc-card{display:block;background:var(--panel);border:1px solid var(--border);border-radius:10px;padding:16px 18px}
    .doc-card:hover{border-color:var(--accent);text-decoration:none}
    .doc-card strong{display:block;color:var(--text);font-size:15px;margin-bottom:4px}
    .doc-card span{color:var(--muted);font-size:13.5px}
    .table-wrap{overflow-x:auto;margin:0 0 18px}
    table{border-collapse:collapse;width:100%;font-size:14px}
    th,td{border:1px solid var(--border);padding:8px 12px;text-align:left;vertical-align:top}
    th{color:var(--muted);font-weight:600;font-size:13px}
    footer{border-top:1px solid var(--border);padding:28px 24px;text-align:center;color:var(--dim);font-size:13px}
    footer a{color:var(--dim)}
    @media(min-width:860px){
      .layout{grid-template-columns:200px 1fr;gap:48px}
      aside{padding:40px 0}
      aside .side{position:sticky;top:80px;flex-direction:column;flex-wrap:nowrap;gap:2px;border-bottom:none;padding-bottom:0}
      main{padding:40px 0 96px}
      .card-grid{grid-template-columns:1fr 1fr}
      main h1{font-size:34px}
    }
  </style>
</head>
<body>
  <nav class="top"><div class="in">
    <a href="/" class="logo">Ship<span>Page</span></a>
    <div class="lk">
      <a href="/docs">Docs</a>
      <a href="/templates">Templates</a>
      <a href="/blog">Blog</a>
      <a href="/pricing">Pricing</a>
      <a href="https://github.com/jieshu666/ShipPage-Skill" target="_blank" rel="noopener">GitHub</a>
    </div>
  </div></nav>
  <div class="layout">
    <aside><nav class="side">${sidebar}</nav></aside>
    <main>
      <h1>${page.title}</h1>
      ${page.body(siteUrl)}
    </main>
  </div>
  <footer>
    <a href="/">← ShipPage</a> · <a href="/docs">Docs</a> · <a href="/llms.txt">llms.txt</a> · <a href="https://github.com/jieshu666/ShipPage-Skill" target="_blank" rel="noopener">GitHub</a>
  </footer>
</body>
</html>`;
}

// Serve the hub at /docs and each guide at /docs/:slug. Also expose the raw
// markdown-ish source at /docs/:slug.md for LLM/agent ingestion.
docs.get('/docs', (c) => c.html(renderDoc(PAGES[0], c.env.SITE_URL, c.env.PLAUSIBLE_DOMAIN)));

docs.get('/docs/:slug', (c) => {
  const slug = c.req.param('slug').replace(/\.md$/, '');
  const isMd = c.req.param('slug').endsWith('.md');
  const page = PAGES.find((p) => p.slug === slug);
  if (!page) return c.notFound();
  if (isMd) {
    // Strip tags for a rough markdown/plaintext view that crawlers can read.
    const text = page.body(c.env.SITE_URL)
      .replace(/<pre class="code"><code>/g, '\n```\n')
      .replace(/<\/code><\/pre>/g, '\n```\n')
      .replace(/<[^>]+>/g, '')
      .replace(/\n{3,}/g, '\n\n')
      .trim();
    return new Response(`# ${page.title}\n\n${text}\n`, {
      headers: { 'Content-Type': 'text/markdown; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
    });
  }
  return c.html(renderDoc(page, c.env.SITE_URL, c.env.PLAUSIBLE_DOMAIN));
});

export const DOC_SLUGS = PAGES.map((p) => p.slug);
export default docs;
