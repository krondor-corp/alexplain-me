/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  output: "export",
  images: {
    unoptimized: true,
  },
  env: {
    BASE_URL: process.env.BASE_URL || "http://localhost:3001",
  },
};

module.exports = nextConfig;
