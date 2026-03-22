import { Hono } from 'hono';
import { cors } from 'hono/cors';
import publish from './routes/publish';
import pages from './routes/pages';
import serve from './routes/serve';
import { handleCron } from './cron/cleanup';
import type { AppBindings } from './types';

const app = new Hono<AppBindings>();

// CORS
app.use('*', cors({
  origin: '*',
  allowMethods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowHeaders: ['Content-Type', 'Authorization'],
}));

// API 路由
app.route('/', publish);
app.route('/', pages);
app.route('/', serve);

// 落地页
app.get('/', async (c) => {
  return c.html(`<!DOCTYPE html>
<html><head><title>ShipPage - HTML in. URL out.</title></head>
<body style="background:#0a0a0a;color:#fff;font-family:sans-serif;display:flex;align-items:center;justify-content:center;min-height:100vh;margin:0;">
<div style="text-align:center;">
<h1 style="font-size:48px;">ShipPage</h1>
<p style="color:#888;font-size:20px;">HTML in. URL out. Zero config.</p>
<p style="color:#666;font-size:14px;margin-top:24px;">Coming soon. Install the OpenClaw skill: <code>clawhub install shippage</code></p>
</div>
</body></html>`);
});

// Health check
app.get('/health', (c) => c.json({ ok: true, service: 'shippage' }));

// 404
app.notFound((c) => c.json({ ok: false, error: 'Not found' }, 404));

// Export
export default {
  fetch: app.fetch,
  scheduled: async (event: any, env: any, ctx: any) => {
    ctx.waitUntil(handleCron(env));
  },
};
