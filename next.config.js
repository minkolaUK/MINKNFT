/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  basePath: "",
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: '4a1257c53df9fb4ef5f9c1d8984d1397.ipfscdn.io',
        port: '',
        pathname: '/**',
      },
    ],
  },
};

module.exports = nextConfig;
