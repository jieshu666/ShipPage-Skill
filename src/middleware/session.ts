import { getCookie } from 'hono/cookie';
import { verifySessionToken, SESSION_COOKIE_NAME } from '../auth/session';
import type { AppBindings, UserRecord } from '../types';
import type { Context, Next } from 'hono';

export function sessionMiddleware() {
  return async (c: Context<AppBindings>, next: Next) => {
    const token = getCookie(c, SESSION_COOKIE_NAME);
    if (token) {
      const googleId = await verifySessionToken(token, c.env.SESSION_SECRET);
      if (googleId) {
        const userStr = await c.env.META.get(`user:${googleId}`);
        if (userStr) {
          c.set('user', JSON.parse(userStr) as UserRecord);
          return next();
        }
      }
    }
    c.set('user', null);
    return next();
  };
}
