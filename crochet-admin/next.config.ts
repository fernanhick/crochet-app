import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  webpack(config) {
    // Suppress the "Serializing big strings" cache performance warning
    config.infrastructureLogging = { level: "error" };
    return config;
  },
};

export default nextConfig;
