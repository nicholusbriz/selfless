/** @type {import('next').NextConfig} */
const nextConfig = {
  experimental: {
    // Optimize package imports for better Turbopack performance
    optimizePackageImports: [
      "@tanstack/react-query",
      "lucide-react",
      "framer-motion",
      "recharts", // Added this since it's a heavy charting library
    ],

    // Optimize CSS handling
    optimizeCss: true,

    // Increase max body size for video uploads (allow up to 100MB)
    proxyClientMaxBodySize: 100 * 1024 * 1024, // 100MB
  },

  // Keep server-only runtime dependencies external to the server bundle.
  serverExternalPackages: [
    "@prisma/client",
    "prisma"
  ],

  // Empty turbopack config to suppress webpack conflict warning
  turbopack: {},

  // Disable source maps in development for faster builds
  productionBrowserSourceMaps: false,

  // Configure image optimization
  images: {
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
    qualities: [100, 75, 90, 95],

    minimumCacheTTL: 60,
  },

  compress: true,
  poweredByHeader: false,
  reactStrictMode: true,
};

module.exports = nextConfig;