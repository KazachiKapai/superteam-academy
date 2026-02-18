module.exports = {
  ci: {
    collect: {
      // Run against the built Next.js app
      startServerCommand: "npm run start",
      startServerReadyPattern: "Ready in",
      startServerReadyTimeout: 30000,
      url: ["http://localhost:3000/", "http://localhost:3000/roadmaps"],
      numberOfRuns: 3,
      settings: {
        preset: "desktop",
        // Throttle to simulate real-world conditions
        throttling: {
          cpuSlowdownMultiplier: 2,
        },
      },
    },
    assert: {
      assertions: {
        // Performance: 90+
        "categories:performance": ["error", { minScore: 0.9 }],
        // Accessibility: 95+
        "categories:accessibility": ["error", { minScore: 0.95 }],
        // Best Practices: 95+
        "categories:best-practices": ["error", { minScore: 0.95 }],
        // SEO: 90+
        "categories:seo": ["error", { minScore: 0.9 }],
        // Core Web Vitals
        "largest-contentful-paint": ["error", { maxNumericValue: 2500 }],
        "total-blocking-time": ["error", { maxNumericValue: 200 }],
        "cumulative-layout-shift": ["error", { maxNumericValue: 0.1 }],
        // Bundle size guards
        "total-byte-weight": ["warn", { maxNumericValue: 1500000 }],
        // Image optimization
        "uses-webp-images": "warn",
        "uses-optimized-images": "warn",
        // Text compression
        "uses-text-compression": "error",
        // Render-blocking resources
        "render-blocking-resources": "warn",
      },
    },
    upload: {
      // Use temporary public storage (no server needed)
      target: "temporary-public-storage",
    },
  },
};
