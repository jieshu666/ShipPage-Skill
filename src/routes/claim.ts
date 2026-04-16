import { Hono } from 'hono';
import type { AppBindings, AgentRecord, UserRecord } from '../types';

const claim = new Hono<AppBindings>();

// 辅助：通过 claim code 获取 agent 信息
async function getAgentByClaimCode(env: any, code: string) {
  const agentId = await env.META.get(`claim:${code}`);
  if (!agentId) return null;
  const apiKey = await env.META.get(`agent:${agentId}`);
  if (!apiKey) return null;
  const agentStr = await env.META.get(`key:${apiKey}`);
  if (!agentStr) return null;
  return { agentId, apiKey, agent: JSON.parse(agentStr) as AgentRecord };
}

// GET /claim/:code — 管理页面
claim.get('/claim/:code', async (c) => {
  const code = c.req.param('code');
  const result = await getAgentByClaimCode(c.env, code);

  if (!result) {
    return c.html(renderClaimPage(c.env.SITE_URL, code, null, 'Invalid or expired claim code. Claim codes expire after 30 days. Your AI agent can generate a new one by publishing again.', null, 'error'));
  }

  const { agentId, agent } = result;
  const user: UserRecord | null = c.get('user') || null;
  const linkError = c.req.query('link_error') || '';

  // 判断场景
  if (agent.owner_google_id) {
    // Agent 已关联人类账号
    if (!user) {
      // 场景 B：未登录
      return c.html(renderClaimPage(c.env.SITE_URL, code, null, null, null, 'login_required'));
    }
    if (user.google_id !== agent.owner_google_id) {
      // 场景 D：登录了但不是 owner
      return c.html(renderClaimPage(c.env.SITE_URL, code, null, null, null, 'wrong_user'));
    }
    // 场景 C：登录且匹配 — 继续加载页面
  }
  // else: 场景 A：未关联 — 显示关联提示 + 正常管理

  const slugs: string[] = JSON.parse(await c.env.META.get(`pages:${agentId}`) || '[]');
  const pages = [];

  for (const slug of slugs) {
    const metaStr = await c.env.META.get(`page:${slug}`);
    if (metaStr) {
      const meta = JSON.parse(metaStr);
      const pwd = meta.password_protected ? await c.env.META.get(`pwd:${slug}`) : null;
      pages.push({
        slug: meta.slug,
        title: meta.title || meta.slug,
        url: `${c.env.SITE_URL}/p/${meta.slug}`,
        created_at: meta.created_at,
        expires_at: meta.expires_at,
        views: meta.views || 0,
        password_protected: meta.password_protected,
        password: pwd,
      });
    }
  }

  const mode = agent.owner_google_id ? 'logged_in' : 'link_prompt';

  return c.html(renderClaimPage(c.env.SITE_URL, code, {
    agent_id: agent.agent_id,
    display_name: agent.display_name || null,
    claimed: agent.claimed,
    created_at: agent.created_at,
    usage: agent.usage_this_month,
    pages,
  }, linkError || null, user, mode));
});

// POST /claim/:code/delete — 删除页面
claim.post('/claim/:code/delete', async (c) => {
  const code = c.req.param('code');
  const result = await getAgentByClaimCode(c.env, code);
  if (!result) return c.json({ ok: false, error: 'Invalid claim code' }, 403);

  // 如果 agent 已关联，需要验证登录用户
  const agent = result.agent as AgentRecord;
  if (agent.owner_google_id) {
    const user: UserRecord | null = c.get('user') || null;
    if (!user || user.google_id !== agent.owner_google_id) {
      return c.json({ ok: false, error: 'Unauthorized' }, 403);
    }
  }

  const body = await c.req.json();
  const slug = body.slug;
  if (!slug) return c.json({ ok: false, error: 'slug is required' }, 400);

  const metaStr = await c.env.META.get(`page:${slug}`);
  if (!metaStr) return c.json({ ok: false, error: 'Page not found' }, 404);

  const meta = JSON.parse(metaStr);
  if (meta.agent_id !== result.agentId) {
    return c.json({ ok: false, error: 'Not your page' }, 403);
  }

  await c.env.PAGES_BUCKET.delete(`pages/${slug}.html`);
  await c.env.META.delete(`page:${slug}`);

  const agentPages: string[] = JSON.parse(await c.env.META.get(`pages:${result.agentId}`) || '[]');
  const updated = agentPages.filter(s => s !== slug);
  await c.env.META.put(`pages:${result.agentId}`, JSON.stringify(updated));

  return c.json({ ok: true, deleted: slug });
});

