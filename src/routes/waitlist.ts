import { Hono } from 'hono';
import { pushWaitlistToFeishu } from '../utils/feishu';
import type { AppBindings } from '../types';

const waitlist = new Hono<AppBindings>();

waitlist.post('/v1/waitlist', async (c) => {
  // 支持 JSON 和 form 两种提交方式
  let email: string;
  const contentType = c.req.header('Content-Type') || '';

  if (contentType.includes('application/json')) {
    const body = await c.req.json();
    email = body.email;
  } else {
    const body = await c.req.parseBody();
    email = body.email as string;
  }

  if (!email || typeof email !== 'string') {
    return c.json({ ok: false, error: 'Email is required' }, 400);
  }

  // 简单邮箱格式验证
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  if (!emailRegex.test(email)) {
    return c.json({ ok: false, error: 'Invalid email format' }, 400);
  }

  const ip = c.req.header('CF-Connecting-IP') || 'unknown';

  // IP 防刷：每小时最多 5 次
  const ipKey = `ip_waitlist:${ip}`;
  const ipCount = parseInt(await c.env.META.get(ipKey) || '0');
  if (ipCount >= 5) {
    return c.json({ ok: false, error: 'Too many requests, try again later' }, 429);
  }

  // 去重
  const existingKey = `waitlist:${email.toLowerCase()}`;
  const existing = await c.env.META.get(existingKey);
  if (existing) {
    return c.json({ ok: true, message: "You're already on the list!" });
  }

  // 写入 KV
  const record = {
    email: email.toLowerCase(),
    created_at: new Date().toISOString(),
    ip,
    source: 'website',
  };
  await c.env.META.put(existingKey, JSON.stringify(record));

  // 更新 IP 计数
  await c.env.META.put(ipKey, String(ipCount + 1), { expirationTtl: 3600 });

  // 异步推飞书（不阻塞响应）
  c.executionCtx.waitUntil(
    pushWaitlistToFeishu(c.env, email.toLowerCase(), ip)
  );

  return c.json({ ok: true, message: "You're on the list!" });
});

export default waitlist;
