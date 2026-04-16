import { Hono } from 'hono';
import type { AppBindings, UserRecord, AgentRecord } from '../types';

const account = new Hono<AppBindings>();

// GET /account — 用户中心
account.get('/account', async (c) => {
  const user: UserRecord | null = c.get('user') || null;
  if (!user) {
    return c.redirect('/auth/google?redirect=/account');
  }

  // 加载所有关联的 agent 信息
  const agents: { agent: AgentRecord; pageCount: number; claimCode: string }[] = [];
  for (const agentId of user.linked_agents) {
    const apiKey = await c.env.META.get(`agent:${agentId}`);
    if (!apiKey) continue;
    const agentStr = await c.env.META.get(`key:${apiKey}`);
    if (!agentStr) continue;
    const agent: AgentRecord = JSON.parse(agentStr);
    const slugs: string[] = JSON.parse(await c.env.META.get(`pages:${agentId}`) || '[]');
    agents.push({ agent, pageCount: slugs.length, claimCode: agent.claim_code });
  }

  return c.html(renderAccountPage(c.env.SITE_URL, user, agents));
});

// POST /account/rename — 重命名 Agent
account.post('/account/rename', async (c) => {
  const user: UserRecord | null = c.get('user') || null;
  if (!user) return c.json({ ok: false, error: 'Not logged in' }, 401);

  const body = await c.req.json();
  const { agent_id, display_name } = body;
  if (!agent_id || typeof display_name !== 'string') {
    return c.json({ ok: false, error: 'agent_id and display_name required' }, 400);
  }

  // 验证用户拥有该 agent
  const owner = await c.env.META.get(`agent_owner:${agent_id}`);
  if (owner !== user.google_id) {
    return c.json({ ok: false, error: 'Not your agent' }, 403);
  }

  const apiKey = await c.env.META.get(`agent:${agent_id}`);
  if (!apiKey) return c.json({ ok: false, error: 'Agent not found' }, 404);

  const agentStr = await c.env.META.get(`key:${apiKey}`);
  if (!agentStr) return c.json({ ok: false, error: 'Agent not found' }, 404);

  const agent: AgentRecord = JSON.parse(agentStr);
  agent.display_name = display_name.trim().slice(0, 50) || null;
  await c.env.META.put(`key:${apiKey}`, JSON.stringify(agent));

  return c.json({ ok: true, display_name: agent.display_name });
});

