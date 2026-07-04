import { Hono } from 'hono';
import { cors } from 'hono/cors';
import publish from './routes/publish';
import pages from './routes/pages';
import serve from './routes/serve';
import waitlist from './routes/waitlist';
import skill from './routes/skill';
import claim from './routes/claim';
import auth from './routes/auth';
import account from './routes/account';
import seo from './routes/seo';
import showcase from './routes/showcase';
import templates from './routes/templates';
import blog from './routes/blog';
import changelog from './routes/changelog';
import docs from './routes/docs';
import pricing from './routes/pricing';
import { sessionMiddleware } from './middleware/session';
import { handleCron } from './cron/cleanup';
import { generateLandingPage } from './landing/page';
import type { AppBindings } from './types';

const app = new Hono<AppBindings>();

// CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// Session middleware
app.use('*', sessionMiddleware());

// API 路由
app.route('/', auth);
app.route('/', account);
app.route('/', publish);
app.route('/', pages);
app.route('/', serve);
app.route('/', waitlist);
app.route('/', skill);
app.route('/', claim);
app.route('/', seo);
app.route('/', showcase);
app.route('/', templates);
app.route('/', blog);
app.route('/', changelog);
app.route('/', docs);
app.route('/', pricing);

// 落地页
app.get('/', (c) => {
  const lang = c.req.query('lang') === 'zh' ? 'zh' : 'en';
  return c.html(generateLandingPage(lang, c.env.PLAUSIBLE_DOMAIN));
});

// Health check
app.get('/health', (c) => c.json({ ok: true, service: 'shippage' }));

// 404 — a branded HTML page for browsers (Accept: text/html), JSON for
// everything else (API clients, curl, scripts — Accept: */* or application/json).
app.notFound((c) => {
  const path = c.req.path;
  const wantsHtml = !path.startsWith('/v1/') && (c.req.header('Accept') || '').includes('text/html');
  if (!wantsHtml) {
    return c.json({ ok: false, error: 'Not found' }, 404);
  }
  const siteUrl = c.env.SITE_URL;
  return c.html(`<!DOCTYPE html>
<html lang="en"><head>
<meta charset="UTF-8"><meta name="viewport" content="width=device-width, initial-scale=1.0">
<title>404 — ShipPage</title><meta name="robots" content="noindex">
<link rel="icon" href="/favicon.svg" type="image/svg+xml">
<style>*{margin:0;padding:0;box-sizing:border-box}body{min-height:100vh;background:#0a0a0a;color:#f0f0f0;font-family:-apple-system,BlinkMacSystemFont,'Segoe UI',sans-serif;display:flex;align-items:center;justify-content:center;padding:24px}.box{max-width:440px;text-align:center}.code{font-family:'SF Mono',Consolas,monospace;font-size:13px;letter-spacing:.2em;color:#f97316;margin-bottom:16px}h1{font-size:26px;font-weight:800;margin-bottom:12px}p{color:#888;font-size:15px;line-height:1.6;margin-bottom:28px}a.cta{display:inline-block;background:#f97316;color:#fff;font-weight:600;font-size:14px;padding:11px 22px;border-radius:8px;text-decoration:none}a.cta:hover{background:#ea6a08}.links{margin-top:18px;font-size:13px}.links a{color:#666;text-decoration:none;margin:0 8px}.links a:hover{color:#999}</style>
</head><body><div class="box">
<div class="code">404 · PAGE NOT FOUND</div>
<h1>Nothing here</h1>
<p>That page doesn't exist. If you were looking for a published page, its link may have expired.</p>
<a class="cta" href="${siteUrl}">Go to ShipPage →</a>
<div class="links"><a href="${siteUrl}/docs">Docs</a><a href="${siteUrl}/templates">Templates</a><a href="${siteUrl}/blog">Blog</a></div>
</div></body></html>`, 404);
});

// Export
export default {
  fetch: app.fetch,
  scheduled: async (event: any, env: any, ctx: any) => {
    const { syncToFeishu } = await import('./cron/sync-feishu');
    ctx.waitUntil(handleCron(env));
    ctx.waitUntil(syncToFeishu(env));
  },
};
