import { test, expect } from "@playwright/test";

// These checks deliberately run without a database or SMTP server configured.
test("protected Home introduces signed-out visitors on About", async ({
  page,
}) => {
  await page.goto("/");
  await expect(page).toHaveURL(/\/about$/);
  const header = page.getByRole("banner");
  await expect(
    header.getByRole("link", { name: "Home", exact: true }),
  ).toHaveCount(0);
  await expect(
    header.getByRole("link", { name: "Sign in", exact: true }),
  ).toBeVisible();
  await expect(
    header.getByRole("button", { name: "Your account" }),
  ).toHaveCount(0);
  await expect(
    page.getByRole("list", { name: "Getting started" }).getByRole("listitem"),
  ).toHaveCount(3);
  await page
    .getByRole("link", { name: "Explore features", exact: true })
    .click();
  await expect(page).toHaveURL(/\/about#features$/);
  await expect(
    page.getByRole("heading", { name: "Platform features" }),
  ).toBeInViewport();
  await page.getByRole("link", { name: "Get started", exact: true }).click();
  await expect(page).toHaveURL(/\/login$/);
  await expect(page.getByLabel("Email address")).toBeVisible();
});

test("every public page keeps signed-out navigation and sign-in controls on desktop and mobile", async ({
  page,
}) => {
  for (const path of ["/about", "/login", "/verify"]) {
    await page.setViewportSize({ width: 1280, height: 900 });
    const response = await page.goto(path);
    expect(response?.status()).toBe(200);
    const header = page.getByRole("banner");
    await expect(
      header.getByRole("link", { name: "Home", exact: true }),
    ).toHaveCount(0);
    await expect(
      header.getByRole("link", { name: "Sign in", exact: true }),
    ).toBeVisible();
    for (const brand of await header
      .getByRole("link", { name: "Website Boilerplate home", exact: true })
      .all()) {
      await expect(brand).toHaveAttribute("href", "/about");
    }
    await page.setViewportSize({ width: 390, height: 844 });
    await expect(
      header.getByRole("link", { name: "Sign in", exact: true }),
    ).toBeVisible();
    await header.getByRole("button", { name: "Open navigation menu" }).click();
    await expect(
      page.getByRole("menuitem", { name: "About", exact: true }),
    ).toBeVisible();
    await expect(
      page.getByRole("menuitem", { name: "Home", exact: true }),
    ).toHaveCount(0);
    await page.keyboard.press("Escape");
    expect(
      await page.evaluate(
        () => document.documentElement.scrollWidth <= innerWidth,
      ),
    ).toBe(true);
  }
});

test("private routes and APIs stay protected", async ({ request }) => {
  for (const path of [
    "/",
    "/private-example",
    "/about-private",
    "/login-private",
  ]) {
    const response = await request.get(path, { maxRedirects: 0 });
    expect(response.status()).toBe(307);
    expect(new URL(response.headers().location, response.url()).pathname).toBe(
      "/about",
    );
  }
  const response = await request.get("/api/private-example");
  expect(response.status()).toBe(401);
  const invalidLink = await request.post("/api/auth/verify", {
    data: { token: "invalid" },
  });
  expect(invalidLink.status()).toBe(400);
});
