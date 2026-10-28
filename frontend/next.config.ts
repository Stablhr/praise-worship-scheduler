import type { NextConfig } from "next";

const nextConfig: NextConfig = {
  /* config options here */
  images: {
    unoptimized: true
  },
  async redirects() {
    return [
      {
        source: '/more',
        destination: '/settings',
        permanent: false
      },
      {
        source: '/more/:path*',
        destination: '/settings',
        permanent: false
      }
    ];
  }
};

export default nextConfig;