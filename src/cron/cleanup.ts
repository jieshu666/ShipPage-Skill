export async function handleCron(env: any) {
  // 列出所有 page: 开头的 KV keys
  const list = await env.META.list({ prefix: 'page:' });

  const now = new Date();
  let cleaned = 0;

  for (const key of list.keys) {
    const metaStr = await env.META.get(key.name);
    if (!metaStr) continue;

    const meta = JSON.parse(metaStr);
    if (now > new Date(meta.expires_at)) {
      // 删除 R2 文件
      await env.PAGES_BUCKET.delete(`pages/${meta.slug}.html`);
      // 删除 KV 元数据
      await env.META.delete(key.name);
      // 从 agent 的页面列表中移除
      const agentPages = JSON.parse(await env.META.get(`pages:${meta.agent_id}`) || '[]');
      const updated = agentPages.filter((s: string) => s !== meta.slug);
      await env.META.put(`pages:${meta.agent_id}`, JSON.stringify(updated));
      cleaned++;
    }
  }

  console.log(`Cron cleanup: removed ${cleaned} expired pages`);
}
