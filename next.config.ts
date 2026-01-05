import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Allow local network access
  allowedDevOrigins: [
    "192.168.*.*",
  ],
};

export default nextConfig;
