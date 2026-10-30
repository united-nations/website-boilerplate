import { test, expect } from "@playwright/test";

test("signed-out visitors can open Home and return from About", async ({
  page,
}) => {
  const response = await page.goto("/");
  expect(response?.status()).toBe(200);
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toContainText(
    "Website Boilerplate",
  );
  await expect(
    page.getByRole("link", { name: "Sign in", exact: true }),
  ).toHaveAttribute("href", "/login");
  await expect(
    page.getByRole("heading", { name: "Welcome", exact: true }),
  ).toHaveCount(0);
  await expect(page.getByRole("button", { name: "Your account" })).toHaveCount(
    0,
  );

  await page.getByRole("link", { name: "About", exact: true }).click();
  await expect(page).toHaveURL(/\/about$/);
  await page.getByRole("link", { name: "Home", exact: true }).click();
  await expect(page).toHaveURL(/\/$/);
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await page.getByRole("link", { name: "Sign in", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Email address")).toBeVisible();
});

test("a public homepage does not expose private routes or operations", async ({
  request,
}) => {
  for (const path of ["/private-example", "/about-private", "/login-private"]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(new URL(response.headers().location, response.url()).pathname).toBe(
      "/about",
    );
  }
  const response = await request.get("/api/private-example");
  expect(response.status()).toBe(401);
  const logout = await request.post("/api/auth/logout");
  expect(logout.status()).toBe(200);
  const invalidLink = await request.post("/api/auth/verify", {
    data: { token: "invalid" },
  });
  expect(invalidLink.status()).toBe(400);
});
