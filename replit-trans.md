# Replit to Local Development Translation Guide

This document explains how to run Replit projects locally while maintaining full compatibility with Replit's hosting environment.

## Problem Overview

Replit projects are designed for their specific environment with:
- Specialized networking configuration (`0.0.0.0:port` with reusePort)
- Replit-specific Vite plugins (`@replit/vite-plugin-cartographer`, `@replit/vite-plugin-runtime-error-modal`)
- Environment variables and detection (`REPL_ID`)
- Node.js compatibility issues on local machines

## Solution: Environment-Aware Configuration

### 1. Server Configuration (server/index.ts)

**Problem**: `ENOTSUP: operation not supported on socket` error when binding to `0.0.0.0`

**Solution**: Use conditional server binding based on environment:

```typescript
// Use different binding for local development vs production
if (process.env.NODE_ENV === "development") {
  server.listen(port, "127.0.0.1", () => {
    log(`serving on port ${port}`);
  });
} else {
  server.listen({
    port,
    host: "0.0.0.0",
    reusePort: true,
  }, () => {
    log(`serving on port ${port}`);
  });
}
```

**Why this works**:
- Local: `127.0.0.1` avoids Node.js v23+ IPv6 binding issues
- Replit: `0.0.0.0` with `reusePort` for their container environment

### 2. Vite Configuration (vite.config.ts)

**Problem**: Replit plugins fail to load in local environment

**Solution**: Conditional plugin loading:

```typescript
export default defineConfig({
  plugins: [
    react(),
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
  // ... rest of config
});
```

**Why this works**:
- `REPL_ID` is only present in Replit environment
- Plugins load conditionally without breaking local development

### 3. Environment Variables (.env)

**Required for local development**:

```env
SESSION_SECRET=your-session-secret-here
NODE_ENV=development
PORT=5000
```

**Note**: Use the same `SESSION_SECRET` from Replit's environment variables.

## Quick Setup Steps

1. **Copy these files from a working example** (see `external examples/` directory):
   - Modified `server/index.ts` with conditional binding
   - Modified `vite.config.ts` with conditional plugins
   - Create `.env` with required variables

2. **Install dependencies**: `npm install`

3. **Run development server**: `npm run dev`

4. **Verify**: Server should start on `http://127.0.0.1:5000`

## Key Principles

1. **Environment Detection**: Use `process.env.REPL_ID` to detect Replit environment
2. **Conditional Configuration**: Different settings for local vs. Replit
3. **Maintain Compatibility**: Original Replit configuration preserved for production
4. **No Breaking Changes**: Local modifications don't affect Replit deployment

## Common Issues & Solutions

### Issue: `tsx: command not found`
**Solution**: Run `npm install` to install dependencies

### Issue: Port binding errors (`ENOTSUP`, `EADDRINUSE`)
**Solution**: 
- Use `127.0.0.1` for local development
- Check no other processes using port 5000: `lsof -i :5000`

### Issue: Replit plugins not found locally
**Solution**: Conditional loading based on `REPL_ID` environment variable

### Issue: Environment variables missing
**Solution**: Create `.env` file with required variables from Replit secrets

## Testing the Setup

1. **Local Development**: `npm run dev` → `http://127.0.0.1:5000`
2. **Replit Deploy**: Should work without changes using original configuration
3. **Both Environments**: Newsletter signup, API endpoints, static assets

## Files Modified

- `server/index.ts` - Conditional server binding
- `vite.config.ts` - Conditional plugin loading  
- `.env` - Local environment variables
- `replit-trans.md` - This documentation

## Maintenance Notes

- Keep original Replit configuration for production compatibility
- Test both environments when making server changes
- Update this guide if new Replit features are added
- Consider this pattern for other Replit projects

---

*Last updated: September 2025*