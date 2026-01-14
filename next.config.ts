import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
  },
  devIndicators: {
    // @ts-ignore - buildActivity is valid in runtime but types might be outdated or strict
    buildActivity: false,
    // @ts-ignore
    appIsrStatus: false,
  },
};

export default nextConfig;
