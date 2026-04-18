import { Hono } from 'hono';
import type { AppBindings } from '../types';
import { changelog, type ChangelogEntry } from '../content/changelog';

const log = new Hono<AppBindings>();

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

const SECTION_LABEL: Record<string, string> = {
  added: 'Added',
  changed: 'Changed',
  fixed: 'Fixed',
  removed: 'Removed',
  security: 'Security',
};

const SECTION_COLOR: Record<string, string> = {
  added: '#4ade80',
  changed: '#22d3ee',
  fixed: '#fbbf24',
  removed: '#ef4444',
  security: '#a78bfa',
};

function renderEntry(e: ChangelogEntry): string {
  const sections = Object.entries(e.sections)
    .filter(([, items]) => items && items.length > 0)
    .map(([key, items]) => `
      <div class="section">
        <h3 style="color:${SECTION_COLOR[key] || '#888'};">${SECTION_LABEL[key] || key}</h3>
        <ul>${items!.map((it) => `<li>${escapeHtml(it)}</li>`).join('')}</ul>
      </div>`).join('');

  return `<article class="entry" id="v${escapeHtml(e.version)}">
    <header>
      <h2><a href="#v${escapeHtml(e.version)}">v${escapeHtml(e.version)}</a></h2>
      <time datetime="${escapeHtml(e.date)}">${escapeHtml(e.date)}</time>
    </header>
    ${e.summary ? `<p class="summary">${escapeHtml(e.summary)}</p>` : ''}
    ${sections}
  </article>`;
}

function renderPage(siteUrl: string, plausibleDomain?: string): string {
  const plausibleScript = plausibleDomain
    ? `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.outbound-links.js"></script>`
    : '';

  const sorted = [...changelog].sort((a, b) => b.date.localeCompare(a.date));
  const entries = sorted.map(renderEntry).join('');

  const jsonLdBlog = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ShipPage Changelog',
    description: 'Release notes for ShipPage — what shipped, what changed, what was fixed.',
    url: `${siteUrl}/changelog`,
    isPartOf: { '@type': 'WebSite', name: 'ShipPage', url: siteUrl },
    blogPost: sorted.map((e) => ({
      '@type': 'BlogPosting',
      headline: `ShipPage v${e.version}`,
      datePublished: e.date,
      url: `${siteUrl}/changelog#v${e.version}`,
      description: e.summary || `Release notes for ShipPage v${e.version}`,
      author: { '@type': 'Organization', name: 'ShipPage', url: siteUrl },
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Changelog — ShipPage</title>
  <meta name="description" content="Release notes for ShipPage. What shipped, what changed, what was fixed — updated automatically on every release.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${siteUrl}/changelog">
  <meta property="og:title" content="ShipPage Changelog">
  <meta property="og:description" content="Release notes for ShipPage.">
  <meta property="og:url" content="${siteUrl}/changelog">
  <meta property="og:image" content="${siteUrl}/og.svg">
  <meta name="twitter:card" content="summary_large_image">
  ${plausibleScript}
  <script type="application/ld+json">${JSON.stringify(jsonLdBlog)}</script>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.7; }
    a { color: #f97316; text-decoration: none; }
    a:hover { text-decoration: underline; }
    .wrap { max-width: 760px; margin: 0 auto; padding: 0 24px; }
    .wrap-wide { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
    nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #222; }
    nav .wrap-wide { display: flex; align-items: center; justify-content: space-between; height: 56px; }
    .logo { font-weight: 700; color: #f0f0f0; font-size: 18px; } .logo span { color: #f97316; }
    .nav-links { display: flex; gap: 24px; font-size: 14px; color: #888; }
    .nav-links a { color: #888; } .nav-links a:hover { color: #f0f0f0; text-decoration: none; }
    header.page { padding: 80px 0 40px; text-align: center; }
    header.page h1 { font-size: 42px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
    header.page p { color: #888; font-size: 16px; max-width: 600px; margin: 0 auto; }
    main { padding: 20px 0 80px; }
    .entry { background: #141414; border: 1px solid #222; border-radius: 12px; padding: 32px; margin-bottom: 24px; }
    .entry header { display: flex; align-items: baseline; justify-content: space-between; gap: 12px; margin-bottom: 12px; border: 0; padding: 0; text-align: left; }
    .entry h2 { font-size: 26px; font-weight: 700; color: #f0f0f0; letter-spacing: -0.3px; margin: 0; }
    .entry h2 a { color: inherit; }
    .entry time { color: #555; font-size: 14px; font-family: 'SF Mono', Consolas, monospace; }
    .entry .summary { color: #b5b5b5; margin-bottom: 20px; font-size: 15px; }
    .entry .section { margin-bottom: 16px; }
    .entry h3 { font-size: 12px; text-transform: uppercase; letter-spacing: 0.1em; font-weight: 700; margin-bottom: 8px; }
    .entry ul { list-style: none; }
    .entry li { color: #b5b5b5; font-size: 14px; padding: 3px 0 3px 20px; position: relative; line-height: 1.65; }
    .entry li::before { content: '▸'; color: #555; position: absolute; left: 0; top: 3px; }
    footer { border-top: 1px solid #222; padding: 24px 0; color: #555; font-size: 13px; text-align: center; }
  </style>
</head>
<body>
  <nav>
    <div class="wrap-wide">
      <a href="/" class="logo">Ship<span>Page</span></a>
      <div class="nav-links">
        <a href="/">Home</a>
        <a href="/blog">Blog</a>
        <a href="/templates">Templates</a>
        <a href="/changelog">Changelog</a>
      </div>
    </div>
  </nav>
  <header class="page">
    <div class="wrap">
      <h1>Changelog</h1>
      <p>Release notes for ShipPage — auto-updated on every tagged release. Follow via <a href="/blog/rss.xml">RSS</a> or GitHub.</p>
    </div>
  </header>
  <main>
    <div class="wrap">${entries}</div>
  </main>
  <footer><div class="wrap-wide"><a href="/">← back to ShipPage</a> · <a href="https://github.com/jieshu666/ShipPage-Skill/releases" target="_blank" rel="noopener">GitHub Releases</a></div></footer>
</body>
</html>`;
}

log.get('/changelog', (c) => c.html(renderPage(c.env.SITE_URL, c.env.PLAUSIBLE_DOMAIN)));

log.get('/changelog.json', (c) => c.json({ entries: changelog }));

export default log;
