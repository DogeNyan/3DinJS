/** @type {import('next').NextConfig} */
const nextConfig = {
  async rewrites() {
    return [
      {
        source: '/api/:path*',
        destination: 'http://app:8080/api/:path*', 
      },
    ];
  },
};

export default nextConfig;