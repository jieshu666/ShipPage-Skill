import { Hono } from 'hono';
import { nanoid } from 'nanoid';
import { getGoogleAuthUrl, exchangeCodeForTokens, getGoogleUserInfo } from '../auth/google-oauth';
import { setSessionCookie, clearSessionCookie } from '../auth/session';
import type { AppBindings, UserRecord, AgentRecord } from '../types';

const auth = new Hono<AppBindings>();

// GET /auth/google — 跳转 Google OAuth
auth.get('/auth/google', async (c) => {
  const redirect = c.req.query('redirect') || '/';
  const linkAgent = c.req.query('link_agent') || '';

  const state = nanoid(32);
  const stateData = JSON.stringify({ redirect, link_agent: linkAgent });
  await c.env.META.put(`oauth_state:${state}`, stateData, { expirationTtl: 600 });

  const redirectUri = `${c.env.SITE_URL}/auth/google/callback`;
  const url = getGoogleAuthUrl(c.env.GOOGLE_CLIENT_ID, redirectUri, state);
  return c.redirect(url);
});

// GET /auth/google/callback — Google OAuth 回调
auth.get('/auth/google/callback', async (c) => {
  const code = c.req.query('code');
  const state = c.req.query('state');
  const error = c.req.query('error');

  if (error) {
    return c.html(renderErrorPage(c.env.SITE_URL, `Google login cancelled: ${error}`));
  }
  if (!code || !state) {
    return c.html(renderErrorPage(c.env.SITE_URL, 'Missing code or state parameter'));
  }

  // 验证 state
  const stateDataStr = await c.env.META.get(`oauth_state:${state}`);
  if (!stateDataStr) {
    return c.html(renderErrorPage(c.env.SITE_URL, 'Invalid or expired state. Please try again.'));
  }
  await c.env.META.delete(`oauth_state:${state}`);
  const stateData = JSON.parse(stateDataStr);

  // 交换 token
  const redirectUri = `${c.env.SITE_URL}/auth/google/callback`;
  let tokens;
  try {
    tokens = await exchangeCodeForTokens(code, c.env.GOOGLE_CLIENT_ID, c.env.GOOGLE_CLIENT_SECRET, redirectUri);
  } catch (e: any) {
    return c.html(renderErrorPage(c.env.SITE_URL, `Authentication failed: ${e.message}`));
  }

  // 获取用户信息
  let googleUser;
  try {
    googleUser = await getGoogleUserInfo(tokens.access_token);
  } catch (e: any) {
    return c.html(renderErrorPage(c.env.SITE_URL, `Failed to get user info: ${e.message}`));
  }

  // 创建或更新 UserRecord
  const now = new Date().toISOString();
  const existingUserStr = await c.env.META.get(`user:${googleUser.sub}`);
  let user: UserRecord;
  if (existingUserStr) {
    user = JSON.parse(existingUserStr);
    user.email = googleUser.email;
    user.name = googleUser.name;
    user.picture = googleUser.picture;
    user.last_login = now;
  } else {
    user = {
      google_id: googleUser.sub,
      email: googleUser.email,
      name: googleUser.name,
      picture: googleUser.picture,
      linked_agents: [],
      created_at: now,
      last_login: now,
    };
  }

  // 关联 agent（如果有 link_agent 参数）
  let linkError = '';
  if (stateData.link_agent) {
    const agentId = stateData.link_agent;
    const existingOwner = await c.env.META.get(`agent_owner:${agentId}`);
    if (existingOwner && existingOwner !== googleUser.sub) {
      linkError = 'This agent is already linked to another account.';
    } else if (!existingOwner) {
      // 查找 agent 记录并更新
      const apiKey = await c.env.META.get(`agent:${agentId}`);
      if (apiKey) {
        const agentStr = await c.env.META.get(`key:${apiKey}`);
        if (agentStr) {
          const agent: AgentRecord = JSON.parse(agentStr);
          agent.owner_google_id = googleUser.sub;
          await c.env.META.put(`key:${apiKey}`, JSON.stringify(agent));
          await c.env.META.put(`agent_owner:${agentId}`, googleUser.sub);
          if (!user.linked_agents.includes(agentId)) {
            user.linked_agents.push(agentId);
          }
        }
      }
    }
  }

  // 保存用户
  await c.env.META.put(`user:${googleUser.sub}`, JSON.stringify(user));

  // 设置 session cookie
  const cookie = await setSessionCookie(googleUser.sub, c.env.SESSION_SECRET);
  const redirectTo = linkError
    ? `${stateData.redirect}?link_error=${encodeURIComponent(linkError)}`
    : stateData.redirect || '/';

  return new Response(null, {
    status: 302,
    headers: {
      Location: redirectTo,
      'Set-Cookie': cookie,
    },
  });
});

// GET /auth/logout — 退出登录
auth.get('/auth/logout', (c) => {
  const redirect = c.req.query('redirect') || '/';
  return new Response(null, {
    status: 302,
    headers: {
      Location: redirect,
      'Set-Cookie': clearSessionCookie(),
    },
  });
});

function renderErrorPage(siteUrl: string, message: string): string {
  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>Login Error - ShipPage</title>
  <meta name="robots" content="noindex,nofollow">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { min-height: 100vh; background: #0a0a0a; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; display: flex; align-items: center; justify-content: center; }
    .box { background: #141414; border: 1px solid #78350f; border-radius: 12px; padding: 40px; text-align: center; max-width: 420px; }
    h2 { color: #f97316; margin-bottom: 12px; }
    p { color: #888; font-size: 14px; line-height: 1.6; margin-bottom: 20px; }
    a { color: #f97316; text-decoration: none; font-size: 13px; }
    a:hover { text-decoration: underline; }
  </style>
</head>
<body>
  <div class="box">
    <h2>Login Error</h2>
    <p>${message}</p>
    <a href="${siteUrl}">&larr; Back to ShipPage</a>
  </div>
</body>
</html>`;
}

export default auth;
