import { generateAgentId, generateApiKey, generateClaimCode } from '../utils/id';

interface AgentRecord {
  agent_id: string;
  api_key: string;
  claim_code: string;
  claimed: boolean;
  github_user: string | null;
  created_at: string;
  usage_this_month: number;
  usage_reset_at: string;
}

const FREE_LIMIT = 20;

export async function autoRegister(meta: KVNamespace, ip: string): Promise<AgentRecord> {
  // 防滥用：检查同 IP 注册频率
  const ipKey = `ip_reg:${ip}`;
  const ipCount = parseInt(await meta.get(ipKey) || '0');
  if (ipCount >= 3) {
    throw new Error('Rate limit: max 3 registrations per IP per hour');
  }

  const agent_id = generateAgentId();
  const api_key = generateApiKey();
  const claim_code = generateClaimCode();

  // 计算本月重置时间（下月1号 00:00 UTC）
  const now = new Date();
  const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);

  const record: AgentRecord = {
    agent_id,
    api_key,
    claim_code,
    claimed: false,
    github_user: null,
    created_at: now.toISOString(),
    usage_this_month: 0,
    usage_reset_at: resetDate.toISOString(),
  };

  // 存储：api_key → agent record（用于鉴权查询）
  await meta.put(`key:${api_key}`, JSON.stringify(record));
  // 存储：agent_id → api_key（用于反向查询）
  await meta.put(`agent:${agent_id}`, api_key);
  // 存储：claim_code → agent_id（用于认领）
  await meta.put(`claim:${claim_code}`, agent_id, { expirationTtl: 86400 * 30 }); // 30天过期

  // 更新 IP 注册计数
  await meta.put(ipKey, String(ipCount + 1), { expirationTtl: 3600 }); // 1小时过期

  return record;
}

export async function getAgentByKey(meta: KVNamespace, api_key: string): Promise<AgentRecord | null> {
  const data = await meta.get(`key:${api_key}`);
  if (!data) return null;
  return JSON.parse(data);
}

export async function incrementUsage(meta: KVNamespace, record: AgentRecord): Promise<{ allowed: boolean; record: AgentRecord }> {
  // 检查是否需要重置月度额度
  const now = new Date();
  if (now >= new Date(record.usage_reset_at)) {
    record.usage_this_month = 0;
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
    record.usage_reset_at = resetDate.toISOString();
  }

  if (record.usage_this_month >= FREE_LIMIT) {
    return { allowed: false, record };
  }

  record.usage_this_month += 1;
  await meta.put(`key:${record.api_key}`, JSON.stringify(record));
  return { allowed: true, record };
}
