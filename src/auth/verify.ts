import { Context, Next } from 'hono';
import { getAgentByKey } from './auto-register';
import type { AppBindings } from '../types';

// 中间件：验证 API Key（可选的——没有 Key 也放行，由 publish 路由处理自动注册）
export function authMiddleware(required: boolean = true) {
  return async (c: Context<AppBindings>, next: Next) => {
    const authHeader = c.req.header('Authorization');

    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      if (required) {
        return c.json({ ok: false, error: 'Missing Authorization header' }, 401);
      }
      // 不 required 时，标记为未认证，继续
      c.set('agent', null);
      return next();
    }

    const api_key = authHeader.replace('Bearer ', '');
    const agent = await getAgentByKey(c.env.META, api_key);

    if (!agent) {
      return c.json({ ok: false, error: 'Invalid API key' }, 401);
    }

    c.set('agent', agent);
    return next();
  };
}
