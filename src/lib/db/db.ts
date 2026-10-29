import "server-only";
import { Pool, type QueryResultRow } from "pg";
import { connectionOptions } from "./connection-options";
const globalForDb = globalThis as unknown as { appPool?: Pool };
export function getPool(): Pool {
  if (!globalForDb.appPool) {
    globalForDb.appPool = new Pool({
      ...connectionOptions(),
      max: 5,
      connectionTimeoutMillis: 10000,
      idleTimeoutMillis: 30000,
      query_timeout: 30000,
    });
    globalForDb.appPool.on("error", () =>
      console.error("An idle database connection failed."),
    );
  }
  return globalForDb.appPool;
}
export async function query<T extends QueryResultRow = QueryResultRow>(
  text: string,
  params?: unknown[],
): Promise<T[]> {
  return (await getPool().query<T>(text, params)).rows;
}
