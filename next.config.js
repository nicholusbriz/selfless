/** @type {import('next').NextConfig} */

const nextConfig = {
  experimental: {
    // Optimize package imports for better Turbopack performance
    optimizePackageImports: [
      "@tanstack/react-query",
      "mongoose",
      "lucide-react",
      "framer-motion",
    ],

    // Optimize CSS handling
    optimizeCss: true,

    // Increase max body size for video uploads (allow up to 100MB)
    // ✅ Updated from middlewareClientMaxBodySize to proxyClientMaxBodySize
    proxyClientMaxBodySize: 100 * 1024 * 1024, // 100MB
  },

  // Handle ES modules that need to be externalized
  serverExternalPackages: ["@xenova/transformers"],

  // Disable source maps in development for faster builds
  productionBrowserSourceMaps: false,

  // Configure image optimization
  images: {
    // Bypass Vercel's image optimization service entirely to avoid 402 quota errors.
    // Supabase Storage already serves compressed images, so re-optimizing them
    // through Vercel wastes the monthly optimization quota.
    unoptimized: true,

    remotePatterns: [
      {
        protocol: "https",
        hostname: "pgmqmtszpzcmlhvwrzjs.supabase.co",
        port: "",
        pathname: "/storage/v1/object/public/**",
      },
    ],

    formats: ["image/webp", "image/avif"],

    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    qualities: [100, 75, 90],

    // Increase timeout for image loading
    minimumCacheTTL: 60,
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
      transform: "lucide-react/dist/esm/icons/{{kebabCase member}}",
    },
  },
};

module.exports = nextConfig;
