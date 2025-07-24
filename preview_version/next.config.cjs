const path = require("path");

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config) => {
    config.resolve.alias["@"] = path.resolve(__dirname, "src");
    config.resolve.fallback = {
      fs: false,
      path: false,
      os: false
    };
    return config;
  }
};

module.exports = nextConfig;
