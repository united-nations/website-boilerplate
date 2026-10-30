import { test, expect } from "@playwright/test";
test("public pages share navigation, branded footer and keyboard skip link", async ({
  page,
}) => {
  await page.goto("/about");
  await expect(page.getByRole("heading", { level: 1 })).toBeVisible();
  await expect(page.getByRole("banner")).toBeVisible();
  await expect(page.getByRole("contentinfo")).toBeVisible();
  await expect(
    page.getByRole("navigation", { name: "United Nations links" }),
  ).toBeVisible();
  await page.keyboard.press("Tab");
  await expect(
    page.getByRole("link", { name: "Skip to main content" }),
  ).toBeFocused();
  await page.keyboard.press("Enter");
  await expect(page.locator("#main-content")).toBeFocused();
  await page.setViewportSize({ width: 390, height: 844 });
  await expect(
    page.getByRole("button", { name: "Open navigation menu" }),
  ).toBeVisible();
  await page.getByRole("button", { name: "Open navigation menu" }).click();
  await expect(
    page.getByRole("menuitem", { name: "About", exact: true }),
  ).toBeVisible();
  expect(
    await page.evaluate(
      () => document.documentElement.scrollWidth <= innerWidth,
    ),
  ).toBe(true);
  await page.keyboard.press("Escape");
  await page.setViewportSize({ width: 1600, height: 1000 });
  const emblem = await page.locator("header img:visible").first().boundingBox();
  const heading = await page.getByRole("heading", { level: 1 }).boundingBox();
  expect(emblem).not.toBeNull();
  expect(heading).not.toBeNull();
  expect(emblem!.x + emblem!.width).toBeLessThanOrEqual(heading!.x);
});
