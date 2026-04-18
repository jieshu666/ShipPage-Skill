export interface InjectOptions {
  siteUrl: string;
  slug: string;
  isPublic?: boolean;
  title?: string;
}

export function injectWatermark(html: string, siteUrlOrOpts: string | InjectOptions, legacySlug?: string): string {
  const opts: InjectOptions = typeof siteUrlOrOpts === 'string'
    ? { siteUrl: siteUrlOrOpts, slug: legacySlug || '', isPublic: false }
    : siteUrlOrOpts;

  const { siteUrl, slug, isPublic = false, title } = opts;
  const pageUrl = slug ? `${siteUrl}/p/${slug}` : siteUrl;

  const robots = isPublic ? 'index,follow' : 'noindex,nofollow';
  const webPageJsonLd = isPublic ? `
<script type="application/ld+json">${JSON.stringify({
    '@context': 'https://schema.org',
    '@type': 'WebPage',
    name: title || 'ShipPage published page',
    url: pageUrl,
    isPartOf: { '@type': 'WebSite', name: 'ShipPage', url: siteUrl },
    publisher: { '@type': 'Organization', name: 'ShipPage', url: siteUrl },
  })}</script>` : '';

  const headInjection = `<meta name="robots" content="${robots}"><meta name="generator" content="ShipPage"><link rel="canonical" href="${pageUrl}">${webPageJsonLd}`;

  const footerBadge = `
<div style="text-align:center;padding:12px 0 8px;font-family:-apple-system,sans-serif;font-size:11px;color:#999;border-top:1px solid #eee;margin-top:40px;">
  <a href="${siteUrl}?ref=badge" target="_blank" rel="noopener" style="color:#999;text-decoration:none;">Made with <strong style="color:#f97316;">ShipPage</strong> · HTML in. URL out.</a>
</div>`;

  let result = html;

  if (/<head[^>]*>/i.test(result)) {
    result = result.replace(/<head[^>]*>/i, (m) => `${m}${headInjection}`);
  } else if (/<html[^>]*>/i.test(result)) {
    result = result.replace(/<html[^>]*>/i, (m) => `${m}<head>${headInjection}</head>`);
  } else {
    result = `<head>${headInjection}</head>${result}`;
  }

  if (result.includes('</body>')) {
    result = result.replace('</body>', `${footerBadge}</body>`);
  } else {
    result = result + footerBadge;
  }

  return result;
}
