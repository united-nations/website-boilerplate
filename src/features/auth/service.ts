import { cache } from "react";
import { cookies } from "next/headers";
import { randomBytes } from "node:crypto";
import { COOKIE_NAME, signSession, verifySession } from "./session";
import { tables } from "../../lib/db/config";
import { query } from "../../lib/db/db";

export async function isAllowedDomain(email: string): Promise<boolean> {
  const domain = email.toLowerCase().split("@")[1];
  if (!domain) return false;
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM ${tables.allowed_domains} WHERE domain = $1`,
    [domain],
  );
  return parseInt(rows[0]?.count || "0") > 0;
}

export function generateToken(): string {
  return randomBytes(32).toString("hex");
}

export async function recentTokenExists(email: string): Promise<boolean> {
  // Block if unused token sent in last 2 minutes (token expires 15 min after creation)
  const rows = await query<{ count: string }>(
    `SELECT COUNT(*) as count FROM ${tables.magic_tokens} 
     WHERE email = $1 AND used_at IS NULL AND expires_at > NOW() + INTERVAL '13 minutes'`,
    [email.toLowerCase()],
  );
  return parseInt(rows[0]?.count || "0") > 0;
}

export async function createMagicToken(email: string): Promise<string> {
  const token = generateToken();
  const expiresAt = new Date(Date.now() + 15 * 60 * 1000);
  await query(
    `INSERT INTO ${tables.magic_tokens} (token, email, expires_at) VALUES ($1, $2, $3)`,
    [token, email.toLowerCase(), expiresAt],
  );
  return token;
}

export async function verifyMagicToken(token: string): Promise<string | null> {
  const rows = await query<{ email: string }>(
    `UPDATE ${tables.magic_tokens} SET used_at = NOW() WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL RETURNING email`,
    [token],
  );
  return rows[0]?.email || null;
}

export async function upsertUser(email: string): Promise<string> {
  const rows = await query<{ id: string }>(
    `INSERT INTO ${tables.users} (email, last_login_at) VALUES ($1, NOW()) 
     ON CONFLICT (email) DO UPDATE SET last_login_at = NOW() RETURNING id`,
    [email.toLowerCase()],
  );
  return rows[0].id;
}

export async function createSession(userId: string) {
  const token = signSession(userId);
  const cookieStore = await cookies();
  cookieStore.set(COOKIE_NAME, token, {
    httpOnly: true,
    secure: process.env.NODE_ENV === "production",
    sameSite: "lax",
    maxAge: 30 * 24 * 60 * 60,
    path: "/",
  });
}

export async function getSession(): Promise<{ userId: string } | null> {
  const cookieStore = await cookies();
  const token = cookieStore.get(COOKIE_NAME)?.value;
  if (!token) return null;
  return verifySession(token);
}

export async function clearSession() {
  const cookieStore = await cookies();
  cookieStore.delete(COOKIE_NAME);
}

export const getCurrentUser = cache(async () => {
  const session = await getSession();
  if (!session) return null;
  const rows = await query<{
    id: string;
    email: string;
    entity: string | null;
  }>(`SELECT id, email, entity FROM ${tables.users} WHERE id = $1`, [
    session.userId,
  ]);
  if (!rows[0]) return null;
  return { id: rows[0].id, email: rows[0].email, entity: rows[0].entity };
});
