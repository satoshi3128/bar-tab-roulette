import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'export',
  distDir: 'dist',
  trailingSlash: true,
  images: {
    unoptimized: true,
  },
  basePath: process.env.NODE_ENV === 'production' ? '/bar-tab-roulette' : '',
  assetPrefix: process.env.NODE_ENV === 'production' ? '/bar-tab-roulette' : '',
};

export default nextConfig;
