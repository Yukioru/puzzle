import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  serverExternalPackages: ['bun:sqlite'],
  images: {
    qualities: [25, 50, 75, 90],
  }
};

export default nextConfig;