function renderAccountPage(
  siteUrl: string,
  user: UserRecord,
  agents: { agent: AgentRecord; pageCount: number; claimCode: string }[],
): string {
  const agentRows = agents.map(({ agent, pageCount, claimCode }) => {
    const name = agent.display_name || agent.agent_id;
    return `<tr data-agent-id="${agent.agent_id}">
      <td>
        <span class="agent-name" id="name-${agent.agent_id}">${name}</span>
        <button class="act-btn rename-btn" data-id="${agent.agent_id}" data-name="${name}">Rename</button>
      </td>
      <td><code>${agent.agent_id}</code></td>
      <td>${pageCount}</td>
      <td>${agent.usage_this_month} / 20</td>
      <td><a href="/claim/${claimCode}" style="color:#f97316;">Manage</a></td>
    </tr>`;
  }).join('');

  return `<!DOCTYPE html>
<html lang="en">
<head>
  <meta charset="UTF-8">
  <meta name="viewport" content="width=device-width, initial-scale=1.0">
  <title>My Account - ShipPage</title>
  <meta name="robots" content="noindex,nofollow">
  <style>
    * { margin: 0; padding: 0; box-sizing: border-box; }
    body { min-height: 100vh; background: #0a0a0a; color: #f0f0f0; font-family: -apple-system, BlinkMacSystemFont, sans-serif; padding: 40px 20px; }
    .wrap { max-width: 800px; margin: 0 auto; }
    .top-bar { display: flex; align-items: center; justify-content: space-between; margin-bottom: 32px; }
    a { color: #f97316; text-decoration: none; } a:hover { text-decoration: underline; }
    h1 { font-size: 28px; margin-bottom: 24px; }
    .profile { display: flex; align-items: center; gap: 16px; background: #141414; border: 1px solid #222; border-radius: 12px; padding: 20px; margin-bottom: 32px; }
    .profile img { width: 56px; height: 56px; border-radius: 50%; }
    .profile-info { flex: 1; }
    .profile-name { font-size: 18px; font-weight: 700; }
    .profile-email { color: #888; font-size: 13px; margin-top: 2px; }
    .card { background: #141414; border: 1px solid #222; border-radius: 12px; padding: 16px; margin-bottom: 24px; }
    table { width: 100%; border-collapse: collapse; font-size: 13px; }
    th { text-align: left; padding: 10px 8px; border-bottom: 1px solid #333; color: #888; font-weight: 600; font-size: 12px; }
    td { padding: 10px 8px; border-bottom: 1px solid #1a1a1a; vertical-align: middle; }
    code { background: #1a1a2e; padding: 2px 6px; border-radius: 4px; font-size: 11px; }
    .act-btn { background: transparent; border: 1px solid #333; color: #888; padding: 3px 8px; border-radius: 4px; font-size: 11px; cursor: pointer; font-family: inherit; margin-left: 6px; }
    .act-btn:hover { border-color: #f97316; color: #f97316; }
    .toast { position: fixed; bottom: 24px; left: 50%; transform: translateX(-50%); background: #141414; border: 1px solid #333; color: #f0f0f0; padding: 10px 24px; border-radius: 8px; font-size: 13px; display: none; z-index: 999; }
    .toast.show { display: block; }
    .toast.err { border-color: #ef4444; color: #ef4444; }
    .modal-overlay { display: none; position: fixed; inset: 0; background: rgba(0,0,0,0.7); z-index: 900; align-items: center; justify-content: center; }
    .modal-overlay.show { display: flex; }
    .modal { background: #141414; border: 1px solid #333; border-radius: 12px; padding: 24px; width: 90%; max-width: 380px; }
    .modal h3 { font-size: 16px; margin-bottom: 12px; }
    .modal input { width: 100%; background: #0a0a0a; border: 1px solid #333; color: #f0f0f0; padding: 8px 12px; border-radius: 6px; font-size: 14px; font-family: inherit; margin-bottom: 16px; }
    .modal input:focus { outline: none; border-color: #f97316; }
    .modal-btns { display: flex; gap: 8px; justify-content: flex-end; }
    .modal-btns button { padding: 8px 16px; border-radius: 6px; font-size: 13px; cursor: pointer; border: none; font-family: inherit; font-weight: 600; }
    .modal-btns .cancel { background: transparent; border: 1px solid #333; color: #888; }
    .modal-btns .primary { background: #f97316; color: #fff; }
    .logout-btn { background: transparent; border: 1px solid #333; color: #888; padding: 6px 14px; border-radius: 6px; font-size: 13px; cursor: pointer; font-family: inherit; }
    .logout-btn:hover { border-color: #ef4444; color: #ef4444; }
    .empty { text-align: center; color: #888; padding: 32px; }
  </style>
</head>
<body>
  <div class="wrap">
    <div class="top-bar">
      <a href="${siteUrl}" style="font-size:18px;font-weight:700;color:#f0f0f0;">Ship<span style="color:#f97316;">Page</span></a>
      <a href="/auth/logout?redirect=/" class="logout-btn">Logout</a>
    </div>

    <h1>My Account</h1>

    <div class="profile">
      <img src="${user.picture}" alt="" referrerpolicy="no-referrer">
      <div class="profile-info">
        <div class="profile-name">${user.name}</div>
        <div class="profile-email">${user.email}</div>
      </div>
    </div>

    <h2 style="font-size:20px;margin-bottom:16px;">My Agents</h2>

    ${agents.length > 0 ? `
    <div class="card">
      <table>
        <thead><tr><th>Name</th><th>Agent ID</th><th>Pages</th><th>Usage</th><th></th></tr></thead>
        <tbody>${agentRows}</tbody>
      </table>
    </div>
    ` : `
    <div class="card empty">
      <p>No agents linked yet.</p>
      <p style="font-size:12px;margin-top:8px;">Visit your agent's claim page to link it to your account.</p>
    </div>
    `}
  </div>

  <div class="toast" id="toast"></div>

  <!-- Rename Modal -->
  <div class="modal-overlay" id="rename-modal">
    <div class="modal">
      <h3>Rename Agent</h3>
      <input type="text" id="rename-input" placeholder="Display name..." maxlength="50">
      <div class="modal-btns">
        <button class="cancel" onclick="closeRename()">Cancel</button>
        <button class="primary" id="rename-confirm">Save</button>
      </div>
    </div>
  </div>

  <script>
    var toast = document.getElementById('toast');
    function showToast(msg, isErr) {
      toast.textContent = msg;
      toast.className = 'toast show' + (isErr ? ' err' : '');
      setTimeout(function() { toast.className = 'toast'; }, 3000);
    }

    var renameAgentId = '';
    function closeRename() { document.getElementById('rename-modal').classList.remove('show'); }

    document.querySelectorAll('.rename-btn').forEach(function(btn) {
      btn.addEventListener('click', function() {
        renameAgentId = btn.dataset.id;
        document.getElementById('rename-input').value = btn.dataset.name;
        document.getElementById('rename-modal').classList.add('show');
        document.getElementById('rename-input').focus();
      });
    });

    document.getElementById('rename-confirm').addEventListener('click', async function() {
      var name = document.getElementById('rename-input').value.trim();
      if (!name) return;
      closeRename();
      try {
        var res = await fetch('/account/rename', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify({ agent_id: renameAgentId, display_name: name })
        });
        var data = await res.json();
        if (data.ok) {
          document.getElementById('name-' + renameAgentId).textContent = data.display_name || renameAgentId;
          var btn = document.querySelector('.rename-btn[data-id="' + renameAgentId + '"]');
          if (btn) btn.dataset.name = data.display_name || renameAgentId;
          showToast('Renamed successfully', false);
        } else {
          showToast('Error: ' + data.error, true);
        }
      } catch (e) {
        showToast('Network error', true);
      }
    });
  </script>
</body>
</html>`;
}

export default account;
