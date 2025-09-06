import { defineConfig } from "vite";
import react from "@vitejs/plugin-react";
import path from "path";
import runtimeErrorOverlay from "@replit/vite-plugin-runtime-error-modal";

export default defineConfig({
  plugins: [
    react({
      // Optimize React Fast Refresh
      fastRefresh: true,
    }),
    // Performance optimization plugins will be handled via rollupOptions
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
    target: 'esnext',
    minify: 'esbuild',
    sourcemap: false, // Disable sourcemaps in production for smaller bundles
    cssCodeSplit: true, // Enable CSS code splitting
    // Chunk size optimization
    rollupOptions: {
      output: {
        // Manual chunk splitting for better caching
        manualChunks: {
          // React ecosystem
          'react-vendor': ['react', 'react-dom'],
          // UI libraries
          'ui-vendor': [
            '@radix-ui/react-dialog',
            '@radix-ui/react-slot',
            '@radix-ui/react-tooltip',
            'framer-motion'
          ],
          // Icons and utilities
          'utils-vendor': [
            'lucide-react',
            'react-icons',
            'clsx',
            'tailwind-merge'
          ],
          // Query and state management
          'data-vendor': [
            '@tanstack/react-query',
            'wouter'
          ]
        },
        // Optimize chunk names
        chunkFileNames: (chunkInfo) => {
          const facadeModuleId = chunkInfo.facadeModuleId
            ? chunkInfo.facadeModuleId.split('/').pop().replace(/\.[^.]*$/, '')
            : 'chunk';
          return `assets/${facadeModuleId}-[hash].js`;
        },
        // Optimize asset names
        assetFileNames: (assetInfo) => {
          const info = assetInfo.name.split('.');
          const ext = info[info.length - 1];
          if (/png|jpe?g|svg|gif|tiff|bmp|ico/i.test(ext)) {
            return `assets/images/[name]-[hash].${ext}`;
          }
          if (ext === 'css') {
            return `assets/css/[name]-[hash].${ext}`;
          }
          return `assets/[name]-[hash].${ext}`;
        }
      },
      // External dependencies (don't bundle these)
      external: [
        // Add any CDN dependencies here
      ]
    },
    // Compression and optimization
    reportCompressedSize: true,
    chunkSizeWarningLimit: 1000, // Warn for chunks larger than 1MB
    assetsInlineLimit: 4096 // Inline assets smaller than 4KB
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
    // Pre-transform known dependencies
    optimizeDeps: {
      include: [
        'react',
        'react-dom',
        'framer-motion',
        '@tanstack/react-query',
        'lucide-react',
        'react-icons/si',
        'wouter'
      ],
      // Exclude problematic dependencies
      exclude: ['@replit/vite-plugin-runtime-error-modal']
    },
  },
  // CSS optimization
  css: {
    devSourcemap: process.env.NODE_ENV === 'development',
    // PostCSS optimizations will be handled by Tailwind
  },
  // Performance monitoring in development
  define: {
    __DEV__: process.env.NODE_ENV === 'development',
    __PERFORMANCE_MONITORING__: process.env.NODE_ENV === 'production'
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