// POST /claim/:code/password — 设置/取消密码
claim.post('/claim/:code/password', async (c) => {
  const code = c.req.param('code');
  const result = await getAgentByClaimCode(c.env, code);
  if (!result) return c.json({ ok: false, error: 'Invalid claim code' }, 403);

  // 如果 agent 已关联，需要验证登录用户
  const agent = result.agent as AgentRecord;
  if (agent.owner_google_id) {
    const user: UserRecord | null = c.get('user') || null;
    if (!user || user.google_id !== agent.owner_google_id) {
      return c.json({ ok: false, error: 'Unauthorized' }, 403);
    }
  }

  const body = await c.req.json();
  const { slug, action } = body;
  if (!slug) return c.json({ ok: false, error: 'slug is required' }, 400);

  const metaStr = await c.env.META.get(`page:${slug}`);
  if (!metaStr) return c.json({ ok: false, error: 'Page not found' }, 404);

  const meta = JSON.parse(metaStr);
  if (meta.agent_id !== result.agentId) {
    return c.json({ ok: false, error: 'Not your page' }, 403);
  }

  if (action === 'set') {
    const chars = 'abcdefghjkmnpqrstuvwxyz23456789';
    const password = Array.from({ length: 6 }, () => chars[Math.floor(Math.random() * chars.length)]).join('');

    const encoder = new TextEncoder();
    const data = encoder.encode(password);
    const hashBuffer = await crypto.subtle.digest('SHA-256', data);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    meta.password_hash = hashArray.map((b: number) => b.toString(16).padStart(2, '0')).join('');
    meta.password_protected = true;
    await c.env.META.put(`pwd:${slug}`, password);
    await c.env.META.put(`page:${slug}`, JSON.stringify(meta));
    return c.json({ ok: true, slug, password_protected: true, password });
  } else {
    meta.password_hash = null;
    meta.password_protected = false;
    await c.env.META.delete(`pwd:${slug}`);
    await c.env.META.put(`page:${slug}`, JSON.stringify(meta));
    return c.json({ ok: true, slug, password_protected: false });
  }
});

interface PageInfo {
  slug: string; title: string; url: string;
  created_at: string; expires_at: string; views: number; password_protected: boolean;
  password: string | null;
}
interface ClaimData {
  agent_id: string; display_name: string | null; claimed: boolean; created_at: string; usage: number; pages: PageInfo[];
}

type PageMode = 'error' | 'link_prompt' | 'logged_in' | 'login_required' | 'wrong_user';

