/** Next Link handles basePath itself; use this for raw href/src and fetch URLs. */
export function withBasePath(path: string): string {
  const base = process.env.NEXT_PUBLIC_BASE_PATH || "";
  return `${base}${path}`;
}
