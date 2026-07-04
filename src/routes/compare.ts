import { Hono } from 'hono';
import type { AppBindings } from '../types';

const compare = new Hono<AppBindings>();

// Comparison pages target the "shippage vs X" / "best way to X" queries that
// competitors capture with dedicated landing pages. Each carries a comparison
// table + FAQPage JSON-LD so search and generative engines can lift it.

interface Row { feature: string; ship: string; other: string }
interface Cmp {
  slug: string;
  other: string;
  title: string;
  description: string;
  intro: string;
  rows: Row[];
  faq: { q: string; a: string }[];
  bottom: string;
}

const COMPARISONS: Cmp[] = [
  {
    slug: 'vs-tiiny-host',
    other: 'tiiny.host',
    title: 'ShipPage vs tiiny.host — publishing HTML from an AI agent',
    description: 'ShipPage vs tiiny.host for publishing HTML to a URL. ShipPage is API-first and auto-registers on the first call; tiiny.host is an upload-first web tool. Compare workflow, agent support, and pricing.',
    intro: 'Both turn HTML into a public URL. The difference is who they are built for: tiiny.host is an upload-first tool for people dragging a file into a browser; ShipPage is an API-first service for AI agents that publish programmatically, with no account and no manual steps.',
    rows: [
      { feature: 'Primary interface', ship: 'REST API + MCP + skill', other: 'Web upload form' },
      { feature: 'Account required', ship: 'No — auto-registers on first call', other: 'Yes' },
      { feature: 'Publish from an agent', ship: 'Native (one POST)', other: 'Manual upload' },
      { feature: 'Markdown → styled page', ship: 'Yes', other: 'No' },
      { feature: 'Custom slug', ship: 'Yes', other: 'Paid' },
      { feature: 'Password protection', ship: 'Yes, free', other: 'Paid' },
      { feature: 'Free tier', ship: '20 pages/mo, no card', other: 'Limited trial' },
      { feature: 'Open source', ship: 'Yes (MIT)', other: 'No' },
    ],
    faq: [
      { q: 'Can an AI agent publish to tiiny.host automatically?', a: 'Not directly — tiiny.host is designed around a browser upload flow. ShipPage exposes a REST API, an MCP server, and an OpenClaw skill, so an agent can publish with a single call and get a URL back.' },
      { q: 'Do I need to sign up for ShipPage?', a: 'No. ShipPage auto-registers your agent on the first publish and returns an API key. tiiny.host requires an account.' },
    ],
    bottom: 'If a human is dragging a zip into a browser, tiiny.host is fine. If an agent or script needs to publish a page and hand back a link, ShipPage is built for exactly that.',
  },
  {
    slug: 'vs-artifact-sharing',
    other: 'Claude/ChatGPT share links',
    title: 'ShipPage vs Claude & ChatGPT share links — hosting agent-generated pages',
    description: 'When to use ShipPage instead of a Claude Artifact or ChatGPT canvas share link. ShipPage gives agents outside the chat UI a clean, brandable public URL with control over expiry, password, and slug.',
    intro: 'Claude and ChatGPT can now share what they generate inside their apps. ShipPage is for everything that lives outside that box: agents running in Claude Code, cron jobs, CI, or other frameworks — and for delivery that should look like a real product, not a chat transcript.',
    rows: [
      { feature: 'Works outside the chat app', ship: 'Yes (any agent/script)', other: 'No — tied to the app' },
      { feature: 'Clean, neutral URL', ship: 'shippage.ai/p/…', other: 'claude.ai / chatgpt.com link' },
      { feature: 'Custom slug', ship: 'Yes', other: 'No' },
      { feature: 'Password protection', ship: 'Yes', other: 'No' },
      { feature: 'Control expiry', ship: 'Yes', other: 'No' },
      { feature: 'Programmatic (API)', ship: 'Yes', other: 'No' },
      { feature: 'Markdown publishing', ship: 'Yes', other: 'N/A' },
    ],
    faq: [
      { q: 'Why not just share a Claude Artifact link?', a: 'If you are inside the Claude app, that works well. But a headless agent (Claude Code, a script, a scheduled job) has no share button, and a claude.ai link can read as "homework" when you send it to a client. ShipPage gives any agent a clean, controllable public URL.' },
      { q: 'Can I use ShipPage from ChatGPT?', a: 'Yes — via the REST API from a tool/action, or from any MCP-capable client. See the docs.' },
    ],
    bottom: 'Use in-app sharing when you are in the app. Use ShipPage when the page is generated outside it, or when the link needs a slug, a password, an expiry, or a professional face.',
  },
];

