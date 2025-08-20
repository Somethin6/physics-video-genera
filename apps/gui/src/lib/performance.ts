// Performance monitoring and optimization utilities
export class PerformanceMonitor {
  private metrics: Map<string, number[]> = new Map()
  private observers: Map<string, PerformanceObserver> = new Map()

  constructor() {
    this.initializeObservers()
  }

  private initializeObservers() {
    // Monitor navigation timing
    if ('performance' in window && 'getEntriesByType' in performance) {
      const navObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('navigation', entry.duration)
        }
      })
      navObserver.observe({ entryTypes: ['navigation'] })
      this.observers.set('navigation', navObserver)

      // Monitor resource loading
      const resourceObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('resource', entry.duration)
        }
      })
      resourceObserver.observe({ entryTypes: ['resource'] })
      this.observers.set('resource', resourceObserver)

      // Monitor long tasks
      const longTaskObserver = new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.recordMetric('longtask', entry.duration)
          console.warn(`Long task detected: ${entry.duration}ms`)
        }
      })
      longTaskObserver.observe({ entryTypes: ['longtask'] })
      this.observers.set('longtask', longTaskObserver)
    }
  }

  recordMetric(name: string, value: number) {
    if (!this.metrics.has(name)) {
      this.metrics.set(name, [])
    }
    const values = this.metrics.get(name)!
    values.push(value)
    
    // Keep only last 100 measurements
    if (values.length > 100) {
      values.shift()
    }
  }

  getMetrics(name: string) {
    const values = this.metrics.get(name) || []
    if (values.length === 0) return null

    const sorted = [...values].sort((a, b) => a - b)
    return {
      count: values.length,
      min: sorted[0],
      max: sorted[sorted.length - 1],
      avg: values.reduce((sum, val) => sum + val, 0) / values.length,
      p50: sorted[Math.floor(sorted.length * 0.5)],
      p90: sorted[Math.floor(sorted.length * 0.9)],
      p95: sorted[Math.floor(sorted.length * 0.95)],
    }
  }

  getAllMetrics() {
    const result: Record<string, any> = {}
    for (const [name] of this.metrics) {
      result[name] = this.getMetrics(name)
    }
    return result
  }

  measure<T>(name: string, fn: () => T): T {
    const start = performance.now()
    try {
      return fn()
    } finally {
      const end = performance.now()
      this.recordMetric(name, end - start)
    }
  }

  async measureAsync<T>(name: string, fn: () => Promise<T>): Promise<T> {
    const start = performance.now()
    try {
      return await fn()
    } finally {
      const end = performance.now()
      this.recordMetric(name, end - start)
    }
  }

  dispose() {
    for (const [name, observer] of this.observers) {
      observer.disconnect()
    }
    this.observers.clear()
    this.metrics.clear()
  }
}

// Performance optimization utilities
export class PerformanceOptimizer {
  private imageCache = new Map<string, HTMLImageElement>()
  private fetchCache = new Map<string, Promise<Response>>()

  // Lazy load images with intersection observer
  lazyLoadImage(img: HTMLImageElement, src: string): Promise<void> {
    return new Promise((resolve, reject) => {
      if (this.imageCache.has(src)) {
        img.src = src
        resolve()
        return
      }

      if ('IntersectionObserver' in window) {
        const observer = new IntersectionObserver((entries) => {
          entries.forEach((entry) => {
            if (entry.isIntersecting) {
              const image = new Image()
              image.onload = () => {
                this.imageCache.set(src, image)
                img.src = src
                observer.disconnect()
                resolve()
              }
              image.onerror = () => {
                observer.disconnect()
                reject(new Error(`Failed to load image: ${src}`))
              }
              image.src = src
            }
          })
        })
        observer.observe(img)
      } else {
        // Fallback for browsers without intersection observer
        img.src = src
        img.onload = () => resolve()
        img.onerror = () => reject(new Error(`Failed to load image: ${src}`))
      }
    })
  }

