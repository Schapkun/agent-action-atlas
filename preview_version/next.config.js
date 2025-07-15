const path = require('path');

/** @type {import('next').NextConfig} */
const nextConfig = {
  reactStrictMode: true,
  webpack: (config, { isServer }) => {
    if (!isServer) {
      config.resolve.alias['/preview_version'] = path.join(__dirname, 'preview_version');
    }
    return config;
  },
}

module.exports = nextConfig;
