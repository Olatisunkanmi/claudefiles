---
name: i-optimize
description: 'Use when the user says: "optimize frontend performance", "improve load time", "fix rendering". Improve frontend performance and rendering efficiency.'
user-invocable: true
---

Identify and fix performance issues to create faster, smoother user experiences.

## MANDATORY PREPARATION

Read `~/.claude/skills/i-frontend-design/SKILL.md` for design principles, anti-patterns, and the **Context Gathering Protocol**. Follow the protocol before proceeding — if no design context exists yet, you MUST run /i-teach-impeccable first.

---

## Assess Performance Issues

Understand current performance and identify problems:

1. **Measure current state**:
   - **Core Web Vitals**: LCP, FID/INP, CLS scores
   - **Load time**: Time to interactive, first contentful paint
   - **Bundle size**: JavaScript, CSS, image sizes
   - **Runtime performance**: Frame rate, memory usage, CPU usage
   - **Network**: Request count, payload sizes, waterfall

2. **Identify bottlenecks**:
   - What's slow? (Initial load? Interactions? Animations?)
   - What's causing it? (Large images? Expensive JavaScript? Layout thrashing?)
   - How bad is it? (Perceivable? Annoying? Blocking?)
   - Who's affected? (All users? Mobile only? Slow connections?)

**CRITICAL**: Measure before and after. Premature optimization wastes time. Optimize what actually matters.

---

## Propose Changes

After analyzing the current state, present your proposed changes to the user:

1. **Assessment**: What's wrong and why (your domain analysis above)
2. **Proposed changes**: Specific changes ranked by impact, with rationale
3. **Verification plan**: What to check after implementation (LLM self-check items + Playwright verification if available)

Then STOP and confirm before implementing:

```
AskUserQuestion:
  question: "Here's what I propose. How would you like to proceed?"
  header: "Confirm"
  options:
    - label: "Implement"
      description: "Looks good — go ahead and make these changes."
    - label: "Refine scope"
      description: "I want to adjust what's included before you start."
    - label: "Challenge this first"
      description: "I'll run /mine.challenge against your proposal before we proceed."
    - label: "Stop here"
      description: "Don't implement anything. The proposal is in this conversation only."
```

If "Implement" → proceed to implementation below.
If "Refine scope" → ask what to change, update proposal, re-confirm.
<!-- CHALLENGE-CALLER -->
If "Challenge this first" → invoke `/mine.challenge` inline against the proposal, read findings, revise proposal, re-present this gate.
If "Stop here" → end the skill.

---

## Optimization Strategy

Create systematic improvement plan:

### Loading Performance

