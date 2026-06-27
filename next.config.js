/** @type {import('next').NextConfig} */

const nextConfig = {

  experimental: {

    // Optimize package imports for better Turbopack performance

    optimizePackageImports: ['@tanstack/react-query', 'mongoose', 'lucide-react', 'framer-motion'],

    // Optimize CSS handling

    optimizeCss: true,

  },



  // Disable source maps in development for faster builds

  productionBrowserSourceMaps: false,



  // Configure image optimization

  images: {

    remotePatterns: [],

    formats: ['image/webp', 'image/avif'],

    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
  },



  // Enable compression

  compress: true,



  // Power header configurations for security

  poweredByHeader: false,



  // React strict mode (keep enabled for development)

  reactStrictMode: true,



  // Improve build performance

  modularizeImports: {
    lucideReact: {
      transform: 'lucide-react/dist/esm/icons/{{kebabCase member}}',
    },
  },
};



module.exports = nextConfig;

