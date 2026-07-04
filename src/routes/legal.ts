import { Hono } from 'hono';
import type { AppBindings } from '../types';

const legal = new Hono<AppBindings>();

// Trust & legal surface: /terms, /privacy, /about. Table stakes for a service
// that hosts arbitrary user content and collects waitlist emails. The privacy
// policy discloses the actual data flows in the codebase (R2/KV storage, IP for
// rate limiting, waitlist emails synced to Feishu) so it is accurate, not
// boilerplate.

const UPDATED = 'July 4, 2026';
const CONTACT_GH = 'https://github.com/jieshu666/ShipPage-Skill/issues';

function shell(siteUrl: string, path: string, title: string, desc: string, plausibleDomain: string | undefined, bodyHtml: string): string {
  const plausible = plausibleDomain
    ? `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.outbound-links.js"></script>`
    : '';
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} — ShipPage</title>
  ${plausible}
  <meta name="description" content="${desc}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${siteUrl}${path}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="${title} — ShipPage">
  <meta property="og:description" content="${desc}">
  <meta property="og:image" content="${siteUrl}/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${siteUrl}/og.png">
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{--bg:#0a0a0a;--panel:#141414;--border:#222;--text:#f0f0f0;--muted:#9aa0a6;--dim:#5a6068;--accent:#f97316}
    body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.75;font-size:15.5px;-webkit-font-smoothing:antialiased}
    a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
    nav.top{position:sticky;top:0;z-index:50;background:rgba(10,10,10,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
    nav.top .in{max-width:820px;margin:0 auto;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 24px}
    .logo{font-size:18px;font-weight:700;color:var(--text)}.logo span{color:var(--accent)}
    nav.top .lk{display:flex;gap:22px;font-size:14px}nav.top .lk a{color:var(--muted)}nav.top .lk a:hover{color:var(--text);text-decoration:none}
    .wrap{max-width:720px;margin:0 auto;padding:48px 24px 90px}
    h1{font-size:32px;font-weight:800;letter-spacing:-.5px;margin-bottom:6px}
    .updated{color:var(--dim);font-size:13px;margin-bottom:32px}
    h2{font-size:19px;font-weight:700;margin:34px 0 10px}
    p{margin:0 0 14px;color:#d6d9dd}
    ul{padding-left:22px;margin:0 0 16px}li{margin:6px 0;color:#d6d9dd}
    code{font-family:'SF Mono',ui-monospace,Menlo,Consolas,monospace;font-size:.88em;background:#1c1c1c;padding:1px 6px;border-radius:4px;color:#e8b892}
    .lead{font-size:17px;color:var(--muted);margin-bottom:20px}
    footer{border-top:1px solid var(--border);padding:28px 24px;text-align:center;color:var(--dim);font-size:13px}
    footer a{color:var(--dim)}
  </style>
</head>
<body>
  <nav class="top"><div class="in">
    <a href="/" class="logo">Ship<span>Page</span></a>
    <div class="lk"><a href="/docs">Docs</a><a href="/pricing">Pricing</a><a href="/blog">Blog</a><a href="https://github.com/jieshu666/ShipPage-Skill" target="_blank" rel="noopener">GitHub</a></div>
  </div></nav>
  <div class="wrap">${bodyHtml}</div>
  <footer>
    <a href="/">← ShipPage</a> · <a href="/terms">Terms</a> · <a href="/privacy">Privacy</a> · <a href="/about">About</a> · <a href="${CONTACT_GH}" target="_blank" rel="noopener">Contact</a>
  </footer>
</body>
</html>`;
}

legal.get('/terms', (c) => {
  const s = c.env.SITE_URL;
  const body = `
    <h1>Terms of Service</h1>
    <p class="updated">Last updated ${UPDATED}</p>
    <p class="lead">ShipPage lets anyone publish HTML or Markdown to a public URL. These terms keep the service safe to use and safe to run. By publishing a page you agree to them.</p>

    <h2>Acceptable use</h2>
    <p>You may not use ShipPage to publish or distribute:</p>
    <ul>
      <li>Phishing pages, credential-harvesting forms, or content impersonating another person or brand.</li>
      <li>Malware, drive-by downloads, or scripts that attack or deceive visitors.</li>
      <li>Content that is illegal, infringes others' rights, or violates others' privacy.</li>
      <li>Spam, or automated abuse that degrades the service for others.</li>
    </ul>
    <p>Pages are published from a single shared domain, so abuse harms every other user. We take it seriously.</p>

    <h2>Our rights</h2>
    <p>We may remove any page, revoke any agent's access, or block any source at any time — with or without notice — if we believe it violates these terms or threatens the service or its users. Free-tier pages are also removed automatically after their retention period.</p>

    <h2>Reporting abuse</h2>
    <p>To report a page that violates these terms, open an issue at <a href="${CONTACT_GH}" target="_blank" rel="noopener">our GitHub</a> or email <code>abuse@shippage.ai</code> with the page URL. We act on credible reports promptly.</p>

    <h2>The service is provided "as is"</h2>
    <p>ShipPage is offered without warranty of any kind. The free tier has no uptime guarantee, and pages may expire or be removed as described above and in our <a href="/pricing">pricing</a>. To the extent permitted by law, we are not liable for any loss arising from use of the service. Do not rely on ShipPage as the sole store of anything important.</p>

    <h2>Changes</h2>
    <p>We may update these terms; material changes will be reflected by the date above. Continued use after a change means you accept it.</p>`;
  return c.html(shell(s, '/terms', 'Terms of Service', 'ShipPage Terms of Service — acceptable use, content removal rights, and how to report abuse.', c.env.PLAUSIBLE_DOMAIN, body));
});

legal.get('/privacy', (c) => {
  const s = c.env.SITE_URL;
  const body = `
    <h1>Privacy Policy</h1>
    <p class="updated">Last updated ${UPDATED}</p>
    <p class="lead">This policy describes exactly what ShipPage stores and why. We keep it minimal on purpose.</p>

    <h2>What we store</h2>
    <ul>
      <li><strong>Page content</strong> — the HTML you publish, stored on Cloudflare R2, and page metadata (title, slug, timestamps, view count) on Cloudflare KV. Public pages are indexable; the rest are <code>noindex</code>.</li>
      <li><strong>Agent identity</strong> — an auto-generated agent ID and API key so your agent can manage its own pages. No name, email, or personal profile is required to publish.</li>
      <li><strong>IP address</strong> — used transiently to rate-limit auto-registration and abuse. It is not attached to your published pages.</li>
      <li><strong>Account (optional)</strong> — if you link a Google account to manage pages, we store your Google ID, name, email, and avatar URL for that purpose only.</li>
      <li><strong>Waitlist email (optional)</strong> — if you join the Pro early-access list, we store your email to notify you.</li>
    </ul>

    <h2>Third parties</h2>
    <ul>
      <li><strong>Cloudflare</strong> — hosting, storage, and edge delivery.</li>
      <li><strong>Feishu (Lark)</strong> — waitlist emails and operational metrics are synced to a Feishu (ByteDance) workspace we use to run the service. If you prefer your waitlist email not be stored there, don't join the list, or ask us to remove it.</li>
      <li><strong>Google</strong> — only if you choose to sign in with Google to manage pages.</li>
      <li><strong>Plausible Analytics</strong> — privacy-friendly, cookieless traffic analytics that does not track individuals across sites (used only when enabled).</li>
    </ul>

    <h2>Retention &amp; deletion</h2>
    <p>Free-tier pages are removed automatically after 14 days. You can delete any of your pages at any time from your <a href="/claim">claim dashboard</a> or via the API. To request deletion of a linked account or a waitlist email, open an issue at <a href="${CONTACT_GH}" target="_blank" rel="noopener">our GitHub</a> or email <code>hello@shippage.ai</code>.</p>

    <h2>Published pages are public</h2>
    <p>Anything you publish without a password is publicly accessible to anyone with the link, and — if you set <code>public: true</code> — to search engines. Don't put secrets in a page.</p>

    <h2>Changes</h2>
    <p>We'll reflect material changes by updating the date above.</p>`;
  return c.html(shell(s, '/privacy', 'Privacy Policy', 'ShipPage Privacy Policy — exactly what we store (page content, optional account, waitlist email), the third parties involved, and how to request deletion.', c.env.PLAUSIBLE_DOMAIN, body));
});

legal.get('/about', (c) => {
  const s = c.env.SITE_URL;
  const body = `
    <h1>About ShipPage</h1>
    <p class="updated">Updated ${UPDATED}</p>
    <p class="lead">ShipPage is the publishing API for AI agents. One POST, one public URL.</p>
    <p>AI agents got very good at generating web pages — reports, dashboards, landing pages, one-off tools. But generation isn't delivery. A page trapped in a chat window, a local file, or a headless agent's output can't be opened on a phone, sent to a client, or dropped into a message. ShipPage closes that last mile: your agent sends HTML or Markdown, and gets back a live link that works anywhere, on the very first call — no account, no keys, no build step.</p>
    <h2>Where it fits</h2>
    <p>Platform chat apps can share what they generate, but agents that run <em>outside</em> a chat UI — Claude Code, cron jobs, CI pipelines, OpenClaw and other frameworks — have no share button. And a link that says "this was made by a person you can trust" beats a link that looks like homework. That's the gap ShipPage is built for.</p>
    <h2>How it's built</h2>
    <p>ShipPage runs entirely on Cloudflare Workers, R2, and KV — edge-deployed for sub-100ms responses, and cheap enough to keep a generous free tier. It's open source under the MIT license: <a href="https://github.com/jieshu666/ShipPage-Skill" target="_blank" rel="noopener">github.com/jieshu666/ShipPage-Skill</a>.</p>
    <h2>Get started</h2>
    <p>Read the <a href="/docs">docs</a>, or just publish your first page in one call from the <a href="/docs/quickstart">quickstart</a>. Questions or feedback? <a href="${CONTACT_GH}" target="_blank" rel="noopener">Open an issue</a>.</p>`;
  return c.html(shell(s, '/about', 'About', 'About ShipPage — the publishing API for AI agents, built on Cloudflare Workers and open source under MIT.', c.env.PLAUSIBLE_DOMAIN, body));
});

export default legal;
