import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";
// import { visualizer } from 'rollup-plugin-visualizer';
import { splitVendorChunkPlugin } from 'vite';

export default defineConfig({
  plugins: [
    react({
      // Optimize React Fast Refresh
      fastRefresh: true,
      // Enable automatic JSX runtime
      jsxRuntime: 'automatic',
      // Exclude node_modules from Fast Refresh
      exclude: [/node_modules/],
    }),
    // Vendor chunk splitting for better caching
    splitVendorChunkPlugin(),
    // Bundle analyzer for production builds (temporarily disabled)
    // ...(process.env.ANALYZE ? [
    //   visualizer({
    //     filename: 'dist/bundle-analysis.html',
    //     open: true,
    //     gzipSize: true,
    //     brotliSize: true
    //   })
    // ] : []),
    // Only use Replit plugins when in Replit environment
    ...(process.env.NODE_ENV !== "production" &&
    process.env.REPL_ID !== undefined
      ? [
          runtimeErrorOverlay(),
          await import("@replit/vite-plugin-cartographer").then((m) =>
            m.cartographer(),
          ),
        ]
      : []),
  ],
  resolve: {
    alias: {
      "@": path.resolve(import.meta.dirname, "client", "src"),
      "@shared": path.resolve(import.meta.dirname, "shared"),
      "@assets": path.resolve(import.meta.dirname, "attached_assets"),
    },
  },
  root: path.resolve(import.meta.dirname, "client"),
  build: {
    outDir: path.resolve(import.meta.dirname, "dist/public"),
    emptyOutDir: true,
    // Performance optimizations
    target: ['es2020', 'edge88', 'firefox78', 'chrome87', 'safari13'],
    minify: 'esbuild',
    sourcemap: process.env.NODE_ENV === 'development' ? true : false,
    cssCodeSplit: true, // Enable CSS code splitting
    // Treeshaking optimizations
    modulePreload: {
      polyfill: false // Remove module preload polyfill for modern browsers
    },
    // Chunk size optimization
    rollupOptions: {
      output: {
        // Advanced manual chunk splitting for optimal caching
        manualChunks: (id) => {
          // React ecosystem
          if (id.includes('react') || id.includes('react-dom')) {
            return 'react-vendor';
          }
          // Radix UI components
          if (id.includes('@radix-ui')) {
            return 'radix-vendor';
          }
          // Framer Motion
          if (id.includes('framer-motion')) {
            return 'animation-vendor';
          }
          // Icons
          if (id.includes('lucide-react') || id.includes('react-icons')) {
            return 'icons-vendor';
          }
          // Utilities
          if (id.includes('clsx') || id.includes('tailwind-merge') || id.includes('class-variance-authority')) {
            return 'utils-vendor';
          }
          // Data fetching
          if (id.includes('@tanstack/react-query') || id.includes('axios')) {
            return 'data-vendor';
          }
          // Routing
          if (id.includes('wouter')) {
            return 'routing-vendor';
          }
          // Audio
          if (id.includes('howler')) {
            return 'audio-vendor';
          }
          // Date utilities
          if (id.includes('date-fns') || id.includes('moment')) {
            return 'date-vendor';
          }
          // Payment
          if (id.includes('stripe')) {
            return 'payment-vendor';
          }
          // Charts
          if (id.includes('recharts')) {
            return 'charts-vendor';
          }
          // Node modules that aren't vendors
          if (id.includes('node_modules')) {
            return 'vendor';
          }
        },
        // Optimize chunk and asset names for CDN caching
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop()?.replace(/\.[^.]*$/, '')
            : 'chunk';
          return `js/[name]-[hash:8].js`;
        },
        entryFileNames: 'js/[name]-[hash:8].js',
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name?.split('.') || [];
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|webp|avif|tiff|bmp|ico/i.test(ext)) {
            return `images/[name]-[hash:8].${ext}`;
          }
          if (ext === 'css') {
            return `css/[name]-[hash:8].${ext}`;
          }
          if (/woff2?|eot|ttf|otf/i.test(ext)) {
            return `fonts/[name]-[hash:8].${ext}`;
          }
          return `assets/[name]-[hash:8].${ext}`;
        }
      },
      // Tree shaking optimizations
      treeshake: {
        preset: 'recommended',
        manualPureFunctions: ['console.log', 'console.warn', 'console.info'],
        propertyReadSideEffects: false
      },
      // External dependencies (don't bundle these)
      external: [
        // Add any CDN dependencies here
      ]
    },
    // Compression and optimization
    reportCompressedSize: true,
    chunkSizeWarningLimit: 800, // Warn for chunks larger than 800KB
    assetsInlineLimit: 4096, // Inline assets smaller than 4KB
    // CSS optimization
    cssMinify: 'esbuild',
    // Experimental optimizations
    ...(process.env.NODE_ENV === 'production' && {
      terserOptions: {
        compress: {
          drop_console: true,
          drop_debugger: true,
          pure_funcs: ['console.log', 'console.warn']
        }
      }
    })
  },
  server: {
    fs: {
      strict: true,
      deny: ["**/.*"],
    },
    // Development optimizations
    hmr: {
      overlay: true,
    },
    // Pre-transform known dependencies for faster dev server startup
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'react/jsx-runtime',
        'framer-motion',
        '@tanstack/react-query',
        'lucide-react',
        'react-icons/si',
        'wouter',
        'clsx',
        'tailwind-merge',
        'class-variance-authority',
        'axios',
        'date-fns',
        'recharts'
      ],
      // Exclude problematic dependencies
      exclude: [
        '@replit/vite-plugin-runtime-error-modal',
        'howler' // Audio library can cause issues with pre-bundling
      ],
      // Force optimization of certain dependencies
      force: process.env.NODE_ENV === 'development' ? [
        'react-dom',
        'framer-motion'
      ] : undefined
    },
  },
  // CSS optimization
  css: {
    devSourcemap: process.env.NODE_ENV === 'development',
    // PostCSS optimizations will be handled by Tailwind
  },
  // Performance monitoring and feature flags
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __PERFORMANCE_MONITORING__: process.env.NODE_ENV === 'production',
    __BUILD_TIME__: JSON.stringify(new Date().toISOString()),
    __VERSION__: JSON.stringify(process.env.npm_package_version || '1.0.0')
  },
  // Experimental features for better performance
  experimental: {
    renderBuiltUrl: (filename: string) => {
      // Custom logic for CDN URLs in production
      const cdnUrl = process.env.VITE_CDN_URL;
      if (cdnUrl && process.env.NODE_ENV === 'production') {
        return cdnUrl + '/' + filename;
      }
      return '/' + filename;
    }
  },
  // Enable esbuild optimizations
  esbuild: {
    // Remove console.log in production
    drop: process.env.NODE_ENV === 'production' ? ['console', 'debugger'] : [],
    // Enable top-level await
    target: 'esnext',
    // Minify identifiers
    minifyIdentifiers: process.env.NODE_ENV === 'production',
    // Minify syntax
    minifySyntax: process.env.NODE_ENV === 'production',
    // Minify whitespace
    minifyWhitespace: process.env.NODE_ENV === 'production'
  }
});
