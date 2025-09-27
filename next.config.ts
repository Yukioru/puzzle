import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  output: 'standalone',
  images: {
    qualities: [25, 50, 75, 90],
  }
};

export default nextConfig;
