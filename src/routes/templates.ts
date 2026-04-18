import { Hono } from 'hono';
import type { AppBindings } from '../types';
import { templates, findTemplate } from '../content/templates';

const tpl = new Hono<AppBindings>();

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

function renderIndex(siteUrl: string, plausibleDomain?: string): string {
  const plausibleScript = plausibleDomain
    ? `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.outbound-links.js"></script>`
    : '';

  const cards = templates.map((t) => `
    <a class="card" href="/templates/${t.slug}">
      <div class="card-cat">${escapeHtml(t.category)}</div>
      <h3>${escapeHtml(t.title)}</h3>
      <p>${escapeHtml(t.description)}</p>
      <div class="card-keywords">${t.keywords.map((k) => `<span>${escapeHtml(k)}</span>`).join('')}</div>
    </a>`).join('');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CollectionPage',
    name: 'ShipPage Templates',
    description: 'Copy-paste HTML templates for AI agents to publish via ShipPage.',
    url: `${siteUrl}/templates`,
    isPartOf: { '@type': 'WebSite', name: 'ShipPage', url: siteUrl },
    hasPart: templates.map((t) => ({
      '@type': 'CreativeWork',
      name: t.title,
      description: t.description,
      url: `${siteUrl}/templates/${t.slug}`,
      keywords: t.keywords.join(', '),
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Templates — Copy-paste HTML for AI agents | ShipPage</title>
  <meta name="description" content="Ready-to-publish HTML templates for common use cases: resumes, landing pages, data reports, meeting notes, link-in-bio. Copy the HTML, publish via ShipPage in one API call.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${siteUrl}/templates">
  <meta property="og:title" content="ShipPage Templates — copy-paste HTML for AI agents">
  <meta property="og:description" content="5 ready-to-publish templates your AI agent can use today.">
  <meta property="og:url" content="${siteUrl}/templates">
  <meta property="og:image" content="${siteUrl}/og.svg">
  <meta name="twitter:card" content="summary_large_image">
  ${plausibleScript}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', sans-serif; line-height: 1.6; }
    a { color: #f97316; text-decoration: none; }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
    nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #222; }
    nav .wrap { display: flex; align-items: center; justify-content: space-between; height: 56px; }
    .logo { font-size: 18px; font-weight: 700; color: #f0f0f0; } .logo span { color: #f97316; }
    .nav-links { display: flex; gap: 24px; font-size: 14px; color: #888; }
    .nav-links a { color: #888; } .nav-links a:hover { color: #f0f0f0; }
    header { padding: 80px 0 40px; text-align: center; }
    header h1 { font-size: 42px; font-weight: 800; letter-spacing: -1px; margin-bottom: 12px; }
    header p { color: #888; font-size: 16px; max-width: 600px; margin: 0 auto; }
    main { padding: 40px 0 80px; }
    .grid { display: grid; grid-template-columns: 1fr; gap: 16px; }
    .card { display: block; background: #141414; border: 1px solid #222; border-radius: 12px; padding: 24px; transition: all 0.15s; color: #f0f0f0; }
    .card:hover { border-color: #f97316; transform: translateY(-1px); text-decoration: none; }
    .card-cat { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #f97316; font-weight: 600; margin-bottom: 8px; }
    .card h3 { font-size: 18px; margin-bottom: 6px; }
    .card p { color: #888; font-size: 14px; margin-bottom: 12px; }
    .card-keywords { display: flex; gap: 6px; flex-wrap: wrap; }
    .card-keywords span { background: #0a0a0a; border: 1px solid #222; padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #888; }
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
        <a href="/templates">Templates</a>
        <a href="/showcase">Showcase</a>
        <a href="/#install">Install</a>
      </div>
    </div>
  </nav>
  <header>
    <div class="wrap">
      <h1>Templates</h1>
      <p>Ready-to-publish HTML for common agent outputs. Each template is a working page — preview it, copy the HTML, publish via ShipPage.</p>
    </div>
  </header>
  <main>
    <div class="wrap">
      <div class="grid">${cards}</div>
    </div>
  </main>
  <footer>
    <div class="wrap"><a href="/">← back to ShipPage</a></div>
  </footer>
</body>
</html>`;
}

function renderDetail(slug: string, siteUrl: string, plausibleDomain?: string): string {
  const t = findTemplate(slug);
  if (!t) return '';
  const plausibleScript = plausibleDomain
    ? `<script defer data-domain="${plausibleDomain}" src="https://plausible.io/js/script.outbound-links.js"></script>`
    : '';

  const htmlEscaped = escapeHtml(t.html);
  const previewSrc = 'data:text/html;charset=utf-8,' + encodeURIComponent(t.html);
  const curlCmd = `curl -X POST ${siteUrl}/v1/publish \\
  -H "Content-Type: application/json" \\
  -d @- <<'JSON'
{
  "title": ${JSON.stringify(t.title)},
  "public": true,
  "html": ${JSON.stringify(t.html)}
}
JSON`;

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'CreativeWork',
    name: t.title,
    description: t.description,
    url: `${siteUrl}/templates/${t.slug}`,
    keywords: t.keywords.join(', '),
    isPartOf: { '@type': 'CollectionPage', name: 'ShipPage Templates', url: `${siteUrl}/templates` },
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(t.title)} — ShipPage Template</title>
  <meta name="description" content="${escapeHtml(t.description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${siteUrl}/templates/${t.slug}">
  <meta property="og:title" content="${escapeHtml(t.title)} — ShipPage Template">
  <meta property="og:description" content="${escapeHtml(t.description)}">
  <meta property="og:url" content="${siteUrl}/templates/${t.slug}">
  <meta property="og:image" content="${siteUrl}/og.svg">
  <meta name="twitter:card" content="summary_large_image">
  ${plausibleScript}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  <style>
    *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
    body { background: #0a0a0a; color: #f0f0f0; font-family: -apple-system, sans-serif; line-height: 1.6; }
    a { color: #f97316; text-decoration: none; }
    .wrap { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
    nav { height: 56px; display: flex; align-items: center; justify-content: space-between; border-bottom: 1px solid #222; }
    .logo { font-weight: 700; } .logo span { color: #f97316; }
    .nav-links { display: flex; gap: 24px; font-size: 14px; color: #888; } .nav-links a { color: #888; }
    header { padding: 60px 0 32px; }
    header .cat { font-size: 11px; text-transform: uppercase; letter-spacing: 0.08em; color: #f97316; font-weight: 600; }
    header h1 { font-size: 36px; font-weight: 800; margin: 8px 0; }
    header p { color: #888; font-size: 16px; max-width: 640px; }
    .preview-wrap { border: 1px solid #222; border-radius: 12px; overflow: hidden; margin-bottom: 32px; background: #fff; }
    iframe { width: 100%; height: 600px; border: 0; display: block; }
    section h2 { font-size: 20px; margin-bottom: 12px; }
    .code { background: #0d1117; border: 1px solid #222; border-radius: 12px; overflow: hidden; margin-bottom: 24px; }
    .code-head { display: flex; align-items: center; justify-content: space-between; padding: 10px 16px; border-bottom: 1px solid #222; font-size: 12px; color: #888; text-transform: uppercase; letter-spacing: 0.05em; }
    .copy-btn { background: transparent; border: 1px solid #333; color: #888; padding: 4px 12px; border-radius: 4px; font-size: 11px; cursor: pointer; font-family: inherit; }
    .copy-btn:hover { color: #f0f0f0; border-color: #888; }
    pre { padding: 16px; overflow-x: auto; font-family: 'SF Mono', Consolas, monospace; font-size: 12px; line-height: 1.6; color: #d4d4d4; }
    footer { border-top: 1px solid #222; padding: 24px 0; text-align: center; color: #555; font-size: 13px; margin-top: 40px; }
  </style>
</head>
<body>
  <div class="wrap"><nav>
    <a href="/" class="logo">Ship<span>Page</span></a>
    <div class="nav-links"><a href="/">Home</a><a href="/templates">← all templates</a></div>
  </nav></div>
  <header><div class="wrap">
    <div class="cat">${escapeHtml(t.category)}</div>
    <h1>${escapeHtml(t.title)}</h1>
    <p>${escapeHtml(t.description)}</p>
  </div></header>
  <main><div class="wrap">
    <div class="preview-wrap"><iframe src="${previewSrc}" title="${escapeHtml(t.title)} preview" sandbox="allow-same-origin"></iframe></div>
    <section>
      <h2>Publish via ShipPage</h2>
      <div class="code">
        <div class="code-head"><span>Terminal</span><button class="copy-btn" id="copy-curl">Copy</button></div>
        <pre id="curl-block">${escapeHtml(curlCmd)}</pre>
      </div>
    </section>
    <section>
      <h2>Raw HTML</h2>
      <div class="code">
        <div class="code-head"><span>${escapeHtml(t.slug)}.html</span><button class="copy-btn" id="copy-html">Copy</button></div>
        <pre id="html-block">${htmlEscaped}</pre>
      </div>
    </section>
  </div></main>
  <footer><div class="wrap">Template for ShipPage · <a href="/">back to home</a></div></footer>
  <script>
    function copyFrom(btnId, blockId) {
      const btn = document.getElementById(btnId);
      const block = document.getElementById(blockId);
      btn.addEventListener('click', async () => {
        try {
          await navigator.clipboard.writeText(block.textContent);
          btn.textContent = 'Copied!';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        } catch (e) {
          btn.textContent = 'Failed';
          setTimeout(() => { btn.textContent = 'Copy'; }, 2000);
        }
      });
    }
    copyFrom('copy-curl', 'curl-block');
    copyFrom('copy-html', 'html-block');
  </script>
</body>
</html>`;
}

tpl.get('/templates', (c) => c.html(renderIndex(c.env.SITE_URL, c.env.PLAUSIBLE_DOMAIN)));

tpl.get('/templates/:slug', (c) => {
  const slug = c.req.param('slug')!;
  const t = findTemplate(slug);
  if (!t) return c.html('<h1>404 — template not found</h1>', 404);
  return c.html(renderDetail(slug, c.env.SITE_URL, c.env.PLAUSIBLE_DOMAIN));
});

export default tpl;
