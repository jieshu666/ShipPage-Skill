import { Hono } from 'hono';
import type { AppBindings } from '../types';

const skill = new Hono<AppBindings>();

// 版本检查
skill.get('/v1/skill/version', async (c) => {
  const current = c.req.query('current') || 'unknown';
  const latestVersion = await c.env.META.get('skill:latest_version') || '1.2.0';
  const changelog = await c.env.META.get('skill:changelog') || '';

  return c.json({
    ok: true,
    latest_version: latestVersion,
    current_version: current,
    update_available: current !== latestVersion,
    download_url: `${c.env.SITE_URL}/v1/skill/download`,
    changelog,
  });
});

// 下载最新 SKILL.md
skill.get('/v1/skill/download', async (c) => {
  const content = await c.env.META.get('skill:latest_content');
  if (!content) {
    return c.text('SKILL.md not found', 404);
  }
  return c.text(content, 200, {
    'Content-Type': 'text/markdown; charset=utf-8',
    'Cache-Control': 'public, max-age=300',
  });
});

export default skill;
