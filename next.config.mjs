/** @type {import('next').NextConfig} */
const nextConfig = {
  images: {
    remotePatterns: [
      {
        protocol: 'https',
        hostname: 'picsum.photos',
      },
      {
        protocol: 'https',
        hostname: '**', // Allow any domain
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3000',
        pathname: '/**',
      },
      {
        protocol: 'http',
        hostname: 'localhost',
        port: '3001',
        pathname: '/**',
      },
    ],
    // Maximum performance optimizations
    formats: ['image/webp', 'image/avif'],
    minimumCacheTTL: 31536000, // 1 year cache
    dangerouslyAllowSVG: true,
    contentSecurityPolicy: "default-src 'self'; script-src 'none'; sandbox;",
    // Enable image optimization
    deviceSizes: [640, 750, 828, 1080, 1200, 1920, 2048, 3840],
    imageSizes: [16, 32, 48, 64, 96, 128, 256, 384],
    // Enable lazy loading
    loader: 'default',
  },
  experimental: {
    serverActions: {
      bodySizeLimit: '10mb',
    },
    // Maximum performance improvements
    optimizeCss: true,
    optimizePackageImports: ['@radix-ui/react-icons', 'lucide-react', '@radix-ui/react-*'],
    // Enable static optimization
    staticGenerationRetryCount: 3,
    // Enable faster builds
    esmExternals: true,
    // Enable better caching
    staleTimes: {
      dynamic: 30,
      static: 180,
    },
    // Reduce hot reload frequency
    webVitalsAttribution: ['CLS', 'LCP'],
    // Enable static optimization
    staticGenerationRetryCount: 3,
    // Enable better performance
    optimizeServerReact: true,
    // Enable faster builds
    turbo: {
      rules: {
        '*.svg': {
          loaders: ['@svgr/webpack'],
          as: '*.js',
        },
      },
    },
  },
  // Security headers
  async headers() {
    return [
      {
        source: '/(.*)',
        headers: [
          {
            key: 'X-Frame-Options',
            value: 'DENY',
          },
          {
            key: 'X-Content-Type-Options',
            value: 'nosniff',
          },
          {
            key: 'Referrer-Policy',
            value: 'origin-when-cross-origin',
          },
          {
            key: 'X-XSS-Protection',
            value: '1; mode=block',
          },
          {
            key: 'Strict-Transport-Security',
            value: 'max-age=31536000; includeSubDomains',
          },
          {
            key: 'Permissions-Policy',
            value: 'camera=(), microphone=(), geolocation=()',
          },
          {
            key: 'Content-Security-Policy',
            value: "default-src 'self'; script-src 'self' 'unsafe-eval' 'unsafe-inline' https://www.googletagmanager.com https://www.youtube.com blob:; style-src 'self' 'unsafe-inline' https://fonts.googleapis.com; font-src 'self' https://fonts.gstatic.com; img-src 'self' data: https: blob: https://res.cloudinary.com; connect-src 'self' http://localhost:3001 https://api.supabase.co https://www.googleapis.com https://*.supabase.co https://crdegxuvexhursfozawq.supabase.co https://api.cloudinary.com; frame-src 'self' https://www.youtube.com;",
          },
        ],
      },
    ];
  },
  // Maximum performance optimizations
  compress: true,
  poweredByHeader: false,
  generateEtags: true,
  // Enable static optimization
  staticPageGenerationTimeout: 1000,
  // Enable better caching
  onDemandEntries: {
    maxInactiveAge: 25 * 1000,
    pagesBufferLength: 2,
  },
  // PWA support
  async rewrites() {
    return [
      {
        source: '/sw.js',
        destination: '/_next/static/sw.js',
      },
    ];
  },
  // Webpack optimizations
  webpack: (config, { dev, isServer }) => {
    // Fix chunk loading issues
    config.resolve.fallback = {
      ...config.resolve.fallback,
      fs: false,
      net: false,
      tls: false,
    };

    // Optimize bundle size
    if (!dev && !isServer) {
      config.optimization.splitChunks = {
        chunks: 'all',
        maxInitialRequests: 30,
        maxAsyncRequests: 30,
        cacheGroups: {
          vendor: {
            test: /[\\/]node_modules[\\/]/,
            name: 'vendors',
            chunks: 'all',
            priority: 10,
          },
          common: {
            name: 'common',
            minChunks: 2,
            chunks: 'all',
            enforce: true,
            priority: 5,
          },
        },
      };
    }

    // SVG optimization
    config.module.rules.push({
      test: /\.svg$/,
      use: ['@svgr/webpack'],
    });

    // Fix for chunk loading errors
    config.output.chunkLoadingGlobal = 'webpackChunkPodDB';
    config.output.globalObject = 'self';

    return config;
  },
  // Output optimizations
  output: 'standalone',
  // Trailing slash for better SEO
  trailingSlash: false,
  // Enable React strict mode (disabled for development to prevent double renders)
  reactStrictMode: process.env.NODE_ENV === 'production',
  // Development optimizations
  ...(process.env.NODE_ENV === 'development' && {
    // Reduce hot reload frequency
    onDemandEntries: {
      maxInactiveAge: 25 * 1000,
      pagesBufferLength: 2,
    },
  }),
};

export default nextConfig;