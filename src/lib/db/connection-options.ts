import type { PoolConfig } from "pg";
const loopback = new Set(["localhost", "127.0.0.1", "[::1]", "::1"]);
/** Both provisioning tools and the app verify remote certificates. Never log URLs. */
export function connectionOptions(
  env: NodeJS.ProcessEnv = process.env,
  admin = false,
): PoolConfig {
  const value = admin ? env.DATABASE_ADMIN_URL : env.DATABASE_URL;
  if (value) {
    const url = new URL(value);
    if (!["postgres:", "postgresql:"].includes(url.protocol))
      throw new Error("Expected a PostgreSQL connection URL.");
    const local = loopback.has(url.hostname);
    const disable = url.searchParams.get("sslmode") === "disable";
    if (disable && !local)
      throw new Error("TLS can only be disabled for a loopback database.");
    // Do not let pg's URL parser replace the explicit certificate policy.
    for (const key of [
      "sslmode",
      "ssl",
      "sslcert",
      "sslkey",
      "sslrootcert",
      "uselibpqcompat",
    ])
      url.searchParams.delete(key);
    return {
      connectionString: url.toString(),
      ssl: disable ? false : { rejectUnauthorized: true },
    };
  }
  if (admin)
    throw new Error(
      "Set DATABASE_ADMIN_URL for this administrator-only command.",
    );
  for (const key of [
    "AZURE_POSTGRES_HOST",
    "AZURE_POSTGRES_DB",
    "AZURE_POSTGRES_USER",
    "AZURE_POSTGRES_PASSWORD",
  ]) {
    if (!env[key])
      throw new Error(
        "Set DATABASE_URL in .env.local (see docs/auth-setup.md).",
      );
  }
  const host = env.AZURE_POSTGRES_HOST!;
  if (env.DB_SSL === "false" && !loopback.has(host))
    throw new Error("DB_SSL=false is only allowed on loopback.");
  return {
    host,
    port: Number(env.AZURE_POSTGRES_PORT || "5432"),
    database: env.AZURE_POSTGRES_DB,
    user: env.AZURE_POSTGRES_USER,
    password: env.AZURE_POSTGRES_PASSWORD,
    ssl: env.DB_SSL === "false" ? false : { rejectUnauthorized: true },
  };
}
