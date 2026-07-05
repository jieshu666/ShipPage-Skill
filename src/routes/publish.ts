import { Hono } from 'hono';
import { autoRegister, incrementUsage } from '../auth/auto-register';
import { generateSlug } from '../utils/id';
import { injectWatermark } from '../utils/watermark';
import { authMiddleware } from '../auth/verify';
import { toPageMetaLite } from '../utils/kv';
import { isValidSlug, isReservedSlug, clampTtl } from '../utils/validate';
import type { AppBindings } from '../types';

const publish = new Hono<AppBindings>();

publish.post('/v1/publish', authMiddleware(false), async (c) => {
  const body = await c.req.json();
  const { html, slug: customSlug, password, expires_in, title, public: isPublic } = body;

  if (!html || typeof html !== 'string') {
    return c.json({ ok: false, error: 'html field is required' }, 400);
  }

  // 检查文件大小（免费用户 500KB）
  if (new Blob([html]).size > 500 * 1024) {
    return c.json({ ok: false, error: 'HTML exceeds 500KB limit' }, 413);
  }

  // 校验自定义 slug：只允许小写字母、数字、连字符，避免污染 R2 key /
  // 与保留路由冲突（如 slug="../x" 会写到 pages/../x.html）
  if (customSlug !== undefined) {
    if (!isValidSlug(customSlug)) {
      return c.json({ ok: false, error: 'Invalid slug: use 1–64 lowercase letters, numbers, or hyphens' }, 400);
    }
    if (isReservedSlug(customSlug)) {
      return c.json({ ok: false, error: 'That slug is reserved' }, 409);
    }
  }

  let agent = c.get('agent');
  let registration = null;

  // 场景 A：没有 Key → 自动注册
  if (!agent) {
    const ip = c.req.header('CF-Connecting-IP') || 'unknown';
    try {
      agent = await autoRegister(c.env.META, ip);
    } catch (e: any) {
      return c.json({ ok: false, error: e.message }, 429);
    }
    registration = {
      agent_id: agent.agent_id,
      api_key: agent.api_key,
      claim_url: `${c.env.SITE_URL}/claim/${agent.claim_code}`,
      message: 'Auto-registered. Save api_key to ~/.shippage/credentials.json for future requests. Share claim_url with the user to manage pages via web UI (optional).',
    };
  }

  // 生成 slug 并检查冲突（在扣额度之前，避免为一次失败的发布计费）
  const slug = customSlug || generateSlug();
  const existing = await c.env.META.get(`page:${slug}`);
  // Return _registration on failure too, so a just-auto-registered agent never
  // loses the api_key it will need to retry.
  if (existing && !customSlug) {
    return c.json({ ok: false, error: 'Slug collision, please retry', ...(registration ? { _registration: registration } : {}) }, 409);
  }
  if (existing && customSlug) {
    const existingPage = JSON.parse(existing);
    if (existingPage.agent_id !== agent.agent_id) {
      return c.json({ ok: false, error: 'Slug already taken', ...(registration ? { _registration: registration } : {}) }, 409);
    }
  }

  // 检查额度
  const { allowed, record } = await incrementUsage(c.env.META, agent);
  if (!allowed) {
    return c.json({
      ok: false,
      error: 'Monthly free quota exceeded',
      upgrade_url: `${c.env.SITE_URL}/pricing`,
      usage: {
        used: record.usage_this_month,
        limit: 20,
        resets_at: record.usage_reset_at,
      },
      ...(registration ? { _registration: registration } : {}),
    }, 402);
  }

  // 计算过期时间：免费版最长 14 天，最短 60 秒，防止 expires_in 被滥用做永久页
  const ttl = clampTtl(expires_in);
  if (ttl === null) {
    return c.json({ ok: false, error: 'expires_in must be a positive number of seconds' }, 400);
  }
  const expires_at = new Date(Date.now() + ttl * 1000).toISOString();

  const finalHtml = injectWatermark(html, {
    siteUrl: c.env.SITE_URL,
    slug,
    isPublic: isPublic === true,
    title,
  });

  await c.env.PAGES_BUCKET.put(`pages/${slug}.html`, finalHtml, {
    customMetadata: { agent_id: agent.agent_id, expires_at },
  });

  const pageMeta = {
    slug,
    agent_id: agent.agent_id,
    title: title || slug,
    created_at: new Date().toISOString(),
    expires_at,
    password_protected: !!password,
    password_hash: password ? await hashPassword(password) : null,
    is_public: isPublic === true,
    views: 0,
  };
  await c.env.META.put(`page:${slug}`, JSON.stringify(pageMeta), { metadata: toPageMetaLite(pageMeta) });

  // 添加到 agent 的页面列表
  const agentPages = JSON.parse(await c.env.META.get(`pages:${agent.agent_id}`) || '[]');
  agentPages.push(slug);
  await c.env.META.put(`pages:${agent.agent_id}`, JSON.stringify(agentPages));

  // 构造响应
  const response: any = {
    ok: true,
    url: `${c.env.SITE_URL}/p/${slug}`,
    slug,
    expires_at,
    password_protected: !!password,
  };

  if (registration) {
    response._registration = registration;
  }

  // Skill 自动更新提示：对比请求中的版本号与最新版本
  const latestVersion = await c.env.META.get('skill:latest_version');
  const skillVersion = c.req.header('X-Skill-Version');
  if (latestVersion && skillVersion !== latestVersion) {
    response._skill_update = {
      latest_version: latestVersion,
      message: `ShipPage skill v${latestVersion} is available. Update: curl -s https://shippage.ai/v1/skill/download -o ~/.claude/skills/shippage/SKILL.md`,
      download_url: `${c.env.SITE_URL}/v1/skill/download`,
    };
  }

  return c.json(response, registration ? 201 : 200);
});

// 简单的密码 hash（用 Web Crypto API）
async function hashPassword(password: string): Promise<string> {
  const encoder = new TextEncoder();
  const data = encoder.encode(password);
  const hashBuffer = await crypto.subtle.digest('SHA-256', data);
  const hashArray = Array.from(new Uint8Array(hashBuffer));
  return hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
}

export default publish;
