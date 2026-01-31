# Performance Optimizations

This document outlines the performance optimizations implemented for the Buzz chat application.

## 📦 Bundle Optimization

### Code Splitting
The application now uses manual chunk splitting to improve caching and reduce initial bundle size:

| Chunk | Contents | Gzip Size |
|-------|----------|-----------|
| `vendor-react` | React, React DOM, React Router | ~65 KB |
| `vendor-animation` | Framer Motion | ~36 KB |
| `vendor-firebase` | Firebase SDK | ~151 KB |
| `vendor-ui` | Headless UI, Heroicons, Emoji Picker | ~76 KB |
| `vendor-state` | Zustand | ~0.4 KB |
| `Home` | Main chat application | ~44 KB |
| `index` | Core app code | ~9 KB |

### Route-Based Code Splitting
Pages are lazy-loaded using React's `lazy()` and `Suspense`:

```tsx
const Home = lazy(() => import('./pages/Home.tsx'))
const SignIn = lazy(() => import('./pages/SignIn.tsx'))
const SignUp = lazy(() => import('./pages/SignUp.tsx'))
```

This means users only download the code they need:
- Unauthenticated users only load auth pages initially
- The full chat app loads after authentication

## 🖼️ Image Optimization

### OptimizedImage Component
Located at `src/components/ui/OptimizedImage.tsx`

Features:
- **Intersection Observer lazy loading** - Images only load when near viewport
- **Blur placeholder** - Shows blurred placeholder during load
- **Smooth fade-in animation** - Graceful appearance on load
- **Error handling** - Displays fallback UI on load failure
- **Configurable root margin** - Preload images before they're visible

Usage:
```tsx
import { OptimizedImage } from './components/ui/OptimizedImage';

<OptimizedImage 
  src="/path/to/image.jpg"
  alt="Description"
  placeholder="/tiny-placeholder.jpg"
  blurAmount={20}
  rootMargin="200px"
  className="w-full h-48 rounded-lg"
/>
```

### Utility Functions
- `useBlurPlaceholder(src)` - Generate blur placeholder from image
- `preloadImage(src)` - Preload a single image
- `preloadImages(srcs)` - Preload multiple images in parallel

## 📜 Message Virtualization

### VirtualizedMessages Component
Located at `src/components/chat/chat-sections/VirtualizedMessages.tsx`

For chats with 100+ messages, uses TanStack Virtual for windowed rendering:

Features:
- **Windowed rendering** - Only renders visible messages + overscan
- **Dynamic height estimation** - Handles varying message sizes
- **Auto-scroll** - Maintains scroll position for new messages
- **Search integration** - Scrolls to search results
- **"Scroll to bottom" button** - Quick navigation for long chats
- **Automatic fallback** - Uses regular rendering for small lists

Configuration:
```tsx
// Threshold for enabling virtualization
const VIRTUALIZATION_THRESHOLD = 100;

// Number of extra items to render above/below viewport
overscan: 10
```

## 📊 Bundle Analysis

Run bundle analysis to identify optimization opportunities:

```bash
npm run build:analyze
```

This generates `dist/stats.html` with interactive treemap visualization showing:
- Module sizes (raw, gzip, brotli)
- Chunk composition
- Dependency relationships

## 🚀 Performance Tips

### For Developers

1. **Lazy load heavy components**
   ```tsx
   const HeavyComponent = lazy(() => import('./HeavyComponent'));
   ```

2. **Use memo for expensive renders**
   ```tsx
   const MemoizedComponent = React.memo(ExpensiveComponent);
   ```

3. **Avoid inline functions in JSX**
   ```tsx
   // ❌ Bad - creates new function each render
   <button onClick={() => handleClick(id)}>

   // ✅ Good - use useCallback
   const onClick = useCallback(() => handleClick(id), [id]);
   <button onClick={onClick}>
   ```

4. **Use OptimizedImage for chat images**
   - Especially important for image-heavy chats
   - Reduces initial page weight significantly

### For Production

1. **Enable HTTP/2** - Allows parallel chunk loading
2. **Set Cache-Control headers** - Long cache for vendor chunks (they rarely change)
3. **Use CDN** - For static assets and chunks
4. **Enable Brotli compression** - Better than gzip for text assets

## 📈 Metrics to Monitor

- **First Contentful Paint (FCP)** - Should be < 1.5s
- **Largest Contentful Paint (LCP)** - Should be < 2.5s
- **Time to Interactive (TTI)** - Should be < 3.5s
- **Cumulative Layout Shift (CLS)** - Should be < 0.1

Use Chrome DevTools Lighthouse or WebPageTest.org to measure these.

## 🎯 Core Web Vitals Optimization

### FCP/LCP Improvements Implemented

1. **Preconnect Hints** (in `index.html`)
   ```html
   <link rel="preconnect" href="https://firestore.googleapis.com" crossorigin>
   <link rel="preconnect" href="https://fonts.googleapis.com">
   <link rel="preconnect" href="https://fonts.gstatic.com" crossorigin>
   ```
   - Establishes early connections to critical domains
   - Reduces DNS lookup and TLS handshake time

2. **Font Preloading**
   ```html
   <link rel="preload" href="https://fonts.googleapis.com/css2?family=Nunito:wght@400;500;600;700&display=swap" as="style">
   ```
   - Fonts load in parallel with CSS
   - `display=swap` prevents FOIT (Flash of Invisible Text)

3. **Critical CSS Inlining**
   - Skeleton loader styles inlined in `<head>`
   - Users see loading state immediately (no render-blocking CSS wait)

4. **Auth Loading Skeleton** (`ProtectedRoute.tsx`)
   - Shows skeleton UI during Firebase auth check
   - Prevents blank screen that hurts LCP

5. **Console Removal in Production** (`vite.config.ts`)
   ```ts
   esbuild: {
     drop: ['console', 'debugger'],
   }
   ```
   - Removes console.log calls from production build
   - Slightly reduces bundle size

### Avoiding Render-Blocking Resources

- ❌ Don't use `@import` in CSS for fonts
- ✅ Use `<link rel="preload">` in HTML instead
- ❌ Don't load Firebase synchronously before render
- ✅ Use code splitting to defer Firebase loading

