export function validateSchema(value: string): string {
  if (
    !/^[a-z][a-z0-9_]{0,62}$/.test(value) ||
    ["public", "systemchart", "information_schema"].includes(value) ||
    value.startsWith("pg_")
  ) {
    throw new Error(
      "DB_SCHEMA must be an app-specific lowercase identifier (up to 63 characters); public, systemchart and system schemas are reserved.",
    );
  }
  return value;
}
export const DB_SCHEMA = validateSchema(process.env.DB_SCHEMA || "myapp");
export const tables = {
  users: `"${DB_SCHEMA}".users`,
  magic_tokens: `"${DB_SCHEMA}".magic_tokens`,
  allowed_domains: `"${DB_SCHEMA}".allowed_domains`,
} as const;