function renderClaimPage(
  siteUrl: string, claimCode: string, data: ClaimData | null,
  error: string | null, user: UserRecord | null, mode: PageMode,
): string {
  // 场景：错误
  if (mode === 'error') {
    return renderShell(siteUrl, 'Claim Error', null, `
      <div class="error-box">
        <h2>Claim Failed</h2>
        <p>${error}</p>
        <a href="${siteUrl}" class="home-link">&larr; Back to ShipPage</a>
      </div>`);
  }

  // 场景 B：需要登录
  if (mode === 'login_required') {
    return renderShell(siteUrl, 'Login Required', null, `
      <div class="center-card">
        <div style="font-size:48px;margin-bottom:16px;">🔒</div>
        <h2>Login Required</h2>
        <p style="color:#888;font-size:14px;margin-bottom:24px;">This agent is managed by a linked Google account.<br>Please log in to access the management page.</p>
        <a href="/auth/google?redirect=/claim/${claimCode}" class="google-btn">
          <svg width="18" height="18" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.14 24.14 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Log in with Google
        </a>
      </div>`);
  }

  // 场景 D：登录了但不是 owner
  if (mode === 'wrong_user') {
    return renderShell(siteUrl, 'Access Denied', user, `
      <div class="center-card">
        <div style="font-size:48px;margin-bottom:16px;">⛔</div>
        <h2>Access Denied</h2>
        <p style="color:#888;font-size:14px;margin-bottom:24px;">This agent is linked to a different Google account.<br>You don't have permission to manage it.</p>
        <a href="${siteUrl}" class="home-link">&larr; Back to ShipPage</a>
      </div>`);
  }

  // 场景 A 或 C：有数据，渲染管理页面
  const pageRows = data ? data.pages.map(p => {
    const expires = new Date(p.expires_at);
    const isExpired = expires < new Date();
    const pwdDisplay = p.password_protected
      ? `<span style="color:#4ade80;">🔒</span> <code class="pwd-text" style="cursor:pointer;user-select:all;">${p.password || '***'}</code>`
      : '<span style="color:#555;">Off</span>';
    return `<tr data-slug="${p.slug}">
      <td><a href="${p.url}" target="_blank" style="color:#f97316;">${p.title}</a></td>
      <td><code>${p.slug}</code></td>
      <td>${p.views}</td>
      <td class="pwd-cell">${pwdDisplay}</td>
      <td style="color:${isExpired ? '#ef4444' : '#4ade80'};">${isExpired ? 'Expired' : expires.toLocaleDateString()}</td>
      <td class="actions">
        <button class="act-btn pwd-btn" data-slug="${p.slug}" data-has-pwd="${p.password_protected}">${p.password_protected ? 'Remove 🔒' : 'Set 🔒'}</button>
        <button class="act-btn del-btn" data-slug="${p.slug}" data-title="${p.title}">Delete</button>
      </td>
    </tr>`;
  }).join('') : '';

  const displayName = data?.display_name || data?.agent_id || '';
  const linkBanner = mode === 'link_prompt' ? `
    <div class="link-banner">
      <div style="display:flex;align-items:center;gap:12px;flex-wrap:wrap;">
        <div style="flex:1;min-width:200px;">
          <strong style="color:#f97316;">🔗 Secure your agent</strong>
          <p style="color:#a3a3a3;font-size:13px;margin-top:4px;">Link a Google account to protect this agent and manage it from any device.</p>
        </div>
        <a href="/auth/google?redirect=/claim/${claimCode}&link_agent=${data!.agent_id}" class="google-btn" style="flex-shrink:0;">
          <svg width="16" height="16" viewBox="0 0 48 48"><path fill="#EA4335" d="M24 9.5c3.54 0 6.71 1.22 9.21 3.6l6.85-6.85C35.9 2.38 30.47 0 24 0 14.62 0 6.51 5.38 2.56 13.22l7.98 6.19C12.43 13.72 17.74 9.5 24 9.5z"/><path fill="#4285F4" d="M46.98 24.55c0-1.57-.15-3.09-.38-4.55H24v9.02h12.94c-.58 2.96-2.26 5.48-4.78 7.18l7.73 6c4.51-4.18 7.09-10.36 7.09-17.65z"/><path fill="#FBBC05" d="M10.53 28.59a14.5 14.5 0 0 1 0-9.18l-7.98-6.19a24.14 24.14 0 0 0 0 21.56l7.98-6.19z"/><path fill="#34A853" d="M24 48c6.48 0 11.93-2.13 15.89-5.81l-7.73-6c-2.15 1.45-4.92 2.3-8.16 2.3-6.26 0-11.57-4.22-13.47-9.91l-7.98 6.19C6.51 42.62 14.62 48 24 48z"/></svg>
          Link Google Account
        </a>
      </div>
    </div>` : '';

  const errorBanner = error ? `
    <div style="background:#1c1917;border:1px solid #78350f;border-radius:8px;padding:12px 16px;margin-bottom:16px;color:#f97316;font-size:13px;">
      ${error}
    </div>` : '';

  const content = `
    <h1>Your Published Pages</h1>
    <p class="sub">Agent: <code>${displayName}</code> &middot; Created ${new Date(data!.created_at).toLocaleDateString()}</p>

    ${errorBanner}
    ${linkBanner}

    <div class="stat-row">
      <div class="stat"><div class="stat-label">Pages</div><div class="stat-value" id="page-count">${data!.pages.length}</div></div>
      <div class="stat"><div class="stat-label">Publishes This Month</div><div class="stat-value">${data!.usage} / 20</div></div>
      <div class="stat"><div class="stat-label">Total Views</div><div class="stat-value">${data!.pages.reduce((s, p) => s + p.views, 0)}</div></div>
    </div>

    ${data!.pages.length > 0 ? `
    <div class="card" style="padding:16px;">
      <table>
        <thead><tr><th>Title</th><th>Slug</th><th>Views</th><th>Password</th><th>Expires</th><th>Actions</th></tr></thead>
        <tbody>${pageRows}</tbody>
      </table>
    </div>
    ` : `
    <div class="card" style="text-align:center;color:#888;">
      <p>No pages published yet.</p>
    </div>
    `}

    <a href="${siteUrl}" class="home-link">&larr; Back to ShipPage</a>`;

  return renderShell(siteUrl, 'Manage Pages', user, content, claimCode);
}