function renderCompare(cmp: Cmp, siteUrl: string, plausibleDomain?: string): string {
  const plausible = plausibleDomain
    ? `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.outbound-links.js"></script>`
    : '';
  const faqLd = `<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: cmp.faq.map((f) => ({ '@type': 'Question', name: f.q, acceptedAnswer: { '@type': 'Answer', text: f.a } })),
  })}</script>`;
  const rows = cmp.rows.map((r) => `<tr><td>${r.feature}</td><td class="ship">${r.ship}</td><td>${r.other}</td></tr>`).join('');
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${cmp.title} | ShipPage</title>
  ${plausible}
  <meta name="description" content="${cmp.description}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${siteUrl}/compare/${cmp.slug}">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <meta property="og:title" content="${cmp.title}">
  <meta property="og:description" content="${cmp.description}">
  <meta property="og:image" content="${siteUrl}/og.png">
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:image" content="${siteUrl}/og.png">
  ${faqLd}
  <style>
    *,*::before,*::after{margin:0;padding:0;box-sizing:border-box}
    :root{--bg:#0a0a0a;--panel:#141414;--border:#222;--text:#f0f0f0;--muted:#9aa0a6;--dim:#5a6068;--accent:#f97316}
    body{background:var(--bg);color:var(--text);font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',Roboto,sans-serif;line-height:1.75;font-size:15.5px;-webkit-font-smoothing:antialiased}
    a{color:var(--accent);text-decoration:none}a:hover{text-decoration:underline}
    nav.top{position:sticky;top:0;z-index:50;background:rgba(10,10,10,.85);backdrop-filter:blur(12px);border-bottom:1px solid var(--border)}
    nav.top .in{max-width:820px;margin:0 auto;height:56px;display:flex;align-items:center;justify-content:space-between;padding:0 24px}
    .logo{font-size:18px;font-weight:700;color:var(--text)}.logo span{color:var(--accent)}
    nav.top .lk{display:flex;gap:22px;font-size:14px}nav.top .lk a{color:var(--muted)}nav.top .lk a:hover{color:var(--text);text-decoration:none}
    .wrap{max-width:760px;margin:0 auto;padding:48px 24px 90px}
    h1{font-size:31px;font-weight:800;letter-spacing:-.5px;margin-bottom:14px;text-wrap:balance}
    .lead{font-size:17px;color:var(--muted);margin-bottom:28px}
    h2{font-size:20px;font-weight:700;margin:34px 0 12px}
    p{margin:0 0 14px;color:#d6d9dd}
    .table-wrap{overflow-x:auto;margin:0 0 8px}
    table{border-collapse:collapse;width:100%;font-size:14.5px}
    th,td{border:1px solid var(--border);padding:10px 14px;text-align:left;vertical-align:top}
    th{color:var(--muted);font-weight:600;font-size:13px}
    th.ship,td.ship{background:#1a1206;color:#ffd8b0}
    th.ship{color:var(--accent)}
    .qa{border-top:1px solid var(--border);padding:16px 0}
    .qa h3{font-size:16px;margin-bottom:6px}.qa p{color:var(--muted);font-size:14.5px;margin:0}
    .cta{display:inline-block;margin-top:8px;background:var(--accent);color:#fff;font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px}
    .cta:hover{background:#ea6a08;text-decoration:none}
    footer{border-top:1px solid var(--border);padding:28px 24px;text-align:center;color:var(--dim);font-size:13px}
    footer a{color:var(--dim)}
  </style>
</head>
<body>
  <nav class="top"><div class="in">
    <a href="/" class="logo">Ship<span>Page</span></a>
    <div class="lk"><a href="/docs">Docs</a><a href="/pricing">Pricing</a><a href="/blog">Blog</a><a href="https://github.com/jieshu666/ShipPage-Skill" target="_blank" rel="noopener">GitHub</a></div>
  </div></nav>
  <div class="wrap">
    <h1>${cmp.title.replace(' | ShipPage', '').replace(/ — .*/, '')}</h1>
    <p class="lead">${cmp.intro}</p>
    <h2>Side by side</h2>
    <div class="table-wrap"><table>
      <thead><tr><th>&nbsp;</th><th class="ship">ShipPage</th><th>${cmp.other}</th></tr></thead>
      <tbody>${rows}</tbody>
    </table></div>
    <h2>FAQ</h2>
    ${cmp.faq.map((f) => `<div class="qa"><h3>${f.q}</h3><p>${f.a}</p></div>`).join('')}
    <h2>Bottom line</h2>
    <p>${cmp.bottom}</p>
    <a class="cta" href="/docs/quickstart">Publish your first page →</a>
  </div>
  <footer><a href="/">← ShipPage</a> · <a href="/docs">Docs</a> · <a href="/pricing">Pricing</a></footer>
</body>
</html>`;
}

compare.get('/compare/:slug', (c) => {
  const cmp = COMPARISONS.find((x) => x.slug === c.req.param('slug'));
  if (!cmp) return c.notFound();
  return c.html(renderCompare(cmp, c.env.SITE_URL, c.env.PLAUSIBLE_DOMAIN));
});

export const COMPARE_SLUGS = COMPARISONS.map((c) => c.slug);
export default compare;
