# Build Optimization Guide

This document outlines the optimizations made to reduce build time and memory usage for production deployments.

## Changes Made

### 1. Code Splitting & Lazy Loading
- Converted all screen imports to lazy loading using `React.lazy()`
- Added Suspense wrapper with loading spinner
- This reduces initial bundle size significantly

### 2. Build Configuration
- Added CRACO for webpack customization
- Disabled source maps in production (`GENERATE_SOURCEMAP=false`)
- Disabled inline runtime chunk (`INLINE_RUNTIME_CHUNK=false`)
- Increased Node.js memory limit (`NODE_OPTIONS=--max-old-space-size=4096`)
- Added console.log removal in production builds

### 3. Vercel Configuration
- Created `vercel.json` with optimized build settings
- Added memory optimization environment variables
- Configured caching headers for static assets

### 4. Dependency Optimization
- Removed unused `react-file-viewer` dependency
- Removed `package-lock.json` to avoid yarn/npm conflicts
- Added build analysis tools

### 5. Tailwind CSS Optimization
- Disabled unused core plugins to reduce CSS bundle size
- Kept only essential features enabled

### 6. Image Optimization
- Identified 34 large images (>100KB)
- Largest image: `chatbot-icon.png` (1.4MB)
- Created script to identify optimization candidates

## Build Commands

```bash
# Standard build with optimizations
yarn build

# Build with bundle analysis
yarn build:analyze

# Check for large images
yarn check-images

# Clean build directory
yarn clean
```

## Memory Usage Optimization

The build process now uses:
- 4GB memory limit (up from default ~1.5GB)
- Disabled source map generation
- Optimized chunk splitting
- Removed console logs in production

## Image Optimization Recommendations

Run `yarn check-images` to see large images that need optimization:

1. **Immediate Action Required:**
   - `src/images/students/chatbot-icon.png` (1.4MB) - Convert to WebP or compress heavily
   - `src/images/register/slider*.png` (400-470KB each) - Compress these images
   - `src/images/students/Group*.png` (250-300KB each) - Optimize

2. **Tools to Use:**
   - [TinyPNG](https://tinypng.com/) - Online PNG compression
   - [Squoosh](https://squoosh.app/) - Google's image optimization tool
   - [ImageOptim](https://imageoptim.com/) - Mac app for image optimization

3. **Format Recommendations:**
   - Convert PNG to WebP for 25-50% size reduction
   - Use JPEG for photos, PNG for graphics with transparency
   - Implement responsive images with different sizes

## Performance Impact

Expected improvements:
- **Build Time:** 30-50% reduction
- **Bundle Size:** 20-40% reduction with lazy loading
- **Memory Usage:** Reduced from OOM to successful builds
- **Initial Load:** Faster due to code splitting

## Monitoring

Monitor your builds for:
- Build completion time
- Memory usage during build
- Bundle size in production
- Runtime performance metrics

## Next Steps

1. **Immediate:** Deploy with current optimizations
2. **Short-term:** Optimize the large images identified
3. **Long-term:** Implement progressive loading and service workers
