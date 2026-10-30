/** Start here when adapting the template. Public values only; no secrets. */
export const siteConfig = {
  brand: "United Nations",
  name: "Website Boilerplate",
  description:
    "A starting point for clear, accessible United Nations websites.",
  url: process.env.NEXT_PUBLIC_SITE_URL || "http://localhost:3000",
  navigation: [
    { href: "/", label: "Home", requiresAuth: true },
    { href: "/about", label: "About", requiresAuth: false },
  ],
  analytics: {
    scriptUrl: process.env.NEXT_PUBLIC_ANALYTICS_SCRIPT_URL,
    websiteId: process.env.NEXT_PUBLIC_ANALYTICS_WEBSITE_ID,
  },
} as const;
export const pageContainer = "mx-auto w-full max-w-6xl px-6 sm:px-8 lg:px-16";
