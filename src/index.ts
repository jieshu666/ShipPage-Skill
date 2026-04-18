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

// 落地页
app.get('/', (c) => {
  const lang = c.req.query('lang') === 'zh' ? 'zh' : 'en';
  return c.html(generateLandingPage(lang, c.env.PLAUSIBLE_DOMAIN));
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
