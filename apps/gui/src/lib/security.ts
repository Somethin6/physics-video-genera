// Security configuration for the Physics Foundry application
export const SECURITY_CONFIG = {
  // Content Security Policy headers
  csp: {
    defaultSrc: ["'self'"],
    scriptSrc: ["'self'", "'unsafe-inline'", "'unsafe-eval'"],
    styleSrc: ["'self'", "'unsafe-inline'", "https://fonts.googleapis.com"],
    fontSrc: ["'self'", "https://fonts.gstatic.com"],
    imgSrc: ["'self'", "data:", "blob:", "https:"],
    connectSrc: ["'self'", "ws:", "wss:", "http://localhost:*", "https://api.github.com"],
    mediaSrc: ["'self'", "blob:", "data:"],
    objectSrc: ["'none'"],
    frameSrc: ["'none'"],
    baseUri: ["'self'"],
    formAction: ["'self'"],
    frameAncestors: ["'none'"],
    upgradeInsecureRequests: true,
  },

  // Input validation patterns
  validation: {
    projectName: /^[a-zA-Z0-9\s\-_]{1,100}$/,
    topicName: /^[a-zA-Z0-9\s\-_.,!?]{1,200}$/,
    fileName: /^[a-zA-Z0-9\-_\.]{1,255}$/,
    duration: { min: 10, max: 3600 }, // 10 seconds to 1 hour
    fileSize: { max: 500 * 1024 * 1024 }, // 500MB max file size
  },

  // Rate limiting configuration
  rateLimits: {
    apiRequests: { maxRequests: 100, windowMs: 60000 }, // 100 requests per minute
    fileUploads: { maxRequests: 5, windowMs: 60000 }, // 5 uploads per minute
    projectCreation: { maxRequests: 10, windowMs: 300000 }, // 10 projects per 5 minutes
  },

  // Sanitization options
  sanitization: {
    htmlTags: [], // No HTML tags allowed in user input
    attributes: [], // No attributes allowed
    allowedProtocols: ['http', 'https', 'mailto'],
  },
}

// Input sanitization function
export function sanitizeInput(input: string, type: 'text' | 'filename' | 'topic' = 'text'): string {
  if (!input || typeof input !== 'string') return ''
  
  // Remove null bytes and control characters
  let cleaned = input.replace(/[\x00-\x1F\x7F]/g, '')
  
  // Limit length based on type
  const maxLengths = { text: 1000, filename: 255, topic: 200 }
  cleaned = cleaned.slice(0, maxLengths[type])
  
  // Type-specific validation
  switch (type) {
    case 'filename':
      cleaned = cleaned.replace(/[<>:"/\\|?*]/g, '_')
      break
    case 'topic':
      // Allow basic punctuation for topics
      cleaned = cleaned.replace(/[<>]/g, '')
      break
    case 'text':
    default:
      // Remove potentially dangerous HTML/script content
      cleaned = cleaned.replace(/<script\b[^<]*(?:(?!<\/script>)<[^<]*)*<\/script>/gi, '')
      cleaned = cleaned.replace(/javascript:/gi, '')
      cleaned = cleaned.replace(/on\w+\s*=/gi, '')
      break
  }
  
  return cleaned.trim()
}

// File validation function
export function validateFile(file: File): { valid: boolean; error?: string } {
  // Check file size
  if (file.size > SECURITY_CONFIG.validation.fileSize.max) {
    return { valid: false, error: 'File size exceeds maximum allowed (500MB)' }
  }
  
  // Check file name
  if (!SECURITY_CONFIG.validation.fileName.test(file.name)) {
    return { valid: false, error: 'Invalid file name. Use only alphanumeric characters, hyphens, underscores, and dots.' }
  }
  
  // Check file extension (whitelist approach)
  const allowedExtensions = [
    '.mp4', '.mov', '.avi', '.mkv', '.webm', // Video
    '.wav', '.mp3', '.aac', '.ogg', '.flac', // Audio
    '.png', '.jpg', '.jpeg', '.webp', '.gif', // Images
    '.json', '.txt', '.md', '.csv', // Data/text
    '.zip', '.tar.gz', // Archives
  ]
  
  const fileExtension = file.name.toLowerCase().match(/\.[^.]+$/)?.[0]
  if (!fileExtension || !allowedExtensions.includes(fileExtension)) {
    return { valid: false, error: 'File type not allowed' }
  }
  
  return { valid: true }
}

// Rate limiter implementation
class RateLimiter {
  private requests: Map<string, number[]> = new Map()
  
  checkLimit(key: string, maxRequests: number, windowMs: number): boolean {
    const now = Date.now()
    const requests = this.requests.get(key) || []
    
    // Remove expired requests
    const validRequests = requests.filter(time => now - time < windowMs)
    
    // Check if limit exceeded
    if (validRequests.length >= maxRequests) {
      return false
    }
    
    // Add current request
    validRequests.push(now)
    this.requests.set(key, validRequests)
    
    return true
  }
  
  clear(key: string): void {
    this.requests.delete(key)
  }
}

export const rateLimiter = new RateLimiter()

// Security headers for development server
export const SECURITY_HEADERS = {
  'X-Content-Type-Options': 'nosniff',
  'X-Frame-Options': 'DENY',
  'X-XSS-Protection': '1; mode=block',
  'Referrer-Policy': 'strict-origin-when-cross-origin',
  'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
}

// Environment-specific security settings
export const getSecurityConfig = () => {
  const isDevelopment = process.env.NODE_ENV === 'development'
  const isProduction = process.env.NODE_ENV === 'production'
  
  return {
    ...SECURITY_CONFIG,
    enableDevTools: isDevelopment,
    strictMode: isProduction,
    reportErrors: isProduction,
    enableCSP: isProduction,
  }
}