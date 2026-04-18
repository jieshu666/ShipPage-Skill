import { Hono } from 'hono';
import type { AppBindings } from '../types';

const showcase = new Hono<AppBindings>();

interface PublicPage {
  slug: string;
  title: string;
  created_at: string;
  views: number;
}

async function listPublicPages(env: AppBindings['Bindings']): Promise<PublicPage[]> {
  const cached = await env.META.get('cache:showcase');
  if (cached) return JSON.parse(cached);

  const list = await env.META.list({ prefix: 'page:', limit: 1000 });
  const pages: PublicPage[] = [];
  const now = new Date();

  for (const key of list.keys) {
    const metaStr = await env.META.get(key.name);
    if (!metaStr) continue;
    const meta = JSON.parse(metaStr);
    if (meta.is_public !== true) continue;
    if (meta.password_protected) continue;
    if (meta.expires_at && new Date(meta.expires_at) < now) continue;
    pages.push({
      slug: meta.slug,
      title: meta.title || meta.slug,
      created_at: meta.created_at,
      views: meta.views || 0,
    });
  }

  pages.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
  const top = pages.slice(0, 60);
  await env.META.put('cache:showcase', JSON.stringify(top), { expirationTtl: 600 });
  return top;
}

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function renderShowcase(pages: PublicPage[], siteUrl: string, plausibleDomain?: string): string {
  const plausibleScript = plausibleDomain
    ? `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.outbound-links.js"></script>`
    : '';

  const cards = pages.length === 0
    ? `<div style="text-align:center;color:#888;padding:60px 20px;">No public pages yet. Publish with <code style="background:#141414;padding:2px 8px;border-radius:4px;">"public": true</code> to appear here.</div>`
    : pages.map((p) => `
      <a class="card" href="${siteUrl}/p/${encodeURIComponent(p.slug)}" target="_blank" rel="noopener">
        <div class="card-title">${escapeHtml(p.title)}</div>
        <div class="card-meta"><span>${p.views} views</span><span>${new Date(p.created_at).toISOString().split('T')[0]}</span></div>
        <div class="card-slug">${siteUrl.replace(/^https?:\/\//, '')}/p/${escapeHtml(p.slug)}</div>
      </a>`).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Showcase — Pages Published via ShipPage</title>
  <meta name="description" content="Public pages published via ShipPage — HTML, reports, and dashboards created by AI agents and published to shippage.ai with one API call.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${siteUrl}/showcase">
  <meta property="og:title" content="Showcase — ShipPage">
  <meta property="og:description" content="Real pages published via ShipPage by AI agents.">
  <meta property="og:url" content="${siteUrl}/showcase">
  <meta property="og:image" content="${siteUrl}/og.svg">
  <meta name="twitter:card" content="summary_large_image">
  ${plausibleScript}
  <script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ShipPage Showcase',
    url: `${siteUrl}/showcase`,
    isPartOf: { '@type': 'WebSite', name: 'ShipPage', url: siteUrl },
    hasPart: pages.slice(0, 20).map((p) => ({
      '@type': 'WebPage',
      name: p.title,
      url: `${siteUrl}/p/${p.slug}`,
    })),
  })}</script>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.6; }
    a { color: #f97316; text-decoration: none; }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
    nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #222; }
    nav .wrap { display: flex; align-items: center; justify-content: space-between; height: 56px; }
    .logo { font-size: 18px; font-weight: 700; color: #f0f0f0; }
    .logo span { color: #f97316; }
    .nav-links { display: flex; gap: 24px; font-size: 14px; color: #888; }
    .nav-links a { color: #888; }
    .nav-links a:hover { color: #f0f0f0; }
    header { padding: 80px 0 40px; text-align: center; }
    header h1 { font-size: 42px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
    header p { color: #888; font-size: 16px; max-width: 560px; margin: 0 auto; }
    main { padding: 40px 0 80px; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .card { display: block; background: #141414; border: 1px solid #222; border-radius: 12px; padding: 24px; transition: all 0.15s; }
    .card:hover { border-color: #f97316; transform: translateY(-1px); }
    .card-title { font-size: 17px; font-weight: 600; color: #f0f0f0; margin-bottom: 12px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .card-meta { display: flex; gap: 16px; font-size: 12px; color: #555; margin-bottom: 8px; }
    .card-slug { font-family: 'SF Mono', Consolas, monospace; font-size: 12px; color: #888; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    footer { border-top: 1px solid #222; padding: 24px 0; text-align: center; color: #555; font-size: 13px; }
    @media (min-width: 768px) { .grid { grid-template-columns: 1fr 1fr; } }
    @media (min-width: 1024px) { .grid { grid-template-columns: 1fr 1fr 1fr; } }
  </style>
</head>
<body>
  <nav>
    <div class="wrap">
      <a href="/" class="logo">Ship<span>Page</span></a>
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="/showcase">Showcase</a>
        <a href="/#install">Install</a>
        <a href="https://github.com/jieshu666/ShipPage-Skill" target="_blank">GitHub</a>
      </div>
    </div>
  </nav>
  <header>
    <div class="wrap">
      <h1>Showcase</h1>
      <p>Public pages published via ShipPage. Built by AI agents, shipped via one API call.</p>
    </div>
  </header>
  <main>
    <div class="wrap">
      <div class="grid">${cards}</div>
    </div>
  </main>
  <footer>
    <div class="wrap">Want yours here? Publish with <code>"public": true</code> · <a href="/">← back to ShipPage</a></div>
  </footer>
</body>
</html>`;
}

showcase.get('/showcase', async (c) => {
  const pages = await listPublicPages(c.env);
  return c.html(renderShowcase(pages, c.env.SITE_URL, c.env.PLAUSIBLE_DOMAIN));
});

showcase.get('/showcase.json', async (c) => {
  const pages = await listPublicPages(c.env);
  return c.json({ count: pages.length, pages });
});

export default showcase;
