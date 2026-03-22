// 飞书多维表格 API 封装

const FEISHU_BASE = 'https://open.feishu.cn/open-apis';

// 获取 tenant_access_token（缓存到 KV，2h TTL）
export async function getFeishuToken(
  meta: KVNamespace,
  appId: string,
  appSecret: string
): Promise<string> {
  // 先检查缓存
  const cached = await meta.get('feishu:token');
  if (cached) return cached;

  const res = await fetch(`${FEISHU_BASE}/auth/v3/tenant_access_token/internal`, {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify({ app_id: appId, app_secret: appSecret }),
  });

  const data: any = await res.json();
  if (data.code !== 0) {
    throw new Error(`Feishu auth failed: ${data.msg}`);
  }

  const token = data.tenant_access_token;
  // 缓存 1.5 小时（token 有效期 2 小时）
  await meta.put('feishu:token', token, { expirationTtl: 5400 });
  return token;
}

// 向多维表格添加一条记录
export async function addRecord(
  token: string,
  appToken: string,
  tableId: string,
  fields: Record<string, any>
): Promise<any> {
  const res = await fetch(
    `${FEISHU_BASE}/bitable/v1/apps/${appToken}/tables/${tableId}/records`,
    {
      method: 'POST',
      headers: {
        'Authorization': `Bearer ${token}`,
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ fields }),
    }
  );
  return res.json();
}

// 批量添加记录（最多 500 条/次）
export async function batchAddRecords(
  token: string,
  appToken: string,
  tableId: string,
  records: Array<{ fields: Record<string, any> }>
): Promise<any> {
  // 飞书批量接口限制 500 条
  const chunks: typeof records[] = [];
  for (let i = 0; i < records.length; i += 500) {
    chunks.push(records.slice(i, i + 500));
  }

  const results = [];
  for (const chunk of chunks) {
    const res = await fetch(
      `${FEISHU_BASE}/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_create`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: chunk }),
      }
    );
    results.push(await res.json());
  }
  return results;
}

// 删除表中所有记录（用于全量同步前清表）
export async function clearTable(
  token: string,
  appToken: string,
  tableId: string
): Promise<void> {
  // 先列出所有 record_id
  let pageToken: string | undefined;
  const allIds: string[] = [];

  do {
    const url = new URL(`${FEISHU_BASE}/bitable/v1/apps/${appToken}/tables/${tableId}/records`);
    url.searchParams.set('page_size', '500');
    if (pageToken) url.searchParams.set('page_token', pageToken);

    const res = await fetch(url.toString(), {
      headers: { 'Authorization': `Bearer ${token}` },
    });
    const data: any = await res.json();
    if (data.data?.items) {
      for (const item of data.data.items) {
        allIds.push(item.record_id);
      }
    }
    pageToken = data.data?.has_more ? data.data.page_token : undefined;
  } while (pageToken);

  // 批量删除（每次 500）
  for (let i = 0; i < allIds.length; i += 500) {
    const batch = allIds.slice(i, i + 500);
    await fetch(
      `${FEISHU_BASE}/bitable/v1/apps/${appToken}/tables/${tableId}/records/batch_delete`,
      {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${token}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ records: batch }),
      }
    );
  }
}

// 便捷方法：推送 waitlist 邮箱到飞书
export async function pushWaitlistToFeishu(
  env: { META: KVNamespace; FEISHU_APP_ID: string; FEISHU_APP_SECRET: string; FEISHU_APP_TOKEN: string; FEISHU_TABLE_WAITLIST: string },
  email: string,
  ip: string
): Promise<void> {
  try {
    const token = await getFeishuToken(env.META, env.FEISHU_APP_ID, env.FEISHU_APP_SECRET);
    await addRecord(token, env.FEISHU_APP_TOKEN, env.FEISHU_TABLE_WAITLIST, {
      email,
      source: 'website',
      created_at: Date.now(),
      ip,
    });
  } catch (e) {
    console.error('Failed to push waitlist to Feishu:', e);
  }
}