  // Debounced function
  debounce<T extends (...args: any[]) => any>(
    func: T,
    wait: number
  ): (...args: Parameters<T>) => void {
    let timeout: NodeJS.Timeout
    return (...args: Parameters<T>) => {
      clearTimeout(timeout)
      timeout = setTimeout(() => func(...args), wait)
    }
  }

  // Throttled function
  throttle<T extends (...args: any[]) => any>(
    func: T,
    limit: number
  ): (...args: Parameters<T>) => void {
    let inThrottle: boolean
    return (...args: Parameters<T>) => {
      if (!inThrottle) {
        func(...args)
        inThrottle = true
        setTimeout(() => (inThrottle = false), limit)
      }
    }
  }

  // Cached fetch with TTL
  cachedFetch(url: string, options?: RequestInit, ttl: number = 300000): Promise<Response> {
    const cacheKey = `${url}-${JSON.stringify(options)}`
    
    if (this.fetchCache.has(cacheKey)) {
      return this.fetchCache.get(cacheKey)!
    }

    const fetchPromise = fetch(url, options)
    this.fetchCache.set(cacheKey, fetchPromise)

    // Clear cache after TTL
    setTimeout(() => {
      this.fetchCache.delete(cacheKey)
    }, ttl)

    return fetchPromise
  }

  // Bundle splitting and code splitting helpers
  dynamicImport<T>(moduleFactory: () => Promise<{ default: T }>): Promise<T> {
    return moduleFactory().then(module => module.default)
  }

  // Preload critical resources
  preloadResource(href: string, as: string): void {
    const link = document.createElement('link')
    link.rel = 'preload'
    link.href = href
    link.as = as
    document.head.appendChild(link)
  }

  // Memory management
  clearUnusedCache(): void {
    // Clear image cache if too large
    if (this.imageCache.size > 100) {
      const entries = Array.from(this.imageCache.entries())
      // Remove oldest 50% of entries
      for (let i = 0; i < entries.length / 2; i++) {
        this.imageCache.delete(entries[i][0])
      }
    }

    // Clear fetch cache if too large
    if (this.fetchCache.size > 50) {
      const entries = Array.from(this.fetchCache.entries())
      for (let i = 0; i < entries.length / 2; i++) {
        this.fetchCache.delete(entries[i][0])
      }
    }
  }
}

// Web Vitals monitoring
export class WebVitalsMonitor {
  private vitals: Map<string, number> = new Map()

  constructor() {
    this.initializeWebVitals()
  }

  private initializeWebVitals() {
    // Monitor Largest Contentful Paint (LCP)
    if ('PerformanceObserver' in window) {
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          this.vitals.set('LCP', entry.startTime)
        }
      }).observe({ entryTypes: ['largest-contentful-paint'] })

      // Monitor First Input Delay (FID)
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          const fid = entry.processingStart - entry.startTime
          this.vitals.set('FID', fid)
        }
      }).observe({ entryTypes: ['first-input'] })

      // Monitor Cumulative Layout Shift (CLS)
      let clsValue = 0
      new PerformanceObserver((list) => {
        for (const entry of list.getEntries()) {
          if (!entry.hadRecentInput) {
            clsValue += entry.value
            this.vitals.set('CLS', clsValue)
          }
        }
      }).observe({ entryTypes: ['layout-shift'] })
    }
  }

  getVitals() {
    return Object.fromEntries(this.vitals)
  }

  reportVitals() {
    const vitals = this.getVitals()
    console.log('Web Vitals:', vitals)
    
    // In production, send to analytics service
    if (process.env.NODE_ENV === 'production') {
      // analytics.track('web_vitals', vitals)
    }
  }
}

// Singleton instances
export const performanceMonitor = new PerformanceMonitor()
export const performanceOptimizer = new PerformanceOptimizer()
export const webVitalsMonitor = new WebVitalsMonitor()

// Hook for React components
export function usePerformanceMonitor() {
  return {
    measure: performanceMonitor.measure.bind(performanceMonitor),
    measureAsync: performanceMonitor.measureAsync.bind(performanceMonitor),
    getMetrics: performanceMonitor.getMetrics.bind(performanceMonitor),
    recordMetric: performanceMonitor.recordMetric.bind(performanceMonitor),
  }
}