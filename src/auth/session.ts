export const SESSION_COOKIE_NAME = 'sp_session';

function base64urlEncode(data: Uint8Array): string {
  const binStr = Array.from(data, (b) => String.fromCharCode(b)).join('');
  return btoa(binStr).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '');
}

function base64urlDecode(str: string): Uint8Array {
  const padded = str.replace(/-/g, '+').replace(/_/g, '/');
  const binStr = atob(padded);
  return Uint8Array.from(binStr, (c) => c.charCodeAt(0));
}

async function getKey(secret: string): Promise<CryptoKey> {
  return crypto.subtle.importKey(
    'raw',
    new TextEncoder().encode(secret),
    { name: 'HMAC', hash: 'SHA-256' },
    false,
    ['sign', 'verify'],
  );
}

export async function createSessionToken(googleId: string, secret: string): Promise<string> {
  const header = base64urlEncode(new TextEncoder().encode(JSON.stringify({ alg: 'HS256', typ: 'JWT' })));
  const now = Math.floor(Date.now() / 1000);
  const payload = base64urlEncode(
    new TextEncoder().encode(JSON.stringify({ sub: googleId, iat: now, exp: now + 7 * 86400 })),
  );
  const signingInput = `${header}.${payload}`;
  const key = await getKey(secret);
  const sig = new Uint8Array(await crypto.subtle.sign('HMAC', key, new TextEncoder().encode(signingInput)));
  return `${signingInput}.${base64urlEncode(sig)}`;
}

export async function verifySessionToken(token: string, secret: string): Promise<string | null> {
  try {
    const parts = token.split('.');
    if (parts.length !== 3) return null;
    const [header, payload, signature] = parts;
    const key = await getKey(secret);
    const valid = await crypto.subtle.verify(
      'HMAC',
      key,
      base64urlDecode(signature),
      new TextEncoder().encode(`${header}.${payload}`),
    );
    if (!valid) return null;
    const data = JSON.parse(new TextDecoder().decode(base64urlDecode(payload)));
    if (data.exp && data.exp < Math.floor(Date.now() / 1000)) return null;
    return data.sub || null;
  } catch {
    return null;
  }
}

export async function setSessionCookie(googleId: string, secret: string): Promise<string> {
  const token = await createSessionToken(googleId, secret);
  return `${SESSION_COOKIE_NAME}=${token}; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=604800`;
}

export function clearSessionCookie(): string {
  return `${SESSION_COOKIE_NAME}=; HttpOnly; Secure; SameSite=Lax; Path=/; Max-Age=0`;
}
