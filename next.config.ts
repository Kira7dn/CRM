import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack: (config, { isServer, webpack }) => {
    if (isServer) {
      config.externals.push('bullmq', 'ioredis')
    }

    // Ignore test files from dependencies to avoid build errors
    config.plugins.push(
      new webpack.IgnorePlugin({
        resourceRegExp: /\/test\//,
        contextRegExp: /thread-stream/,
      })
    )

    return config
  },
  reactStrictMode: false,
  experimental: {
    serverActions: {
      bodySizeLimit: '100mb',
    }
  },
  serverExternalPackages: [
    'instrumentation',
    '@copilotkit/runtime',
    'pino',
    'thread-stream'
  ],
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
