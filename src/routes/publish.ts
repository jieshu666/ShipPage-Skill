import { Hono } from 'hono';
import { autoRegister, incrementUsage } from '../auth/auto-register';
import { generateSlug } from '../utils/id';
import { injectWatermark } from '../utils/watermark';
import { authMiddleware } from '../auth/verify';
import type { AppBindings } from '../types';

const publish = new Hono<AppBindings>();

publish.post('/v1/publish', authMiddleware(false), async (c) => {
  const body = await c.req.json();
  const { html, slug: customSlug, password, expires_in, title } = body;

  if (!html || typeof html !== 'string') {
    return c.json({ ok: false, error: 'html field is required' }, 400);
  }

  // 检查文件大小（免费用户 500KB）
  if (new Blob([html]).size > 500 * 1024) {
    return c.json({ ok: false, error: 'HTML exceeds 500KB limit' }, 413);
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

  // 生成 slug
  const slug = customSlug || generateSlug();

  // 检查 slug 是否已存在
  const existing = await c.env.META.get(`page:${slug}`);
  if (existing && !customSlug) {
    return c.json({ ok: false, error: 'Slug collision, please retry' }, 409);
  }
  if (existing && customSlug) {
    const existingPage = JSON.parse(existing);
    if (existingPage.agent_id !== agent.agent_id) {
      return c.json({ ok: false, error: 'Slug already taken' }, 409);
    }
  }

  // 计算过期时间
  const ttl = expires_in || 14 * 24 * 60 * 60; // 默认 14 天
  const expires_at = new Date(Date.now() + ttl * 1000).toISOString();

  // 注入水印（免费用户）
  const finalHtml = injectWatermark(html, c.env.SITE_URL);

  // 注入 noindex meta tag
  const htmlWithMeta = finalHtml.replace(
    /<head>/i,
    '<head><meta name="robots" content="noindex,nofollow">'
  );

  // 存储 HTML 到 R2
  await c.env.PAGES_BUCKET.put(`pages/${slug}.html`, htmlWithMeta, {
    customMetadata: { agent_id: agent.agent_id, expires_at },
  });

  // 存储元数据到 KV
  const pageMeta = {
    slug,
    agent_id: agent.agent_id,
    title: title || slug,
    created_at: new Date().toISOString(),
    expires_at,
    password_protected: !!password,
    password_hash: password ? await hashPassword(password) : null,
    views: 0,
  };
  await c.env.META.put(`page:${slug}`, JSON.stringify(pageMeta));

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
