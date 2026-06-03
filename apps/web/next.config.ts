import type { NextConfig } from 'next';

const isDev = process.env.NODE_ENV !== 'production';
const devApiUrl = process.env.API_URL ?? 'http://localhost:4000';

const nextConfig: NextConfig = {
  images: {
    remotePatterns: [{ protocol: 'https', hostname: 'res.cloudinary.com' }],
  },
  async rewrites() {
    if (!isDev) return [];
    return [{ source: '/api/:path*', destination: `${devApiUrl}/api/:path*` }];
  },
};

export default nextConfig;
