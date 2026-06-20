import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  // Next.js 16 uses appDir by default; no experimental config needed
  images: {
    unoptimized: true,
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'flagcdn.com',
      },
      {
        protocol: 'https',
        hostname: 'cdn.shopify.com',
      },
    ],
  },
  async redirects() {
    return [
      {
        source: '/',
        destination: '/api/auth/install',
        permanent: false,
      },
    ];
  },
};

export default nextConfig;
