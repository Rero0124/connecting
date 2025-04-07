import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  async redirects() {
    return [
      {
        source: '/',
        destination: '/room/my',
        permanent: true
      }
    ]
  },
  experimental: {
    useCache: true,
  }
};

export default nextConfig;
