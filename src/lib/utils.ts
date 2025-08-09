import { type ClassValue, clsx } from 'clsx'
import { twMerge } from 'tailwind-merge'

// Class name utility
export function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs))
}

// Simple date formatting functions
function isValidDate(date: Date): boolean {
  return !isNaN(date.getTime())
}

function parseISODate(dateString: string): Date {
  return new Date(dateString)
}

// Currency formatting
export function formatCurrency(value: number, currency = 'BRL', locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale, {
    style: 'currency',
    currency,
  }).format(value)
}

// Number formatting
export function formatNumber(value: number, locale = 'pt-BR'): string {
  return new Intl.NumberFormat(locale).format(value)
}

// Percentage formatting
export function formatPercentage(value: number, decimals = 1): string {
  return `${value.toFixed(decimals)}%`
}

// Date formatting
export function formatDate(date: Date | string, formatStr = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  if (!isValidDate(dateObj)) return 'Data inválida'
  return dateObj.toLocaleDateString('pt-BR')
}

// Relative time formatting
export function formatRelativeTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? parseISODate(date) : date
  if (!isValidDate(dateObj)) return 'Data inválida'
  
  const now = new Date()
  const diffInMinutes = Math.floor((now.getTime() - dateObj.getTime()) / (1000 * 60))
  
  if (diffInMinutes < 1) return 'agora'
  if (diffInMinutes < 60) return `há ${diffInMinutes} minuto${diffInMinutes > 1 ? 's' : ''}`
  
  const diffInHours = Math.floor(diffInMinutes / 60)
  if (diffInHours < 24) return `há ${diffInHours} hora${diffInHours > 1 ? 's' : ''}`
  
  return formatDate(dateObj)
}

// Phone number formatting
export function formatPhoneNumber(phone: string): string {
  const cleaned = phone.replace(/\D/g, '')
  
  if (cleaned.length === 11) {
    return cleaned.replace(/(\d{2})(\d{5})(\d{4})/, '($1) $2-$3')
  }
  
  if (cleaned.length === 10) {
    return cleaned.replace(/(\d{2})(\d{4})(\d{4})/, '($1) $2-$3')
  }
  
  return phone
}

// CEP/ZIP code formatting
export function formatCEP(cep: string): string {
  const cleaned = cep.replace(/\D/g, '')
  if (cleaned.length === 8) {
    return cleaned.replace(/(\d{5})(\d{3})/, '$1-$2')
  }
  return cep
}

// Text utilities
export function truncateText(text: string, maxLength: number, suffix = '...'): string {
  if (text.length <= maxLength) return text
  return text.substring(0, maxLength) + suffix
}

export function capitalizeFirstLetter(text: string): string {
  return text.charAt(0).toUpperCase() + text.slice(1).toLowerCase()
}

export function toTitleCase(text: string): string {
  return text
    .toLowerCase()
    .split(' ')
    .map(word => word.charAt(0).toUpperCase() + word.slice(1))
    .join(' ')
}

// Array utilities
export function chunk<T>(array: T[], size: number): T[][] {
  const chunks: T[][] = []
  for (let i = 0; i < array.length; i += size) {
    chunks.push(array.slice(i, i + size))
  }
  return chunks
}

export function removeDuplicates<T>(array: T[], key?: keyof T): T[] {
  if (!key) return [...new Set(array)]
  
  const seen = new Set()
  return array.filter(item => {
    const value = item[key]
    if (seen.has(value)) {
      return false
    }
    seen.add(value)
    return true
  })
}

export function sortBy<T>(array: T[], key: keyof T, direction: 'asc' | 'desc' = 'asc'): T[] {
  return [...array].sort((a, b) => {
    const aValue = a[key]
    const bValue = b[key]
    
    if (typeof aValue === 'string' && typeof bValue === 'string') {
      return direction === 'asc' 
        ? aValue.localeCompare(bValue)
        : bValue.localeCompare(aValue)
    }
    
    if (typeof aValue === 'number' && typeof bValue === 'number') {
      return direction === 'asc' ? aValue - bValue : bValue - aValue
    }
    
    return 0
  })
}

// Object utilities
export function omit<T extends object, K extends keyof T>(obj: T, keys: K[]): Omit<T, K> {
  const result = { ...obj }
  keys.forEach(key => delete result[key])
  return result
}

export function pick<T extends object, K extends keyof T>(obj: T, keys: K[]): Pick<T, K> {
  const result = {} as Pick<T, K>
  keys.forEach(key => {
    result[key] = obj[key]
  })
  return result
}

export function deepClone<T>(obj: T): T {
  return JSON.parse(JSON.stringify(obj))
}

// Validation utilities
export function isValidEmail(email: string): boolean {
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/
  return emailRegex.test(email)
}

export function isValidPhone(phone: string): boolean {
  const phoneRegex = /^\+?[\d\s\-\(\)]{10,}$/
  return phoneRegex.test(phone)
}

export function isValidCEP(cep: string): boolean {
  const cepRegex = /^\d{5}-?\d{3}$/
  return cepRegex.test(cep)
}

// File utilities
export function formatFileSize(bytes: number, decimals = 2): string {
  if (bytes === 0) return '0 Bytes'
  
  const k = 1024
  const dm = decimals < 0 ? 0 : decimals
  const sizes = ['Bytes', 'KB', 'MB', 'GB', 'TB']
  
  const i = Math.floor(Math.log(bytes) / Math.log(k))
  
  return parseFloat((bytes / Math.pow(k, i)).toFixed(dm)) + ' ' + sizes[i]
}

export function getFileExtension(filename: string): string {
  return filename.slice((filename.lastIndexOf('.') - 1 >>> 0) + 2)
}

// URL utilities
export function buildUrl(base: string, path: string, params?: Record<string, string>): string {
  const url = new URL(path, base)
  if (params) {
    Object.entries(params).forEach(([key, value]) => {
      url.searchParams.set(key, value)
    })
  }
  return url.toString()
}

// Async utilities
export function delay(ms: number): Promise<void> {
  return new Promise(resolve => setTimeout(resolve, ms))
}

export function retry<T>(
  fn: () => Promise<T>,
  maxAttempts = 3,
  delayMs = 1000
): Promise<T> {
  return new Promise((resolve, reject) => {
    let attempts = 0
    
    const attempt = async () => {
      try {
        const result = await fn()
        resolve(result)
      } catch (error) {
        attempts++
        if (attempts >= maxAttempts) {
          reject(error)
        } else {
          setTimeout(attempt, delayMs * attempts)
        }
      }
    }
    
    attempt()
  })
}

// Color utilities
export function hexToRgb(hex: string): { r: number; g: number; b: number } | null {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex)
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : null
}

export function rgbToHex(r: number, g: number, b: number): string {
  return '#' + [r, g, b].map(x => {
    const hex = x.toString(16)
    return hex.length === 1 ? '0' + hex : hex
  }).join('')
}