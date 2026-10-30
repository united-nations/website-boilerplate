import { createHmac, timingSafeEqual } from "node:crypto";
export const COOKIE_NAME = "auth_session";
export function getSecret(): string {
  const secret = process.env.AUTH_SECRET;
  if (!secret || secret.length < 32)
    throw new Error("AUTH_SECRET must contain at least 32 random characters.");
  return secret;
}
export function signSession(userId: string): string {
  const payload = Buffer.from(
    JSON.stringify({ userId, exp: Date.now() + 30 * 24 * 60 * 60 * 1000 }),
  ).toString("base64url");
  return `${payload}.${createHmac("sha256", getSecret()).update(payload).digest("hex")}`;
}
export function verifySession(token: string): { userId: string } | null {
  const secret = getSecret();
  try {
    const parts = token.split(".");
    if (parts.length !== 2 || !/^[a-f0-9]{64}$/.test(parts[1])) return null;
    const [payload, signature] = parts;
    const expected = createHmac("sha256", secret).update(payload).digest();
    if (!timingSafeEqual(Buffer.from(signature, "hex"), expected)) return null;
    const data = JSON.parse(Buffer.from(payload, "base64url").toString("utf8"));
    if (
      typeof data.exp !== "number" ||
      data.exp <= Date.now() ||
      typeof data.userId !== "string" ||
      !/^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i.test(
        data.userId,
      )
    )
      return null;
    return { userId: data.userId };
  } catch {
    return null;
  }
}
