import { cookies } from 'next/headers';
import crypto from 'crypto';
import { getDB } from './db';

const SESSION_COOKIE = 'fca_admin_token';
const SESSION_SECRET = process.env.ADMIN_SESSION_SECRET || 'fca-academy-super-secure-session-key-2026';

export interface AdminUser {
  id: number;
  email: string;
  name: string;
  role: string;
}

export function hashPassword(password: string): string {
  return crypto.createHash('sha256').update(password).digest('hex');
}

export function signToken(payload: object): string {
  const data = Buffer.from(JSON.stringify(payload)).toString('base64url');
  const signature = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
  return `${data}.${signature}`;
}

export function verifyToken(token: string): any | null {
  try {
    const [data, signature] = token.split('.');
    if (!data || !signature) return null;
    const expectedSig = crypto.createHmac('sha256', SESSION_SECRET).update(data).digest('base64url');
    if (signature !== expectedSig) return null;
    const json = Buffer.from(data, 'base64url').toString('utf8');
    return JSON.parse(json);
  } catch {
    return null;
  }
}

export async function getCurrentAdmin(): Promise<AdminUser | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const payload = verifyToken(token);
  if (!payload || !payload.email) return null;

  try {
    const db = await getDB();
    const res = await db.query<AdminUser>('SELECT id, email, name, role FROM admin_users WHERE email = $1 LIMIT 1', [payload.email]);
    if (res.rows.length === 0) return null;
    return res.rows[0];
  } catch (err) {
    console.error('Auth verification error:', err);
    return null;
  }
}

export async function createAdminSession(email: string): Promise<string> {
  const token = signToken({ email, timestamp: Date.now() });
  const cookieStore = await cookies();
  cookieStore.set(SESSION_COOKIE, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/',
    maxAge: 60 * 60 * 24 * 7 // 7 days
  });
  return token;
}

export async function destroyAdminSession(): Promise<void> {
  const cookieStore = await cookies();
  cookieStore.delete(SESSION_COOKIE);
}

