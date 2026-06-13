/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Optimize package imports for better Turbopack performance
    optimizePackageImports: ['@tanstack/react-query', 'mongoose'],
    // Optimize CSS handling
    optimizeCss: true,
  },

  // Disable source maps in development for faster builds
  productionBrowserSourceMaps: false,

  // Configure image optimization
  images: {
    domains: [],
    formats: ['image/webp', 'image/avif'],
  },

  // Enable compression
  compress: true,

  // Power header configurations for security
  poweredByHeader: false,

  // React strict mode (keep enabled for development)
  reactStrictMode: true,
};

module.exports = nextConfig;
