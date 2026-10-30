import { test, expect } from "@playwright/test";
import { createServer } from "node:net";
import { randomUUID } from "node:crypto";
import pg from "pg";

// Opt in only against an isolated local fixture database. No real email is sent.
const url = process.env.AUTH_TEST_DATABASE_URL;
test.skip(
  !url,
  "Set AUTH_TEST_DATABASE_URL and configure the preview with its restricted runtime login and local SMTP port 2525.",
);
const messages: string[] = [];
const smtp = createServer((socket) => {
  socket.write("220 localhost test SMTP\r\n");
  let buffer = "";
  let data = false;
  let message = "";
  socket.on("data", (chunk) => {
    buffer += chunk.toString();
    let end: number;
    while ((end = buffer.indexOf("\r\n")) >= 0) {
      const line = buffer.slice(0, end);
      buffer = buffer.slice(end + 2);
      if (data) {
        if (line === ".") {
          messages.push(message);
          message = "";
          data = false;
          socket.write("250 accepted\r\n");
        } else message += `${line}\r\n`;
      } else if (line.startsWith("DATA")) {
        data = true;
        socket.write("354 send message\r\n");
      } else if (line.startsWith("QUIT")) socket.end("221 bye\r\n");
      else socket.write("250 OK\r\n");
    }
  });
});
test.beforeAll(async () => {
  if (!url) return;
  const parsed = new URL(url);
  if (
    !["127.0.0.1", "localhost", "[::1]"].includes(parsed.hostname) ||
    !parsed.pathname.endsWith("_test")
  )
    throw new Error(
      "Auth browser fixtures require a disposable loopback *_test database.",
    );
  await new Promise<void>((resolve, reject) => {
    smtp.once("error", reject);
    smtp.listen(2525, "127.0.0.1", resolve);
  });
});
test.afterAll(async () => {
  if (smtp.listening)
    await new Promise<void>((resolve) => smtp.close(() => resolve()));
});

test("email link, keyboard entity choice, custom affiliation, logout and single-use token", async ({
  page,
  request,
}) => {
  const email = `browser-${randomUUID()}@un.org`;
  await page.goto("/");
  await expect(page).toHaveURL(/\/$/);
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await page.getByLabel("Email address").fill(email);
  await page.getByRole("button", { name: "Send sign-in link" }).click();
  await expect(page.getByRole("status")).toContainText("Check your email");
  await expect.poll(() => messages.length).toBeGreaterThan(0);
  const token = messages
    .at(-1)!
    .replaceAll("=\r\n", "")
    .replace(/=([0-9A-F]{2})/gi, (_, hex: string) =>
      String.fromCharCode(parseInt(hex, 16)),
    )
    .match(/token=([a-f0-9]{64})/)?.[1];
  expect(token).toBeTruthy();
  await page.goto(`/verify?token=${token}`);
  const picker = page.getByRole("combobox", { name: "Organisational entity" });
  await picker.fill("UNICEF");
  await expect(
    page.getByRole("option").filter({ hasText: "UNICEF" }).first(),
  ).toBeVisible();
  await picker.press("Enter");
  await expect(picker).toHaveValue("UNICEF");
  await page.getByRole("button", { name: "Complete sign-in" }).click();
  await expect(
    page.getByRole("heading", { name: "Welcome", exact: true }),
  ).toBeVisible();
  const cookie = (await page.context().cookies()).find(
    (item) => item.name === "auth_session",
  );
  expect(cookie?.httpOnly).toBe(true);
  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about\/?$/);
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toHaveCount(0);
  await page.getByRole("button", { name: "Your account" }).click();
  await page.getByRole("menuitem", { name: "Update entity" }).click();
  await expect(
    page.getByRole("dialog", { name: "Update entity" }),
  ).toBeVisible();
  const custom = page.getByRole("combobox");
  await custom.fill("Discarded search text");
  await custom.press("Escape");
  await expect(custom).toHaveValue("UNICEF");
  await expect(
    page.getByRole("dialog", { name: "Update entity" }),
  ).toBeVisible();
  await custom.fill("Independent test organisation");
  await custom.press("Enter");
  await page.getByRole("button", { name: "Update", exact: true }).click();
  await expect(page.getByRole("dialog")).toHaveCount(0);
  await page.getByRole("button", { name: "Your account" }).click();
  await expect(
    page.getByText("Independent test organisation").first(),
  ).toBeVisible();
  await page.getByRole("menuitem", { name: "Sign out", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();
  expect(
    (await page.context().cookies()).some(
      (item) => item.name === "auth_session",
    ),
  ).toBe(false);
  const repeat = await request.post("/api/auth/verify", {
    data: { token, entity: "UNICEF" },
  });
  expect(repeat.status()).toBe(400);
  const protectedResponse = await request.get("/api/private-example");
  expect(protectedResponse.status()).toBe(401);
  // A URL that merely begins with a public path must still be protected.
  await page.goto("/about-private");
  await expect(page).toHaveURL(/\/about\/?$/);
});

test("expired links cannot sign in", async ({ page }) => {
  const client = new pg.Client({ connectionString: url });
  await client.connect();
  const token = randomUUID().replaceAll("-", "").repeat(2);
  try {
    await client.query(
      `INSERT INTO "${process.env.DB_SCHEMA || "myapp"}".magic_tokens (token,email,expires_at) VALUES ($1,'expired@un.org',now()-interval '1 minute')`,
      [token],
    );
  } finally {
    await client.end();
  }
  await page.goto(`/verify?token=${token}`);
  await expect(page.locator("main").getByRole("alert")).toContainText(
    "Invalid or expired",
  );
});
