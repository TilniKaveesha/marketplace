/** @type {import('next').NextConfig} */
const nextConfig = {
   images: {
    remotePatterns: [
      {
        protocol: 'https',
        port: '',
        hostname: 'fra.cloud.appwrite.io',
        pathname: '/v1/storage/buckets/**',
      },
    ],
  },
};

export default nextConfig;
