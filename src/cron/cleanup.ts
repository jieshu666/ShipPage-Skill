import { listAllKeys, readPageMetas } from '../utils/kv';

export async function handleCron(env: any) {
  const now = new Date();
  let cleaned = 0;

  // Read expiry from KV list metadata so scanning the whole keyspace costs
  // ~O(pages/1000) subrequests instead of one get() per page.
  const keys = await listAllKeys(env.META, 'page:', 10000);
  const metas = await readPageMetas(env.META, keys, 900);

  // Group deletions by agent so we only rewrite each pages:<agent> list once,
  // instead of a racy read-modify-write per deleted page.
  const expired: { key: string; slug: string; agent_id: string }[] = [];
  for (const meta of metas) {
    if (meta.expires_at && now > new Date(meta.expires_at)) {
      expired.push({ key: `page:${meta.slug}`, slug: meta.slug, agent_id: meta.agent_id || '' });
    }
  }

  for (const e of expired) {
    await env.PAGES_BUCKET.delete(`pages/${e.slug}.html`);
    await env.META.delete(e.key);
    cleaned++;
  }

  // Prune each affected agent's page list once.
  const bySlug = new Set(expired.map((e) => e.slug));
  const agents = [...new Set(expired.map((e) => e.agent_id).filter(Boolean))];
  for (const agentId of agents) {
    const listKey = `pages:${agentId}`;
    const agentPages: string[] = JSON.parse((await env.META.get(listKey)) || '[]');
    const kept = agentPages.filter((s) => !bySlug.has(s));
    if (kept.length !== agentPages.length) {
      await env.META.put(listKey, JSON.stringify(kept));
    }
  }

  console.log(`Cron cleanup: removed ${cleaned} expired pages across ${agents.length} agents`);
}
