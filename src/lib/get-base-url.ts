/** Magic links must never trust an incoming Host or forwarded-proto header. */
export function getBaseUrl(): string {
  const value =
    process.env.BASE_URL ||
    (process.env.NODE_ENV !== "production" ? "http://localhost:3000" : "");
  if (!value) throw new Error("BASE_URL is required in production.");
  const url = new URL(value);
  const local = ["localhost", "127.0.0.1", "[::1]"].includes(url.hostname);
  if (
    url.username ||
    url.password ||
    url.search ||
    url.hash ||
    url.pathname !== "/" ||
    (url.protocol !== "https:" &&
      !(
        process.env.NODE_ENV !== "production" &&
        local &&
        url.protocol === "http:"
      ))
  ) {
    throw new Error(
      "BASE_URL must be a trusted HTTPS origin (HTTP loopback is allowed in development).",
    );
  }
  return url.origin;
}
