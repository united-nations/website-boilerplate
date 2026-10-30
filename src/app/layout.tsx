import type { Metadata, Viewport } from "next";
import { Roboto } from "next/font/google";
import Script from "next/script";
import { siteConfig } from "@/lib/site-config";
import "./globals.css";

const roboto = Roboto({ subsets: ["latin"], variable: "--font-roboto" });
export const metadata: Metadata = {
  metadataBase: new URL(siteConfig.url),
  title: { default: siteConfig.name, template: `%s | ${siteConfig.name}` },
  description: siteConfig.description,
  openGraph: {
    title: siteConfig.name,
    description: siteConfig.description,
    type: "website",
    locale: "en_US",
  },
};
export const viewport: Viewport = { width: "device-width", initialScale: 1 };
export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${roboto.variable} antialiased`}>
      <body className="flex min-h-screen flex-col">
        {children}
        {siteConfig.analytics.scriptUrl && siteConfig.analytics.websiteId && (
          <Script
            src={siteConfig.analytics.scriptUrl}
            data-website-id={siteConfig.analytics.websiteId}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
