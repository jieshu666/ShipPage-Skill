import { Hono } from 'hono';
import { getCookie } from 'hono/cookie';
import { generatePasswordPage } from '../utils/password';
import { signValue, verifyValue } from '../auth/session';
import { escapeHtml } from '../utils/escape';
import { sha256Hex } from '../utils/crypto';
import type { AppBindings } from '../types';

const serve = new Hono<AppBindings>();

// User-published pages contain arbitrary, fully attacker-controllable HTML/JS.
// Serving them from the app origin (which also hosts /account, /claim) means a
// malicious page's script could make same-origin credentialed requests and ride
// a logged-in user's session. The CSP `sandbox` directive WITHOUT
// `allow-same-origin` forces each page into a unique opaque origin, so its
// scripts still run but can never reach the app's cookies or authed endpoints.
// (The full fix is a separate content domain; this header is the interim guard.)
const USERCONTENT_HEADERS = {
  'Content-Security-Policy':
    'sandbox allow-scripts allow-popups allow-forms allow-modals allow-downloads allow-presentation allow-popups-to-escape-sandbox allow-top-navigation-by-user-activation;',
  'X-Content-Type-Options': 'nosniff',
  'Referrer-Policy': 'no-referrer',
};

function pwToken(slug: string) {
  return `pwgrant:${slug}`;
}

// 访问已发布的页面
serve.get('/p/:slug', async (c) => {
  const slug = c.req.param('slug');

  // 读取元数据
  const metaStr = await c.env.META.get(`page:${slug}`);
  if (!metaStr) {
    return c.html(tombstone(c.env.SITE_URL, '404', 'Page not found', "This link doesn't point to a published page."), 404);
  }

  const meta = JSON.parse(metaStr);

  // 检查过期
  if (new Date() > new Date(meta.expires_at)) {
    await c.env.PAGES_BUCKET.delete(`pages/${slug}.html`);
    await c.env.META.delete(`page:${slug}`);
    return c.html(
      tombstone(
        c.env.SITE_URL,
        'Expired',
        'This page has expired',
        'Free-tier pages are kept for 14 days. The author can re-publish it in one API call.',
      ),
      410,
    );
  }

  // 检查密码保护（签名 cookie，绑定 slug + SESSION_SECRET，无法伪造）
  if (meta.password_protected) {
    const sig = getCookie(c, `sp_${slug}`) || '';
    const hasAccess = sig ? await verifyValue(pwToken(slug), sig, c.env.SESSION_SECRET) : false;
    if (!hasAccess) {
      return c.html(generatePasswordPage(slug, c.env.SITE_URL));
    }
  }

  // 读取 HTML
  const obj = await c.env.PAGES_BUCKET.get(`pages/${slug}.html`);
  if (!obj) {
    return c.html(tombstone(c.env.SITE_URL, '404', 'Page not found', "This link doesn't point to a published page."), 404);
  }

  // 增加浏览计数（fire-and-forget，不阻塞响应）
  meta.views = (meta.views || 0) + 1;
  c.executionCtx.waitUntil(c.env.META.put(`page:${slug}`, JSON.stringify(meta)));

  const html = await obj.text();
  return c.html(html, 200, USERCONTENT_HEADERS);
});

// 密码验证
serve.post('/p/:slug/verify', async (c) => {
  const slug = c.req.param('slug');
  const body = await c.req.parseBody();
  const password = (body.password as string) || '';

  const metaStr = await c.env.META.get(`page:${slug}`);
  if (!metaStr) return c.json({ ok: false }, 404);

  const meta = JSON.parse(metaStr);
  const inputHash = await sha256Hex(password);

  if (!meta.password_hash || !timingSafeEqual(inputHash, meta.password_hash)) {
    return c.html(generatePasswordPage(slug, c.env.SITE_URL, 'Incorrect password'), 401);
  }

  // 签发绑定该 slug 的 HMAC 授权 cookie，24 小时有效
  const sig = await signValue(pwToken(slug), c.env.SESSION_SECRET);
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `/p/${slug}`,
      'Set-Cookie': `sp_${slug}=${sig}; Path=/p/${slug}; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`,
    },
  });
});

// Constant-time comparison of two equal-length hex strings.
function timingSafeEqual(a: string, b: string): boolean {
  if (a.length !== b.length) return false;
  let diff = 0;
  for (let i = 0; i < a.length; i++) diff |= a.charCodeAt(i) ^ b.charCodeAt(i);
  return diff === 0;
}

// Branded HTML page for 404 / 410 / expired states, with a re-publish CTA so a
// dead link becomes an acquisition surface instead of a bare error string.
function tombstone(siteUrl: string, code: string, heading: string, detail: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${escapeHtml(heading)} — ShipPage</title>
  <meta name="robots" content="noindex,nofollow">
  <link rel="icon" href="/favicon.svg" type="image/svg+xml">
  <style>
    *{margin:0;padding:0;box-sizing:border-box}
    body{min-height:100vh;background:#0a0a0a;color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;padding:24px}
    .box{max-width:440px;text-align:center}
    .code{font-family:'SF Mono',Consolas,monospace;font-size:13px;letter-spacing:.2em;text-transform:uppercase;color:#f97316;margin-bottom:16px}
    h1{font-size:26px;font-weight:800;margin-bottom:12px}
    p{color:#888;font-size:15px;line-height:1.6;margin-bottom:28px}
    .cta{display:inline-block;background:#f97316;color:#fff;font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px;text-decoration:none}
    .cta:hover{background:#ea6a08}
    .alt{display:block;margin-top:16px;color:#666;font-size:13px;text-decoration:none}
    .alt:hover{color:#999}
  </style>
</head>
<body>
  <div class="box">
    <div class="code">${escapeHtml(code)}</div>
    <h1>${escapeHtml(heading)}</h1>
    <p>${escapeHtml(detail)}</p>
    <a class="cta" href="${siteUrl}">Publish your own page →</a>
    <a class="alt" href="${siteUrl}/templates">Browse templates</a>
  </div>
</body>
</html>`;
}

export default serve;
