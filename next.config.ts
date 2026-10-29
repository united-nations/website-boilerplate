import type { NextConfig } from "next";
// Empty for custom domains; /repository-name for GitHub project Pages.
const basePath = process.env.BASE_PATH || "";
const nextConfig: NextConfig = {
  output: "export",
  trailingSlash: true,
  basePath,
  transpilePackages: ["@un-eosg/ui"],
  reactStrictMode: true,
  poweredByHeader: false,
  images: { unoptimized: true },
  env: { NEXT_PUBLIC_BASE_PATH: basePath },
};
export default nextConfig;
