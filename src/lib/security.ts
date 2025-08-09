// Security utilities and helpers

// Input sanitization
export function sanitizeInput(input: string): string {
  return input
    .trim()
    .replace(/[<>]/g, '') // Remove potential HTML tags
    .replace(/javascript:/gi, '') // Remove JavaScript protocol
    .replace(/on\w+\s*=/gi, '') // Remove event handlers
}

export function sanitizeHtml(html: string): string {
  const map: Record<string, string> = {
    '&': '&amp;',
    '<': '&lt;',
    '>': '&gt;',
    '"': '&quot;',
    "'": '&#039;',
  }
  
  return html.replace(/[&<>"']/g, (char) => map[char])
}

// Validation helpers
export function isValidString(input: any, minLength = 1, maxLength = 255): boolean {
  if (typeof input !== 'string') return false
  const trimmed = input.trim()
  return trimmed.length >= minLength && trimmed.length <= maxLength
}

export function isValidNumber(input: any, min?: number, max?: number): boolean {
  if (typeof input !== 'number' && typeof input !== 'string') return false
  const num = Number(input)
  if (isNaN(num)) return false
  if (min !== undefined && num < min) return false
  if (max !== undefined && num > max) return false
  return true
}

export function isValidEmail(input: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(input)
}

export function isValidPhone(input: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(input)
}

// XSS Prevention
export function preventXSS(input: string): string {
  return input
    .replace(/&/g, '&amp;')
    .replace(/</g, '&lt;')
    .replace(/>/g, '&gt;')
    .replace(/"/g, '&quot;')
    .replace(/'/g, '&#039;')
    .replace(/javascript:/gi, '')
    .replace(/on\w+\s*=/gi, '')
}

// CSRF Protection
export function generateCSRFToken(): string {
  return Array.from(crypto.getRandomValues(new Uint8Array(32)))
    .map(b => b.toString(16).padStart(2, '0'))
    .join('')
}

export function validateCSRFToken(token: string, sessionToken: string): boolean {
  return token === sessionToken && token.length === 64
}

// Rate limiting
interface RateLimitData {
  count: number
  resetTime: number
  blockedUntil?: number
}

const rateLimitStore = new Map<string, RateLimitData>()

export function checkRateLimit(
  key: string,
  maxRequests: number,
  windowMs: number
): { allowed: boolean; remaining: number; resetTime: number } {
  const now = Date.now()
  const data = rateLimitStore.get(key)
  
  // Check if IP is blocked due to excessive attempts
  if (data && data.blockedUntil && now < data.blockedUntil) {
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.blockedUntil,
    }
  }
  
  if (!data || now > data.resetTime) {
    // New window
    const newData: RateLimitData = {
      count: 1,
      resetTime: now + windowMs,
    }
    rateLimitStore.set(key, newData)
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newData.resetTime,
    }
  }
  
  if (data.count >= maxRequests) {
    // Block the IP for 5 minutes if rate limit is exceeded
    data.blockedUntil = now + (5 * 60 * 1000)
    rateLimitStore.set(key, data)
    
    return {
      allowed: false,
      remaining: 0,
      resetTime: data.blockedUntil,
    }
  }
  
  // Increment count
  data.count++
  rateLimitStore.set(key, data)
  
  return {
    allowed: true,
    remaining: maxRequests - data.count,
    resetTime: data.resetTime,
  }
}

// Security headers
export function getSecurityHeaders(): Record<string, string> {
  return {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
}

// Password security
export function isStrongPassword(password: string): {
  isStrong: boolean
  score: number
  feedback: string[]
} {
  const feedback: string[] = []
  let score = 0
  
  // Length check
  if (password.length < 8) {
    feedback.push('A senha deve ter pelo menos 8 caracteres')
  } else {
    score += 1
  }
  
  // Uppercase check
  if (!/[A-Z]/.test(password)) {
    feedback.push('A senha deve conter letras maiúsculas')
  } else {
    score += 1
  }
  
  // Lowercase check
  if (!/[a-z]/.test(password)) {
    feedback.push('A senha deve conter letras minúsculas')
  } else {
    score += 1
  }
  
  // Number check
  if (!/\d/.test(password)) {
    feedback.push('A senha deve conter números')
  } else {
    score += 1
  }
  
  // Special character check
  if (!/[!@#$%^&*(),.?":{}|<>]/.test(password)) {
    feedback.push('A senha deve conter caracteres especiais')
  } else {
    score += 1
  }
  
  // Common patterns check
  const commonPatterns = [
    /123456/, /password/, /qwerty/, /abc123/,
    /admin/, /letmein/, /welcome/, /monkey/,
  ]
  
  if (commonPatterns.some(pattern => pattern.test(password.toLowerCase()))) {
    feedback.push('A senha contém padrões muito comuns')
    score -= 1
  }
  
  return {
    isStrong: score >= 4,
    score: Math.max(0, score),
    feedback,
  }
}

export function hashPassword(password: string): Promise<string> {
  // In a real app, use bcrypt or argon2
  // This is a placeholder for demonstration
  return new Promise((resolve) => {
    setTimeout(() => {
      resolve(btoa(password + 'salt')) // Not secure, just for demo
    }, 0)
  })
}

// File upload security
export function validateFileUpload(
  file: File,
  allowedTypes: string[],
  maxSize: number // in bytes
): { valid: boolean; error?: string } {
  // Check file type
  if (!allowedTypes.includes(file.type)) {
    return {
      valid: false,
      error: `Tipo de arquivo não permitido. Tipos permitidos: ${allowedTypes.join(', ')}`,
    }
  }
  
  // Check file size
  if (file.size > maxSize) {
    return {
      valid: false,
      error: `Arquivo muito grande. Tamanho máximo: ${maxSize / 1024 / 1024}MB`,
    }
  }
  
  // Check file name for suspicious patterns
  const fileName = file.name.toLowerCase()
  if (fileName.includes('..') || fileName.includes('/') || fileName.includes('\\')) {
    return {
      valid: false,
      error: 'Nome de arquivo inválido',
    }
  }
  
  return { valid: true }
}

// API security
export function validateApiKey(apiKey: string): boolean {
  // In a real app, validate against stored API keys
  return apiKey.length === 32 && /^[a-zA-Z0-9]+$/.test(apiKey)
}

export function generateSecureToken(length = 32): string {
  const chars = 'ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789'
  const randomArray = new Uint8Array(length)
  crypto.getRandomValues(randomArray)
  
  return Array.from(randomArray, (byte) => chars[byte % chars.length]).join('')
}

// Session security
export function validateSession(session: any): boolean {
  if (!session || typeof session !== 'object') return false
  if (!session.id || !session.userId || !session.expiresAt) return false
  if (new Date() > new Date(session.expiresAt)) return false
  return true
}

// Environment validation
export function validateEnvironment(): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  const requiredEnvVars = [
    'DATABASE_URL',
    'NEXTAUTH_SECRET',
    'NEXTAUTH_URL',
  ]
  
  requiredEnvVars.forEach(envVar => {
    if (!process.env[envVar]) {
      errors.push(`Variável de ambiente obrigatória ausente: ${envVar}`)
    }
  })
  
  // Check for development/production specific settings
  if (process.env.NODE_ENV === 'production') {
    if (!process.env.DATABASE_URL?.includes('ssl')) {
      errors.push('DATABASE_URL deve usar SSL em produção')
    }
    
    if (process.env.NEXTAUTH_SECRET?.length < 32) {
      errors.push('NEXTAUTH_SECRET deve ter pelo menos 32 caracteres em produção')
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Logging security
export function sanitizeLogData(data: any): any {
  if (typeof data !== 'object' || data === null) return data
  
  const sensitiveFields = [
    'password',
    'token',
    'secret',
    'key',
    'authorization',
    'credit_card',
    'ssn',
    'cpf',
  ]
  
  const sanitized = { ...data }
  
  Object.keys(sanitized).forEach(key => {
    if (sensitiveFields.some(field => key.toLowerCase().includes(field))) {
      sanitized[key] = '[REDACTED]'
    }
  })
  
  return sanitized
}

// Error handling security
export class SecurityError extends Error {
  constructor(
    message: string,
    public code: string,
    public statusCode: number = 500
  ) {
    super(message)
    this.name = 'SecurityError'
  }
}

export function handleSecurityError(error: unknown): { message: string; code: string; statusCode: number } {
  if (error instanceof SecurityError) {
    return {
      message: error.message,
      code: error.code,
      statusCode: error.statusCode,
    }
  }
  
  return {
    message: 'Erro de segurança desconhecido',
    code: 'UNKNOWN_SECURITY_ERROR',
    statusCode: 500,
  }
}

// Additional security improvements

// SQL Injection Prevention
export function preventSQLInjection(input: string): string {
  const sqlPattern = /(\b(SELECT|INSERT|UPDATE|DELETE|DROP|UNION|CREATE|ALTER|EXEC|EXECUTE|TRUNCATE)\b)|(;)|(''|""|''|""|\\')/gi
  return input.replace(sqlPattern, '')
}

// Path Traversal Prevention
export function preventPathTraversal(input: string): string {
  return input.replace(/\.\./g, '').replace(/\//g, '').replace(/\\/g, '')
}

// Request Validation
export function validateRequest(request: Request): { valid: boolean; error?: string } {
  // Check for suspicious headers
  const suspiciousHeaders = ['x-forwarded-for', 'x-real-ip', 'x-forwarded-host']
  const headers = Object.keys(Object.fromEntries(request.headers))
  
  for (const header of headers) {
    if (suspiciousHeaders.includes(header.toLowerCase())) {
      return {
        valid: false,
        error: 'Header suspeito detectado',
      }
    }
  }
  
  // Check for suspicious user agents
  const userAgent = request.headers.get('user-agent') || ''
  const suspiciousUserAgents = [
    'bot', 'crawler', 'spider', 'scanner', 'test',
  ]
  
  if (suspiciousUserAgents.some(pattern => userAgent.toLowerCase().includes(pattern))) {
    return {
      valid: false,
      error: 'User agent suspeito detectado',
    }
  }
  
  return { valid: true }
}

// Session Security
export function createSecureSession(): { sessionId: string; expiresAt: Date } {
  const sessionId = generateSecureToken(64)
  const expiresAt = new Date(Date.now() + 24 * 60 * 60 * 1000) // 24 hours
  
  return {
    sessionId,
    expiresAt,
  }
}

export function validateSessionSecurity(session: any): { valid: boolean; error?: string } {
  if (!session || typeof session !== 'object') {
    return { valid: false, error: 'Sessão inválida' }
  }
  
  if (!session.sessionId || !session.userId || !session.expiresAt) {
    return { valid: false, error: 'Dados da sessão incompletos' }
  }
  
  if (new Date() > new Date(session.expiresAt)) {
    return { valid: false, error: 'Sessão expirada' }
  }
  
  // Check for session hijacking
  if (session.ipAddress && session.userAgent) {
    const currentRequest = typeof window !== 'undefined' ? {
      ip: 'client-ip', // In real app, get from request
      userAgent: navigator.userAgent,
    } : null
    
    if (currentRequest && 
        (session.ipAddress !== currentRequest.ip || 
         session.userAgent !== currentRequest.userAgent)) {
      return { valid: false, error: 'Possível sequestro de sessão' }
    }
  }
  
  return { valid: true }
}

// Input Validation for Forms
export function validateFormInput(input: any, rules: any): { valid: boolean; errors: string[] } {
  const errors: string[] = []
  
  for (const [field, rule] of Object.entries(rules)) {
    const value = input[field]
    
    // Required validation
    if (rule.required && (!value || value.toString().trim() === '')) {
      errors.push(`${field} é obrigatório`)
      continue
    }
    
    // Skip other validations if field is empty and not required
    if (!value || value.toString().trim() === '') {
      continue
    }
    
    // Type validation
    if (rule.type) {
      switch (rule.type) {
        case 'email':
          if (!isValidEmail(value.toString())) {
            errors.push(`${field} deve ser um email válido`)
          }
          break
        case 'phone':
          if (!isValidPhone(value.toString())) {
            errors.push(`${field} deve ser um telefone válido`)
          }
          break
        case 'number':
          if (isNaN(Number(value))) {
            errors.push(`${field} deve ser um número`)
          }
          break
      }
    }
    
    // Length validation
    if (rule.minLength && value.toString().length < rule.minLength) {
      errors.push(`${field} deve ter pelo menos ${rule.minLength} caracteres`)
    }
    
    if (rule.maxLength && value.toString().length > rule.maxLength) {
      errors.push(`${field} deve ter no máximo ${rule.maxLength} caracteres`)
    }
    
    // Pattern validation
    if (rule.pattern && !rule.pattern.test(value.toString())) {
      errors.push(`${field} formato inválido`)
    }
    
    // Custom validation
    if (rule.validate && typeof rule.validate === 'function') {
      const customError = rule.validate(value)
      if (customError) {
        errors.push(customError)
      }
    }
  }
  
  return {
    valid: errors.length === 0,
    errors,
  }
}

// Security Monitoring
interface SecurityEvent {
  type: string
  severity: 'low' | 'medium' | 'high' | 'critical'
  message: string
  timestamp: Date
  ip?: string
  userAgent?: string
  details?: any
}

const securityEvents: SecurityEvent[] = []

export function logSecurityEvent(event: Omit<SecurityEvent, 'timestamp'>): void {
  const securityEvent: SecurityEvent = {
    ...event,
    timestamp: new Date(),
  }
  
  securityEvents.push(securityEvent)
  
  // Log to console in development
  if (process.env.NODE_ENV === 'development') {
    console.log('Security Event:', securityEvent)
  }
  
  // In production, send to security monitoring service
  if (process.env.NODE_ENV === 'production') {
    // TODO: Implement security monitoring service integration
  }
  
  // Alert for critical events
  if (event.severity === 'critical') {
    console.error('CRITICAL SECURITY EVENT:', event)
  }
}

export function getSecurityEvents(filters?: {
  type?: string
  severity?: string
  since?: Date
}): SecurityEvent[] {
  let filteredEvents = [...securityEvents]
  
  if (filters) {
    if (filters.type) {
      filteredEvents = filteredEvents.filter(event => event.type === filters.type)
    }
    
    if (filters.severity) {
      filteredEvents = filteredEvents.filter(event => event.severity === filters.severity)
    }
    
    if (filters.since) {
      filteredEvents = filteredEvents.filter(event => event.timestamp >= filters.since!)
    }
  }
  
  return filteredEvents.sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime())
}

// Password Policy
export function getPasswordPolicy(): {
  minLength: number
  requireUppercase: boolean
  requireLowercase: boolean
  requireNumbers: boolean
  requireSpecialChars: boolean
  preventCommonPasswords: boolean
  maxAge: number // days
} {
  return {
    minLength: 8,
    requireUppercase: true,
    requireLowercase: true,
    requireNumbers: true,
    requireSpecialChars: true,
    preventCommonPasswords: true,
    maxAge: 90, // 90 days
  }
}

// Common passwords list (simplified)
const commonPasswords = [
  '123456', 'password', '12345678', 'qwerty', '123456789',
  '12345', '1234', '111111', '1234567', 'dragon', '123123',
  'baseball', 'abc123', 'football', 'monkey', 'letmein',
  'shadow', 'master', '666666', 'qwertyuiop', '123321',
  'mustang', '1234567890', 'michael', '654321', 'pussy',
  'superman', '1qaz2wsx', '7777777', 'fuckyou', '121212',
  'trustno1', 'jordan', 'jennifer', 'zxcvbnm', 'asdfgh',
  'hunter', 'buster', 'soccer', 'harley', 'batman',
  'andrew', 'tigger', 'sunshine', 'iloveyou', '2000',
]

export function isCommonPassword(password: string): boolean {
  return commonPasswords.includes(password.toLowerCase())
}

// Security Configuration
export function getSecurityConfig(): {
  maxLoginAttempts: number
  lockoutDuration: number // minutes
  sessionTimeout: number // minutes
  passwordExpiry: number // days
  requireMFA: boolean
  allowedOrigins: string[]
  rateLimiting: {
    enabled: boolean
    requestsPerMinute: number
    requestsPerHour: number
  }
} {
  return {
    maxLoginAttempts: 5,
    lockoutDuration: 15,
    sessionTimeout: 30,
    passwordExpiry: 90,
    requireMFA: false,
    allowedOrigins: process.env.NODE_ENV === 'production' 
      ? ['https://salgadobox.com.br'] 
      : ['http://localhost:3000'],
    rateLimiting: {
      enabled: true,
      requestsPerMinute: 60,
      requestsPerHour: 1000,
    },
  }
}