import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  images: {
    // Whitelist every quality value used across the project so Turbopack
    // does not emit "quality not configured" warnings in the browser console.
    qualities: [70, 75, 80, 85],
  },
};

export default nextConfig;
