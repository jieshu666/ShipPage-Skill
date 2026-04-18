import { Hono } from 'hono';
import type { AppBindings } from '../types';
import { posts, findPost, type BlogPost } from '../content/blog';

const blog = new Hono<AppBindings>();

function escapeHtml(s: string): string {
  return s.replace(/[&<>"']/g, (c) => ({ '&': '&amp;', '<': '&lt;', '>': '&gt;', '"': '&quot;', "'": '&#39;' }[c]!));
}

const BLOG_CSS = `<style>
  *, *::before, *::after { margin: 0; padding: 0; box-sizing: border-box; }
  body { background: #0a0a0a; color: #e5e5e5; font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; line-height: 1.75; }
  a { color: #f97316; text-decoration: none; }
  a:hover { text-decoration: underline; }
  .wrap { max-width: 760px; margin: 0 auto; padding: 0 24px; }
  .wrap-wide { max-width: 1080px; margin: 0 auto; padding: 0 24px; }
  nav { position: sticky; top: 0; z-index: 100; background: rgba(10,10,10,0.85); backdrop-filter: blur(12px); border-bottom: 1px solid #222; }
  nav .wrap-wide { display: flex; align-items: center; justify-content: space-between; height: 56px; }
  .logo { font-weight: 700; color: #f0f0f0; font-size: 18px; } .logo span { color: #f97316; }
  .nav-links { display: flex; gap: 24px; font-size: 14px; color: #888; }
  .nav-links a { color: #888; } .nav-links a:hover { color: #f0f0f0; text-decoration: none; }
  header.post { padding: 80px 0 32px; }
  header.post .meta { color: #888; font-size: 14px; margin-bottom: 16px; display: flex; gap: 12px; flex-wrap: wrap; }
  header.post .meta .tag { background: #141414; border: 1px solid #222; padding: 2px 8px; border-radius: 4px; font-size: 12px; color: #f97316; }
  header.post h1 { font-size: 40px; font-weight: 800; letter-spacing: -1px; line-height: 1.15; color: #f0f0f0; margin-bottom: 16px; }
  header.post .desc { font-size: 17px; color: #888; }
  article { padding: 32px 0 80px; }
  article .lead { font-size: 18px; color: #b5b5b5; margin-bottom: 32px; line-height: 1.75; }
  article h2 { font-size: 26px; font-weight: 700; margin: 48px 0 16px; color: #f0f0f0; letter-spacing: -0.3px; }
  article h3 { font-size: 20px; font-weight: 600; margin: 32px 0 12px; color: #f0f0f0; }
  article p { margin-bottom: 16px; }
  article ul, article ol { margin: 16px 0 16px 24px; }
  article li { margin-bottom: 8px; }
  article blockquote { border-left: 3px solid #f97316; padding: 8px 20px; margin: 20px 0; color: #b5b5b5; font-style: italic; background: #141414; border-radius: 0 8px 8px 0; }
  article pre { background: #0d1117; border: 1px solid #222; border-radius: 8px; padding: 16px; overflow-x: auto; margin: 20px 0; }
  article pre code { font-family: 'SF Mono', Consolas, monospace; font-size: 13px; color: #d4d4d4; line-height: 1.6; }
  article code { font-family: 'SF Mono', Consolas, monospace; font-size: 13px; background: #141414; padding: 1px 6px; border-radius: 3px; color: #fbbf24; }
  article pre code { background: transparent; padding: 0; color: inherit; }
  article table { width: 100%; border-collapse: collapse; margin: 20px 0; font-size: 14px; }
  article .table-wrap { overflow-x: auto; border: 1px solid #222; border-radius: 8px; }
  article th { background: #141414; padding: 10px 12px; text-align: left; font-weight: 600; color: #f0f0f0; border-bottom: 1px solid #222; font-size: 13px; }
  article td { padding: 10px 12px; border-bottom: 1px solid #222; color: #b5b5b5; }
  article tr:last-child td { border-bottom: none; }
  footer { border-top: 1px solid #222; padding: 32px 0; color: #555; font-size: 13px; text-align: center; }
  .posts-grid { display: grid; grid-template-columns: 1fr; gap: 16px; padding: 40px 0 80px; }
  .post-card { display: block; background: #141414; border: 1px solid #222; border-radius: 12px; padding: 28px; color: #f0f0f0; transition: all 0.15s; }
  .post-card:hover { border-color: #f97316; transform: translateY(-1px); text-decoration: none; }
  .post-card .date { font-size: 12px; color: #555; text-transform: uppercase; letter-spacing: 0.08em; }
  .post-card h2 { font-size: 22px; margin: 8px 0; letter-spacing: -0.3px; color: #f0f0f0; }
  .post-card p { color: #888; font-size: 14px; }
  .post-card .tags { display: flex; gap: 6px; margin-top: 12px; flex-wrap: wrap; }
  .post-card .tags span { background: #0a0a0a; border: 1px solid #222; padding: 2px 8px; border-radius: 4px; font-size: 11px; color: #888; }
  @media (min-width: 900px) { .posts-grid { grid-template-columns: 1fr 1fr; } }
</style>`;

const NAV = `<nav>
  <div class="wrap-wide">
    <a href="/" class="logo">Ship<span>Page</span></a>
    <div class="nav-links">
      <a href="/">Home</a>
      <a href="/blog">Blog</a>
      <a href="/templates">Templates</a>
      <a href="/showcase">Showcase</a>
    </div>
  </div>
</nav>`;

function plausibleTag(domain?: string): string {
  return domain
    ? `<script defer data-domain="${domain}" src="https://plausible.io/js/script.outbound-links.js"></script>`
    : '';
}

function renderIndex(siteUrl: string, plausibleDomain?: string): string {
  const cards = posts
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((p) => `
      <a class="post-card" href="/blog/${p.slug}">
        <div class="date">${p.publishedAt} · ${p.readingTime} min read</div>
        <h2>${escapeHtml(p.title)}</h2>
        <p>${escapeHtml(p.description)}</p>
        <div class="tags">${p.tags.map((t) => `<span>${escapeHtml(t)}</span>`).join('')}</div>
      </a>`).join('');

  const jsonLd = {
    '@context': 'https://schema.org',
    '@type': 'Blog',
    name: 'ShipPage Blog',
    description: 'Guides, comparisons, and technical deep-dives on publishing HTML from AI agents.',
    url: `${siteUrl}/blog`,
    blogPost: posts.map((p) => ({
      '@type': 'BlogPosting',
      headline: p.title,
      description: p.description,
      datePublished: p.publishedAt,
      url: `${siteUrl}/blog/${p.slug}`,
      author: { '@type': 'Organization', name: p.author },
    })),
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Blog — ShipPage</title>
  <meta name="description" content="Guides, comparisons, and technical deep-dives on publishing HTML from AI agents via ShipPage.">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${siteUrl}/blog">
  <meta property="og:title" content="ShipPage Blog">
  <meta property="og:description" content="Guides on publishing HTML from AI agents.">
  <meta property="og:url" content="${siteUrl}/blog">
  <meta property="og:image" content="${siteUrl}/og.svg">
  <meta name="twitter:card" content="summary_large_image">
  <link rel="alternate" type="application/rss+xml" title="ShipPage Blog" href="${siteUrl}/blog/rss.xml">
  ${plausibleTag(plausibleDomain)}
  <script type="application/ld+json">${JSON.stringify(jsonLd)}</script>
  ${BLOG_CSS}
</head>
<body>
  ${NAV}
  <header class="post"><div class="wrap">
    <h1>Blog</h1>
    <p class="desc">Guides, comparisons, and technical deep-dives on publishing HTML from AI agents.</p>
  </div></header>
  <main><div class="wrap">
    <div class="posts-grid">${cards}</div>
  </div></main>
  <footer><div class="wrap-wide"><a href="/">← back to ShipPage</a> · <a href="/blog/rss.xml">RSS</a></div></footer>
</body>
</html>`;
}

function renderPost(post: BlogPost, siteUrl: string, plausibleDomain?: string): string {
  const url = `${siteUrl}/blog/${post.slug}`;

  const jsonLdArticle = {
    '@context': 'https://schema.org',
    '@type': 'BlogPosting',
    headline: post.title,
    description: post.description,
    datePublished: post.publishedAt,
    dateModified: post.updatedAt || post.publishedAt,
    url,
    mainEntityOfPage: url,
    keywords: post.tags.join(', '),
    author: { '@type': 'Organization', name: post.author, url: siteUrl },
    publisher: { '@type': 'Organization', name: 'ShipPage', url: siteUrl, logo: { '@type': 'ImageObject', url: `${siteUrl}/og.svg` } },
    image: `${siteUrl}/og.svg`,
  };

  const jsonLdBreadcrumb = {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: [
      { '@type': 'ListItem', position: 1, name: 'Home', item: siteUrl },
      { '@type': 'ListItem', position: 2, name: 'Blog', item: `${siteUrl}/blog` },
      { '@type': 'ListItem', position: 3, name: post.title, item: url },
    ],
  };

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(post.title)} — ShipPage Blog</title>
  <meta name="description" content="${escapeHtml(post.description)}">
  <meta name="robots" content="index,follow">
  <link rel="canonical" href="${url}">
  <meta property="og:type" content="article">
  <meta property="og:title" content="${escapeHtml(post.title)}">
  <meta property="og:description" content="${escapeHtml(post.description)}">
  <meta property="og:url" content="${url}">
  <meta property="og:image" content="${siteUrl}/og.svg">
  <meta property="article:published_time" content="${post.publishedAt}">
  <meta property="article:author" content="${escapeHtml(post.author)}">
  ${post.tags.map((t) => `<meta property="article:tag" content="${escapeHtml(t)}">`).join('\n  ')}
  <meta name="twitter:card" content="summary_large_image">
  <meta name="twitter:title" content="${escapeHtml(post.title)}">
  <meta name="twitter:description" content="${escapeHtml(post.description)}">
  <meta name="twitter:image" content="${siteUrl}/og.svg">
  ${plausibleTag(plausibleDomain)}
  <script type="application/ld+json">${JSON.stringify(jsonLdArticle)}</script>
  <script type="application/ld+json">${JSON.stringify(jsonLdBreadcrumb)}</script>
  ${BLOG_CSS}
</head>
<body>
  ${NAV}
  <header class="post"><div class="wrap">
    <div class="meta">
      <span>${post.publishedAt}</span>
      <span>${post.readingTime} min read</span>
      ${post.tags.map((t) => `<span class="tag">${escapeHtml(t)}</span>`).join('')}
    </div>
    <h1>${escapeHtml(post.title)}</h1>
    <p class="desc">${escapeHtml(post.description)}</p>
  </div></header>
  <article><div class="wrap">${post.html}</div></article>
  <footer><div class="wrap-wide"><a href="/blog">← all posts</a> · <a href="/">home</a></div></footer>
</body>
</html>`;
}

function renderRss(siteUrl: string): string {
  const items = posts
    .sort((a, b) => b.publishedAt.localeCompare(a.publishedAt))
    .map((p) => `  <item>
    <title>${escapeHtml(p.title)}</title>
    <link>${siteUrl}/blog/${p.slug}</link>
    <guid>${siteUrl}/blog/${p.slug}</guid>
    <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
    <description>${escapeHtml(p.description)}</description>
  </item>`).join('\n');

  return `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0">
<channel>
  <title>ShipPage Blog</title>
  <link>${siteUrl}/blog</link>
  <description>Guides, comparisons, and technical deep-dives on publishing HTML from AI agents.</description>
  <language>en</language>
${items}
</channel>
</rss>`;
}

blog.get('/blog', (c) => c.html(renderIndex(c.env.SITE_URL, c.env.PLAUSIBLE_DOMAIN)));

blog.get('/blog/rss.xml', (c) => {
  return new Response(renderRss(c.env.SITE_URL), {
    headers: { 'Content-Type': 'application/rss+xml; charset=utf-8', 'Cache-Control': 'public, max-age=3600' },
  });
});

blog.get('/blog/:slug', (c) => {
  const slug = c.req.param('slug')!;
  const post = findPost(slug);
  if (!post) return c.html('<h1>404 — post not found</h1>', 404);
  return c.html(renderPost(post, c.env.SITE_URL, c.env.PLAUSIBLE_DOMAIN));
});

export default blog;
