"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { tables } from "@/lib/db/config";
import { query } from "@/lib/db/db";
import { normalizeEmail, normalizeEntity, validToken } from "./validation";
import { getSecret } from "./session";
import { sendMagicLink } from "./mail";
import {
  clearSession,
  createMagicToken,
  createSession,
  getCurrentUser,
  isAllowedDomain,
  recentTokenExists,
  upsertUser,
  verifyMagicToken as verifyMagicTokenService,
} from "./service";

type ActionResult<T = void> =
  { success: true; data?: T } | { success: false; error: string };

export async function requestMagicLink(email: string): Promise<ActionResult> {
  const trimmedEmail = normalizeEmail(email);
  if (!trimmedEmail) {
    return { success: false, error: "Email required" };
  }
  if (!(await isAllowedDomain(trimmedEmail))) {
    return { success: false, error: "Email domain not allowed" };
  }
  if (await recentTokenExists(trimmedEmail)) {
    return {
      success: false,
      error:
        "A magic link was recently sent. Please check your email or wait a few minutes.",
    };
  }
  try {
    const token = await createMagicToken(trimmedEmail);
    await sendMagicLink(trimmedEmail, token);
    return { success: true };
  } catch (error) {
    console.error("Error sending magic link:", error);
    return { success: false, error: "Failed to send email. Please try again." };
  }
}

export async function checkEntityForToken(
  token: string,
): Promise<
  ActionResult<{ email: string; hasEntity: boolean; entity: string | null }>
> {
  if (!validToken(token)) {
    return { success: false, error: "Missing token" };
  }
  const tokenRows = await query<{ email: string }>(
    `SELECT email FROM ${tables.magic_tokens} WHERE token = $1 AND expires_at > NOW() AND used_at IS NULL`,
    [token],
  );
  if (!tokenRows[0]) {
    return { success: false, error: "Invalid or expired token" };
  }
  const email = tokenRows[0].email;
  const userRows = await query<{ entity: string | null }>(
    `SELECT entity FROM ${tables.users} WHERE email = $1`,
    [email.toLowerCase()],
  );
  const existingEntity = userRows[0]?.entity || null;
  return {
    success: true,
    data: { email, hasEntity: !!existingEntity, entity: existingEntity },
  };
}

export async function verifyMagicToken(
  token: string,
  entity?: string,
): Promise<ActionResult> {
  if (!validToken(token)) {
    return { success: false, error: "Missing token" };
  }
  const selected = entity === undefined ? undefined : normalizeEntity(entity);
  if (selected === null)
    return {
      success: false,
      error: "Select an entity of at most 255 characters.",
    };
  getSecret(); // Fail before consuming a one-time link if configuration is missing.
  if (selected === undefined) {
    const existing = await checkEntityForToken(token);
    if (!existing.success || !existing.data?.hasEntity)
      return {
        success: false,
        error: "Please select your organisational entity.",
      };
  }
  const email = await verifyMagicTokenService(token);
  if (!email) {
    return { success: false, error: "Invalid or expired link" };
  }
  const userId = await upsertUser(email);
  if (selected) {
    await query(`UPDATE ${tables.users} SET entity = $1 WHERE id = $2`, [
      selected,
      userId,
    ]);
  }
  await createSession(userId);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function updateEntity(entity: string): Promise<ActionResult> {
  const user = await getCurrentUser();
  if (!user) {
    return { success: false, error: "Unauthorized" };
  }
  const selected = normalizeEntity(entity);
  if (!selected) {
    return { success: false, error: "Entity is required" };
  }
  await query(`UPDATE ${tables.users} SET entity = $1 WHERE id = $2`, [
    selected,
    user.id,
  ]);
  revalidatePath("/", "layout");
  return { success: true };
}

export async function logout(): Promise<void> {
  await clearSession();
  redirect("/");
}
