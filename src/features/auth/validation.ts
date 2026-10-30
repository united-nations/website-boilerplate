export function normalizeEmail(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const email = value.trim().toLowerCase();
  return email.length <= 254 && /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
    ? email
    : null;
}
export function validToken(value: unknown): value is string {
  return typeof value === "string" && /^[a-f0-9]{64}$/.test(value);
}
export function normalizeEntity(value: unknown): string | null {
  if (typeof value !== "string") return null;
  const entity = value.trim();
  return entity.length > 0 &&
    entity.length <= 255 &&
    !/[\u0000-\u001f\u007f]/.test(entity)
    ? entity
    : null;
}
