import { Hono } from 'hono';
import { cors } from 'hono/cors';
import publish from './routes/publish';
import pages from './routes/pages';
import serve from './routes/serve';
import waitlist from './routes/waitlist';
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

// API 路由
app.route('/', publish);
app.route('/', pages);
app.route('/', serve);
app.route('/', waitlist);

// 落地页
app.get('/', (c) => {
  const lang = c.req.query('lang') === 'zh' ? 'zh' : 'en';
  return c.html(generateLandingPage(lang));
});

// Health check
app.get('/health', (c) => c.json({ ok: true, service: 'shippage' }));

// 404
app.notFound((c) => c.json({ ok: false, error: 'Not found' }, 404));

// Export
export default {
  fetch: app.fetch,
  scheduled: async (event: any, env: any, ctx: any) => {
    const { syncToFeishu } = await import('./cron/sync-feishu');
    ctx.waitUntil(handleCron(env));
    ctx.waitUntil(syncToFeishu(env));
  },
};
