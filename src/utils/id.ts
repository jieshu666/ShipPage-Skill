import { nanoid } from 'nanoid';

// Agent ID: ag_ + 12位随机字符
export function generateAgentId(): string {
  return `ag_${nanoid(12)}`;
}

// API Key: sk_ + 24位随机字符
export function generateApiKey(): string {
  return `sk_${nanoid(24)}`;
}

// Claim Code: 4位大写字母-4位大写字母（如 REEF-4X7K）
export function generateClaimCode(): string {
  const chars = 'ABCDEFGHJKLMNPQRSTUVWXYZ23456789'; // 去掉容易混淆的 I/O/0/1
  const part = (len: number) => Array.from({ length: len }, () => chars[Math.floor(Math.random() * chars.length)]).join('');
  return `${part(4)}-${part(4)}`;
}

// Page slug: 6位小写字母数字
export function generateSlug(): string {
  return nanoid(6).toLowerCase();
}
