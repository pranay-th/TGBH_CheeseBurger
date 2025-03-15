/** @type {import('next').NextConfig} */
const nextConfig = {
  webpack: (config, { isServer }) => {
    // Add monaco-editor as an external dependency
    if (!isServer) {
      config.resolve.fallback = {
        ...config.resolve.fallback,
        'monaco-editor': false,
      };
    }
    return config;
  },
};

module.exports = nextConfig; 