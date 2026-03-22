import { getFeishuToken, addRecord, batchAddRecords, clearTable } from '../utils/feishu';

export async function syncToFeishu(env: any): Promise<void> {
  try {
    const token = await getFeishuToken(env.META, env.FEISHU_APP_ID, env.FEISHU_APP_SECRET);
    const appToken = env.FEISHU_APP_TOKEN;

    // === 同步 Agents 数据 ===
    await clearTable(token, appToken, env.FEISHU_TABLE_AGENTS);

    const agentRecords: Array<{ fields: Record<string, any> }> = [];
    const keyList = await env.META.list({ prefix: 'key:' });
    let totalPublishes = 0;

    for (const key of keyList.keys) {
      const data = await env.META.get(key.name);
      if (!data) continue;

      const agent = JSON.parse(data);
      const pagesStr = await env.META.get(`pages:${agent.agent_id}`);
      const pages = pagesStr ? JSON.parse(pagesStr) : [];
      totalPublishes += agent.usage_this_month;

      agentRecords.push({
        fields: {
          agent_id: agent.agent_id,
          created_at: new Date(agent.created_at).getTime(),
          usage_this_month: agent.usage_this_month,
          claimed: agent.claimed,
          total_pages: pages.length,
        },
      });
    }

    if (agentRecords.length > 0) {
      await batchAddRecords(token, appToken, env.FEISHU_TABLE_AGENTS, agentRecords);
    }

    // === 同步 Pages 数据 ===
    await clearTable(token, appToken, env.FEISHU_TABLE_PAGES);

    const pageRecords: Array<{ fields: Record<string, any> }> = [];
    const pageList = await env.META.list({ prefix: 'page:' });
    let totalStorageMb = 0;
    let totalViews = 0;

    // 统计今天新增的 agent 和 page
    const today = new Date();
    today.setUTCHours(0, 0, 0, 0);
    const todayTs = today.getTime();
    let newAgents = 0;
    let newPages = 0;

    for (const ar of agentRecords) {
      if (ar.fields.created_at >= todayTs) newAgents++;
    }

    for (const key of pageList.keys) {
      const data = await env.META.get(key.name);
      if (!data) continue;

      const page = JSON.parse(data);

      let sizeKb = 0;
      try {
        const obj = await env.PAGES_BUCKET.head(`pages/${page.slug}.html`);
        if (obj) {
          sizeKb = Math.round((obj.size || 0) / 1024 * 10) / 10;
          totalStorageMb += (obj.size || 0) / (1024 * 1024);
        }
      } catch (e) { /* skip */ }

      totalViews += page.views || 0;
      if (new Date(page.created_at).getTime() >= todayTs) newPages++;

      pageRecords.push({
        fields: {
          slug: page.slug,
          agent_id: page.agent_id,
          title: page.title || page.slug,
          size_kb: sizeKb,
          views: page.views || 0,
          created_at: new Date(page.created_at).getTime(),
          expires_at: new Date(page.expires_at).getTime(),
          password_protected: page.password_protected || false,
        },
      });
    }

    if (pageRecords.length > 0) {
      await batchAddRecords(token, appToken, env.FEISHU_TABLE_PAGES, pageRecords);
    }

    // === 统计 Waitlist 数量 ===
    const waitlistList = await env.META.list({ prefix: 'waitlist:' });
    const waitlistCount = waitlistList.keys.length;

    // === 计算成本并写入 DailyCost 表 ===
    totalStorageMb = Math.round(totalStorageMb * 100) / 100;

    // Cloudflare 定价计算（超出免费额度部分）
    // R2 Storage: 10GB free, $0.015/GB/月
    const r2StorageCost = Math.max(0, totalStorageMb / 1024 - 10) * 0.015;

    // R2 Class A (写): 1M free, $4.50/M — 估算：每日 publish 数 ≈ 写操作
    // R2 Class B (读): 10M free, $0.36/M — 估算：每日 views ≈ 读操作
    const r2ClassAOps = totalPublishes; // 近似
    const r2ClassBOps = totalViews;     // 近似
    const r2OpsCost =
      Math.max(0, (r2ClassAOps - 1000000) / 1000000) * 4.50 +
      Math.max(0, (r2ClassBOps - 10000000) / 1000000) * 0.36;

    // KV: 读 10M free, 写 1M free — 每次 publish 约 4 KV 写 + 每次 view 约 2 KV 读
    const kvWrites = totalPublishes * 4;
    const kvReads = totalViews * 2 + agentRecords.length;

    // Worker requests: 10M/月 free
    const workerRequests = totalViews + totalPublishes * 2;

    const totalCost = Math.round((r2StorageCost + r2OpsCost) * 10000) / 10000;

    await addRecord(token, appToken, env.FEISHU_TABLE_DAILY_COST, {
      date: Date.now(),
      total_agents: agentRecords.length,
      new_agents: newAgents,
      total_pages: pageRecords.length,
      new_pages: newPages,
      total_publishes: totalPublishes,
      r2_storage_mb: totalStorageMb,
      r2_class_a_ops: r2ClassAOps,
      r2_class_b_ops: r2ClassBOps,
      kv_reads: kvReads,
      kv_writes: kvWrites,
      worker_requests: workerRequests,
      r2_storage_cost: Math.round(r2StorageCost * 10000) / 10000,
      r2_ops_cost: Math.round(r2OpsCost * 10000) / 10000,
      total_cost_usd: totalCost,
      waitlist_count: waitlistCount,
    });

    console.log(`Feishu sync: ${agentRecords.length} agents, ${pageRecords.length} pages, cost: $${totalCost}`);
  } catch (e) {
    console.error('Feishu sync failed:', e);
  }
}
