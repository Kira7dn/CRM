import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    },
    serverComponentsExternalPackages: ["pdf-parse"],
  },
  serverExternalPackages: ['instrumentation'],
  allowedDevOrigins: ["crm.linkstrategy.io.vn"],
  images: {
    remotePatterns: [
      { protocol: 'https', hostname: 'image.tmdb.org' },
      { protocol: 'http', hostname: 'localhost' },
      { protocol: 'https', hostname: 'www.figma.com' },
      { protocol: "http", hostname: "*" },
      { protocol: "https", hostname: "*" },
      { protocol: "https", hostname: "zalo-miniapp.github.io" },
    ],
  },
  turbopack: {},
};

export default nextConfig;
