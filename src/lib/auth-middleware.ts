import { NextRequest, NextResponse } from 'next/server'
import { validateSession, validateCSRFToken } from './security'

// Authentication middleware for API routes
export async function withAuth(
  request: NextRequest,
  handler: (request: NextRequest, userId: string) => Promise<NextResponse>
): Promise<NextResponse> {
  try {
    // Get session token from Authorization header
    const authHeader = request.headers.get('authorization')
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return NextResponse.json(
        { error: 'Token de autenticação ausente ou inválido' },
        { status: 401 }
      )
    }

    const token = authHeader.substring(7)
    
    // Validate session (in a real app, this would verify with your session store)
    const session = { id: 'session_id', userId: 'user_id', expiresAt: new Date(Date.now() + 24 * 60 * 60 * 1000) } // Mock session
    
    if (!validateSession(session)) {
      return NextResponse.json(
        { error: 'Sessão expirada ou inválida' },
        { status: 401 }
      )
    }

    // Check CSRF token for state-changing requests
    if (['POST', 'PUT', 'DELETE', 'PATCH'].includes(request.method)) {
      const csrfToken = request.headers.get('x-csrf-token')
      const sessionCsrfToken = 'csrf_token' // In real app, get from session
      
      if (!csrfToken || !validateCSRFToken(csrfToken, sessionCsrfToken)) {
        return NextResponse.json(
          { error: 'Token CSRF inválido' },
          { status: 403 }
        )
      }
    }

    return await handler(request, session.userId)
  } catch (error) {
    console.error('Authentication error:', error)
    return NextResponse.json(
      { error: 'Erro de autenticação' },
      { status: 500 }
    )
  }
}

// Role-based access control middleware
export function requireRole(allowedRoles: string[]) {
  return function (
    request: NextRequest,
    handler: (request: NextRequest, userId: string, userRole: string) => Promise<NextResponse>
  ) {
    return withAuth(request, async (request, userId) => {
      // In a real app, fetch user role from database
      const userRole = 'USER' // Mock user role
      
      if (!allowedRoles.includes(userRole)) {
        return NextResponse.json(
          { error: 'Permissão negada' },
          { status: 403 }
        )
      }

      return await handler(request, userId, userRole)
    })
  }
}

// Rate limiting middleware
const rateLimitMap = new Map<string, { count: number; resetTime: number }>()

export function withRateLimit(
  request: NextRequest,
  maxRequests: number = 100,
  windowMs: number = 60 * 1000 // 1 minute
): { allowed: boolean; remaining: number; resetTime: number } | NextResponse {
  const ip = request.ip || request.headers.get('x-forwarded-for') || 'unknown'
  const now = Date.now()
  
  const data = rateLimitMap.get(ip)
  
  if (!data || now > data.resetTime) {
    // New window
    const newData = { count: 1, resetTime: now + windowMs }
    rateLimitMap.set(ip, newData)
    
    return {
      allowed: true,
      remaining: maxRequests - 1,
      resetTime: newData.resetTime,
    }
  }
  
  if (data.count >= maxRequests) {
    return NextResponse.json(
      { error: 'Muitas requisições. Tente novamente mais tarde.' },
      { status: 429 }
    )
  }
  
  // Increment count
  data.count++
  rateLimitMap.set(ip, data)
  
  return {
    allowed: true,
    remaining: maxRequests - data.count,
    resetTime: data.resetTime,
  }
}

// Security headers middleware
export function withSecurityHeaders(response: NextResponse): NextResponse {
  const securityHeaders = {
    'Content-Security-Policy': "default-src 'self'; script-src 'self' 'unsafe-inline' 'unsafe-eval'; style-src 'self' 'unsafe-inline'; img-src 'self' data: https:; font-src 'self' data:; connect-src 'self' https:; frame-ancestors 'none';",
    'X-Content-Type-Options': 'nosniff',
    'X-Frame-Options': 'DENY',
    'X-XSS-Protection': '1; mode=block',
    'Referrer-Policy': 'strict-origin-when-cross-origin',
    'Permissions-Policy': 'camera=(), microphone=(), geolocation=()',
  }
  
  Object.entries(securityHeaders).forEach(([key, value]) => {
    response.headers.set(key, value)
  })
  
  return response
}

// Input validation middleware
export function validateRequestBody<T>(
  request: NextRequest,
  schema: {
    parse: (data: any) => T
  }
): Promise<{ success: true; data: T } | { success: false; error: string }> {
  try {
    const body = await request.json()
    const validatedData = schema.parse(body)
    return { success: true, data: validatedData }
  } catch (error) {
    if (error instanceof Error) {
      return { success: false, error: error.message }
    }
    return { success: false, error: 'Dados inválidos' }
  }
}

// Audit logging middleware
export async function auditLog(
  userId: string,
  action: string,
  resource: string,
  details?: any,
  request?: NextRequest
): Promise<void> {
  try {
    const auditEntry = {
      userId,
      action,
      resource,
      details: details ? JSON.stringify(details) : undefined,
      timestamp: new Date().toISOString(),
      ip: request?.headers.get('x-forwarded-for') || request?.ip || 'unknown',
      userAgent: request?.headers.get('user-agent') || 'unknown',
    }
    
    // In a real app, save to audit log database
    console.log('Audit log:', auditEntry)
  } catch (error) {
    console.error('Failed to create audit log:', error)
  }
}