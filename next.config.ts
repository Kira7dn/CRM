import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  reactStrictMode: true,

  // Exclude instrumentation from Edge Runtime analysis
  serverExternalPackages: ['instrumentation'],

  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'image.tmdb.org',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
      },
      {
        protocol: 'https',
        hostname: 'www.figma.com',
      },
      { protocol: "http",
        hostname: "*"
      }
    ],
  },

  // Turbopack config for Next.js 16
  turbopack: {},
};

export default nextConfig;