**Optimize Images**:
- Use modern formats (WebP, AVIF)
- Proper sizing (don't load 3000px image for 300px display)
- Lazy loading for below-fold images
- Responsive images (`srcset`, `picture` element)
- Compress images (80-85% quality is usually imperceptible)
- Use CDN for faster delivery

```html
<img 
  src="hero.webp"
  srcset="hero-400.webp 400w, hero-800.webp 800w, hero-1200.webp 1200w"
  sizes="(max-width: 400px) 400px, (max-width: 800px) 800px, 1200px"
  loading="lazy"
  alt="Hero image"
/>
```

**Reduce JavaScript Bundle**:
- Code splitting (route-based, component-based)
- Tree shaking (remove unused code)
- Remove unused dependencies
- Lazy load non-critical code
- Use dynamic imports for large components

```javascript
// Lazy load heavy component
const HeavyChart = lazy(() => import('./HeavyChart'));
```

**Optimize CSS**:
- Remove unused CSS
- Critical CSS inline, rest async
- Minimize CSS files
- Use CSS containment for independent regions

**Optimize Fonts**:
- Use `font-display: swap` or `optional`
- Subset fonts (only characters you need)
- Preload critical fonts
- Use system fonts when appropriate
- Limit font weights loaded

```css
@font-face {
  font-family: 'CustomFont';
  src: url('/fonts/custom.woff2') format('woff2');
  font-display: swap; /* Show fallback immediately */
  unicode-range: U+0020-007F; /* Basic Latin only */
}
```

**Optimize Loading Strategy**:
- Critical resources first (async/defer non-critical)
- Preload critical assets
- Prefetch likely next pages
- Service worker for offline/caching
- HTTP/2 or HTTP/3 for multiplexing

### Rendering Performance

**Avoid Layout Thrashing**:
```javascript
// ❌ Bad: Alternating reads and writes (causes reflows)
elements.forEach(el => {
  const height = el.offsetHeight; // Read (forces layout)
  el.style.height = height * 2; // Write
});

// ✅ Good: Batch reads, then batch writes
const heights = elements.map(el => el.offsetHeight); // All reads
elements.forEach((el, i) => {
  el.style.height = heights[i] * 2; // All writes
});
```

**Optimize Rendering**:
- Use CSS `contain` property for independent regions
- Minimize DOM depth (flatter is faster)
- Reduce DOM size (fewer elements)
- Use `content-visibility: auto` for long lists
- Virtual scrolling for very long lists (react-window, react-virtualized)

**Reduce Paint & Composite**:
- Use `transform` and `opacity` for animations (GPU-accelerated)
- Avoid animating layout properties (width, height, top, left)
- Use `will-change` sparingly for known expensive operations
- Minimize paint areas (smaller is faster)

### Animation Performance

**GPU Acceleration**:
```css
/* ✅ GPU-accelerated (fast) */
.animated {
  transform: translateX(100px);
  opacity: 0.5;
}

/* ❌ CPU-bound (slow) */
.animated {
  left: 100px;
  width: 300px;
}
```

**Smooth 60fps**:
- Target 16ms per frame (60fps)
- Use `requestAnimationFrame` for JS animations
- Debounce/throttle scroll handlers
- Use CSS animations when possible
- Avoid long-running JavaScript during animations

**Intersection Observer**:
```javascript
// Efficiently detect when elements enter viewport
const observer = new IntersectionObserver((entries) => {
  entries.forEach(entry => {
    if (entry.isIntersecting) {
      // Element is visible, lazy load or animate
    }
  });
});
```

### React/Framework Optimization

**React-specific**:
- Use `memo()` for expensive components
- `useMemo()` and `useCallback()` for expensive computations
- Virtualize long lists
- Code split routes
- Avoid inline function creation in render
- Use React DevTools Profiler

**Framework-agnostic**:
- Minimize re-renders
- Debounce expensive operations
- Memoize computed values
- Lazy load routes and components

### Network Optimization

**Reduce Requests**:
- Combine small files
- Use SVG sprites for icons
- Inline small critical assets
- Remove unused third-party scripts

**Optimize APIs**:
- Use pagination (don't load everything)
- GraphQL to request only needed fields
- Response compression (gzip, brotli)
- HTTP caching headers
- CDN for static assets

**Optimize for Slow Connections**:
- Adaptive loading based on connection (navigator.connection)
- Optimistic UI updates
- Request prioritization
- Progressive enhancement

## Core Web Vitals Optimization

### Largest Contentful Paint (LCP < 2.5s)
- Optimize hero images
- Inline critical CSS
- Preload key resources
- Use CDN
- Server-side rendering

### First Input Delay (FID < 100ms) / INP (< 200ms)
- Break up long tasks
- Defer non-critical JavaScript
- Use web workers for heavy computation
- Reduce JavaScript execution time

### Cumulative Layout Shift (CLS < 0.1)
- Set dimensions on images and videos
- Don't inject content above existing content
- Use `aspect-ratio` CSS property
- Reserve space for ads/embeds
- Avoid animations that cause layout shifts

```css
/* Reserve space for image */
.image-container {
  aspect-ratio: 16 / 9;
}
```

## Performance Monitoring

**Tools to use**:
- Chrome DevTools (Lighthouse, Performance panel)
- WebPageTest
- Core Web Vitals (Chrome UX Report)
- Bundle analyzers (webpack-bundle-analyzer)
- Performance monitoring (Sentry, DataDog, New Relic)

**Key metrics**:
- LCP, FID/INP, CLS (Core Web Vitals)
- Time to Interactive (TTI)
- First Contentful Paint (FCP)
- Total Blocking Time (TBT)
- Bundle size
- Request count

**IMPORTANT**: Measure on real devices with real network conditions. Desktop Chrome with fast connection isn't representative.

**NEVER**:
- Optimize without measuring (premature optimization)
- Sacrifice accessibility for performance
- Break functionality while optimizing
- Use `will-change` everywhere (creates new layers, uses memory)
- Lazy load above-fold content
- Optimize micro-optimizations while ignoring major issues (optimize the biggest bottleneck first)
- Forget about mobile performance (often slower devices, slower connections)

## Verify Improvements

Test that optimizations worked:

- **Before/after metrics**: Compare Lighthouse scores
- **Real user monitoring**: Track improvements for real users
- **Different devices**: Test on low-end Android, not just flagship iPhone
- **Slow connections**: Throttle to 3G, test experience
- **No regressions**: Ensure functionality still works
- **User perception**: Does it *feel* faster?

Remember: Performance is a feature. Fast experiences feel more responsive, more polished, more professional. Optimize systematically, measure ruthlessly, and prioritize user-perceived performance.

## Completion

After implementation, summarize in conversation:

1. **Changes made**: List each file changed and what was done
2. **Verification**: LLM self-check results (anti-pattern scan, consistency check). Note if Playwright was available for visual verification.
3. **Suggested next step**: Any follow-up skills that would complement this work (e.g., after /i-typeset, suggest /i-polish for a final pass)