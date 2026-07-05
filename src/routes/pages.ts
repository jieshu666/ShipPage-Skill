import { Hono } from 'hono';
import { authMiddleware } from '../auth/verify';
import { toPageMetaLite } from '../utils/kv';
import { clampTtl } from '../utils/validate';
import { sha256Hex } from '../utils/crypto';
import type { AppBindings } from '../types';

const pages = new Hono<AppBindings>();

// 列出我的所有页面
pages.get('/v1/pages', authMiddleware(true), async (c) => {
  const agent = c.get('agent')!;
  const slugs = JSON.parse(await c.env.META.get(`pages:${agent.agent_id}`) || '[]');

  const pageList = [];
  for (const slug of slugs) {
    const metaStr = await c.env.META.get(`page:${slug}`);
    if (metaStr) {
      const meta = JSON.parse(metaStr);
      pageList.push({
        slug: meta.slug,
        url: `${c.env.SITE_URL}/p/${meta.slug}`,
        title: meta.title,
        created_at: meta.created_at,
        expires_at: meta.expires_at,
        password_protected: meta.password_protected,
        views: meta.views || 0,
      });
    }
  }

  return c.json({
    pages: pageList,
    usage: {
      used: agent.usage_this_month,
      limit: 20,
      resets_at: agent.usage_reset_at,
    },
  });
});

// 更新页面
pages.put('/v1/pages/:slug', authMiddleware(true), async (c) => {
  const agent = c.get('agent')!;
  const slug = c.req.param('slug')!;

  const metaStr = await c.env.META.get(`page:${slug}`);
  if (!metaStr) return c.json({ ok: false, error: 'Page not found' }, 404);

  const meta = JSON.parse(metaStr);
  if (meta.agent_id !== agent.agent_id) {
    return c.json({ ok: false, error: 'Not your page' }, 403);
  }

  const body = await c.req.json();

  if (body.public !== undefined) {
    meta.is_public = body.public === true;
  }

  if (body.html) {
    const { injectWatermark } = await import('../utils/watermark');
    const finalHtml = injectWatermark(body.html, {
      siteUrl: c.env.SITE_URL,
      slug,
      isPublic: meta.is_public === true,
      title: body.title || meta.title,
    });
    await c.env.PAGES_BUCKET.put(`pages/${slug}.html`, finalHtml);
  }

  if (body.password !== undefined) {
    if (body.password) {
      meta.password_hash = await sha256Hex(body.password);
      meta.password_protected = true;
    } else {
      meta.password_hash = null;
      meta.password_protected = false;
    }
  }

  if (body.expires_in !== undefined) {
    const ttl = clampTtl(body.expires_in);
    if (ttl === null) {
      return c.json({ ok: false, error: 'expires_in must be a positive number of seconds' }, 400);
    }
    meta.expires_at = new Date(Date.now() + ttl * 1000).toISOString();
  }

  if (body.title) {
    meta.title = body.title;
  }

  await c.env.META.put(`page:${slug}`, JSON.stringify(meta), { metadata: toPageMetaLite(meta) });

  return c.json({
    ok: true,
    url: `${c.env.SITE_URL}/p/${slug}`,
    slug,
    expires_at: meta.expires_at,
    password_protected: meta.password_protected,
  });
});

// 删除页面
pages.delete('/v1/pages/:slug', authMiddleware(true), async (c) => {
  const agent = c.get('agent')!;
  const slug = c.req.param('slug')!;

  const metaStr = await c.env.META.get(`page:${slug}`);
  if (!metaStr) return c.json({ ok: false, error: 'Page not found' }, 404);

  const meta = JSON.parse(metaStr);
  if (meta.agent_id !== agent.agent_id) {
    return c.json({ ok: false, error: 'Not your page' }, 403);
  }

  await c.env.PAGES_BUCKET.delete(`pages/${slug}.html`);
  await c.env.META.delete(`page:${slug}`);

  // 从 agent 的页面列表中移除
  const agentPages = JSON.parse(await c.env.META.get(`pages:${agent.agent_id}`) || '[]');
  const updated = agentPages.filter((s: string) => s !== slug);
  await c.env.META.put(`pages:${agent.agent_id}`, JSON.stringify(updated));

  return c.json({ ok: true, deleted: slug });
});

export default pages;
