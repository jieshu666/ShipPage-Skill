import { Hono } from 'hono';
import { generatePasswordPage } from '../utils/password';
import type { AppBindings } from '../types';

const serve = new Hono<AppBindings>();

// 访问已发布的页面
serve.get('/p/:slug', async (c) => {
  const slug = c.req.param('slug');

  // 读取元数据
  const metaStr = await c.env.META.get(`page:${slug}`);
  if (!metaStr) {
    return c.html('<h1>404 - Page not found</h1>', 404);
  }

  const meta = JSON.parse(metaStr);

  // 检查过期
  if (new Date() > new Date(meta.expires_at)) {
    await c.env.PAGES_BUCKET.delete(`pages/${slug}.html`);
    await c.env.META.delete(`page:${slug}`);
    return c.html('<h1>410 - This page has expired</h1><p>The author\'s free tier pages expire after 14 days.</p>', 410);
  }

  // 检查密码保护
  if (meta.password_protected) {
    const cookie = c.req.header('Cookie') || '';
    const hasAccess = cookie.includes(`sp_${slug}=authorized`);

    if (!hasAccess) {
      return c.html(generatePasswordPage(slug, c.env.SITE_URL));
    }
  }

  // 读取 HTML
  const obj = await c.env.PAGES_BUCKET.get(`pages/${slug}.html`);
  if (!obj) {
    return c.html('<h1>404 - Page not found</h1>', 404);
  }

  // 增加浏览计数
  meta.views = (meta.views || 0) + 1;
  await c.env.META.put(`page:${slug}`, JSON.stringify(meta));

  const html = await obj.text();
  return c.html(html);
});

// 密码验证
serve.post('/p/:slug/verify', async (c) => {
  const slug = c.req.param('slug');
  const body = await c.req.parseBody();
  const password = body.password as string;

  const metaStr = await c.env.META.get(`page:${slug}`);
  if (!metaStr) return c.json({ ok: false }, 404);

  const meta = JSON.parse(metaStr);
  const inputHash = await hashPassword(password);

  if (inputHash !== meta.password_hash) {
    return c.html(generatePasswordPage(slug, c.env.SITE_URL, 'Incorrect password'), 401);
  }

  // 设置 cookie，24小时有效
  return new Response(null, {
    status: 302,
    headers: {
      'Location': `/p/${slug}`,
      'Set-Cookie': `sp_${slug}=authorized; Path=/; Max-Age=86400; HttpOnly; Secure; SameSite=Lax`,
    },
  });
});

async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default serve;
