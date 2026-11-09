/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  serverExternalPackages: ['@electric-sql/pglite', 'pg'],
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'www.fca.edu.au',
      },
      {
        protocol: 'https',
        hostname: 'fca.edu.au',
      },
    ],
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb'
    }
  }
};

export default nextConfig;