function renderShell(siteUrl: string, title: string, user: UserRecord | null, body: string, claimCode?: string): string {
  const userDropdown = user ? `
    <div class="user-menu" id="user-menu">
      <button class="user-btn" id="user-btn">
        <img src="${user.picture}" alt="" class="avatar" referrerpolicy="no-referrer">
        <span class="user-name">${user.name}</span>
        <svg width="12" height="12" viewBox="0 0 12 12" fill="#888"><path d="M2.5 4.5l3.5 3.5 3.5-3.5"/></svg>
      </button>
      <div class="dropdown" id="dropdown">
        <div class="dd-header">
          <img src="${user.picture}" alt="" class="avatar-lg" referrerpolicy="no-referrer">
          <div>
            <div style="font-weight:600;">${user.name}</div>
            <div style="color:#888;font-size:12px;">${user.email}</div>
          </div>
        </div>
        <div class="dd-sep"></div>
        <a href="/account" class="dd-item">My Agents</a>
        <a href="/auth/logout?redirect=${claimCode ? '/claim/' + claimCode : '/'}" class="dd-item" style="color:#ef4444;">Logout</a>
      </div>
    </div>` : '';

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>${title} - ShipPage</title>
  <meta name="robots" content="noindex,nofollow">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { min-height: 100vh; background: #0a0a0a; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; }
    .wrap { max-width: 800px; margin: 0 auto; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 24px; }
    a { color: #f97316; text-decoration: none; } a:hover { text-decoration: underline; }
    h1 { font-size: 28px; margin-bottom: 8px; }
    .sub { color: #888; font-size: 14px; margin-bottom: 32px; }
    .card { background: #141414; border: 1px solid #222; border-radius: 12px; padding: 24px; margin-bottom: 24px; }
    .stat-row { display: flex; gap: 16px; flex-wrap: wrap; margin-bottom: 24px; }
    .stat { background: #141414; border: 1px solid #222; border-radius: 10px; padding: 16px 20px; flex: 1; min-width: 120px; }
    .stat-label { font-size: 12px; color: #888; margin-bottom: 4px; }
    .stat-value { font-size: 20px; font-weight: 700; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 10px 8px; border-bottom: 1px solid #333; color: #888; font-weight: 600; font-size: 12px; }
    td { padding: 10px 8px; border-bottom: 1px solid #1a1a1a; vertical-align: middle; }
    code { background: #1a1a2e; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .actions { white-space: nowrap; }
    .act-btn { background: transparent; border: 1px solid #333; color: #888; padding: 4px 10px; border-radius: 4px; font-size: 11px; cursor: pointer; font-family: inherit; margin-left: 4px; }
    .act-btn:hover { border-color: #888; color: #f0f0f0; }
    .del-btn:hover { border-color: #ef4444; color: #ef4444; }
    .pwd-btn:hover { border-color: #f97316; color: #f97316; }
    .error-box { background: #1c1917; border: 1px solid #78350f; border-radius: 12px; padding: 32px; text-align: center; }
    .error-box h2 { color: #f97316; margin-bottom: 12px; }
    .error-box p { color: #888; font-size: 14px; line-height: 1.6; }
    .home-link { display: inline-block; margin-top: 24px; color: #888; font-size: 13px; }
    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #141414; border: 1px solid #333; color: #f0f0f0; padding: 10px 24px; border-radius: 8px; font-size: 13px; display: none; z-index: 999; }
    .toast.show { display: block; }
    .toast.err { border-color: #ef4444; color: #ef4444; }
    .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 900; align-items: center; justify-content: center; }
    .modal-overlay.show { display: flex; }
    .modal { background: #141414; border: 1px solid #333; border-radius: 12px; padding: 24px; width: 90%; max-width: 380px; }
    .modal h3 { font-size: 16px; margin-bottom: 12px; }
    .modal-btns { display: flex; gap: 8px; justify-content: flex-end; }
    .modal-btns button { padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; font-family: inherit; font-weight: 600; }
    .modal-btns .cancel { background: transparent; border: 1px solid #333; color: #888; }
    .modal-btns .danger { background: #ef4444; color: #fff; }
    /* Link banner */
    .link-banner { background: #1a1710; border: 1px solid #78350f; border-radius: 10px; padding: 16px 20px; margin-bottom: 24px; }
    /* Google button */
    .google-btn { display: inline-flex; align-items: center; gap: 8px; background: #fff; color: #333; padding: 10px 20px; border-radius: 8px; font-size: 14px; font-weight: 600; text-decoration: none !important; transition: box-shadow .15s; }
    .google-btn:hover { box-shadow: 0 2px 8px rgba(249,115,22,0.3); }
    /* Center card */
    .center-card { background: #141414; border: 1px solid #222; border-radius: 12px; padding: 48px 32px; text-align: center; max-width: 420px; margin: 60px auto; }
    .center-card h2 { margin-bottom: 8px; }
    /* User menu */
    .user-menu { position: relative; }
    .user-btn { display: flex; align-items: center; gap: 8px; background: transparent; border: 1px solid #333; color: #f0f0f0; padding: 6px 12px 6px 6px; border-radius: 8px; cursor: pointer; font-family: inherit; font-size: 13px; }
    .user-btn:hover { border-color: #555; }
    .avatar { width: 28px; height: 28px; border-radius: 50%; }
    .avatar-lg { width: 40px; height: 40px; border-radius: 50%; }
    .user-name { max-width: 120px; overflow: hidden; text-overflow: ellipsis; white-space: nowrap; }
    .dropdown { display: none; position: absolute; right: 0; top: calc(100% + 6px); background: #141414; border: 1px solid #333; border-radius: 10px; width: 260px; z-index: 100; overflow: hidden; }
    .dropdown.show { display: block; }
    .dd-header { display: flex; align-items: center; gap: 10px; padding: 14px 16px; }
    .dd-sep { border-top: 1px solid #222; }
    .dd-item { display: block; padding: 10px 16px; color: #f0f0f0; font-size: 13px; text-decoration: none !important; }
    .dd-item:hover { background: #1a1a1a; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top-bar">
      <a href="${siteUrl}" style="font-size:18px;font-weight:700;color:#f0f0f0;">Ship<span style="color:#f97316;">Page</span></a>
      ${userDropdown}
    </div>
    ${body}
  </div>

  <div class="toast" id="toast"></div>

  <!-- Delete Confirm Modal -->
  <div class="modal-overlay" id="del-modal">
    <div class="modal">
      <h3>Delete Page</h3>
      <p style="color:#888;font-size:14px;margin-bottom:16px;" id="del-msg">Are you sure?</p>
      <div class="modal-btns">
        <button class="cancel" onclick="closeDelModal()">Cancel</button>
        <button class="danger" id="del-confirm">Delete</button>
      </div>
    </div>
  </div>

  <script>
    var CLAIM = '${claimCode || ''}';
    var toast = document.getElementById('toast');

    function showToast(msg, isErr) {
      if (!toast) return;
      toast.textContent = msg;
      toast.className = 'toast show' + (isErr ? ' err' : '');
      setTimeout(function() { toast.className = 'toast'; }, 3000);
    }

    // === User dropdown ===
    var userBtn = document.getElementById('user-btn');
    var dropdown = document.getElementById('dropdown');
    if (userBtn && dropdown) {
      userBtn.addEventListener('click', function(e) {
        e.stopPropagation();
        dropdown.classList.toggle('show');
      });
      document.addEventListener('click', function() {
        dropdown.classList.remove('show');
      });
    }

    // === Delete ===
    var delSlug = '';
    function closeDelModal() { document.getElementById('del-modal').classList.remove('show'); }

    document.querySelectorAll('.del-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        delSlug = btn.dataset.slug;
        document.getElementById('del-msg').textContent = 'Delete "' + btn.dataset.title + '"? This cannot be undone.';
        document.getElementById('del-modal').classList.add('show');
      });
    });

    var delConfirm = document.getElementById('del-confirm');
    if (delConfirm) {
      delConfirm.addEventListener('click', async function() {
        closeDelModal();
        try {
          var res = await fetch('/claim/' + CLAIM + '/delete', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: delSlug })
          });
          var data = await res.json();
          if (data.ok) {
            var row = document.querySelector('tr[data-slug="' + delSlug + '"]');
            if (row) row.remove();
            var cnt = document.getElementById('page-count');
            if (cnt) cnt.textContent = String(parseInt(cnt.textContent) - 1);
            showToast('Deleted: ' + delSlug, false);
          } else {
            showToast('Error: ' + data.error, true);
          }
        } catch (e) {
          showToast('Network error', true);
        }
      });
    }

    // === Password ===
    document.querySelectorAll('.pwd-btn').forEach(function(btn) {
      btn.addEventListener('click', async function() {
        var slug = btn.dataset.slug;
        var hasPwd = btn.dataset.hasPwd === 'true';
        var action = hasPwd ? 'remove' : 'set';
        btn.disabled = true;
        btn.textContent = '...';
        try {
          var res = await fetch('/claim/' + CLAIM + '/password', {
            method: 'POST',
            headers: { 'Content-Type': 'application/json' },
            body: JSON.stringify({ slug: slug, action: action })
          });
          var data = await res.json();
          if (data.ok) {
            var row = document.querySelector('tr[data-slug="' + slug + '"]');
            var cell = row.querySelector('.pwd-cell');
            if (data.password_protected) {
              cell.innerHTML = '<span style="color:#4ade80;">\\u{1F512}</span> <code class="pwd-text" style="cursor:pointer;user-select:all;">' + data.password + '</code>';
              btn.textContent = 'Remove \\u{1F512}';
              btn.dataset.hasPwd = 'true';
              showToast('Password: ' + data.password, false);
            } else {
              cell.innerHTML = '<span style="color:#555;">Off</span>';
              btn.textContent = 'Set \\u{1F512}';
              btn.dataset.hasPwd = 'false';
              showToast('Password removed', false);
            }
          } else {
            showToast('Error: ' + data.error, true);
            btn.textContent = hasPwd ? 'Remove \\u{1F512}' : 'Set \\u{1F512}';
          }
        } catch (e) {
          showToast('Network error', true);
          btn.textContent = hasPwd ? 'Remove \\u{1F512}' : 'Set \\u{1F512}';
        }
        btn.disabled = false;
      });
    });
  </script>
</body>
</html>`;
}

export default claim;
