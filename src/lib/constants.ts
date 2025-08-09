// App Configuration
export const APP_CONFIG = {
  name: 'Salgado Box',
  version: '1.0.0',
  description: 'Sistema de Automação de Restaurantes',
  defaultCurrency: 'BRL',
  defaultLanguage: 'pt-BR',
  defaultTimeZone: 'America/Sao_Paulo',
} as const

// API Configuration
export const API_CONFIG = {
  baseURL: process.env.NEXT_PUBLIC_API_URL || '',
  timeout: 30000,
  retryAttempts: 3,
  retryDelay: 1000,
} as const

// UI Configuration
export const UI_CONFIG = {
  pagination: {
    defaultPageSize: 10,
    pageSizeOptions: [10, 20, 30, 40, 50],
  },
  animation: {
    duration: 300,
    easing: 'ease-in-out',
  },
  breakpoints: {
    sm: 640,
    md: 768,
    lg: 1024,
    xl: 1280,
    '2xl': 1536,
  },
} as const

// Form Validation
export const VALIDATION_CONFIG = {
  minLength: {
    name: 2,
    description: 10,
    password: 8,
  },
  maxLength: {
    name: 100,
    description: 500,
    email: 100,
  },
  patterns: {
    email: /^[^\s@]+@[^\s@]+\.[^\s@]+$/,
    phone: /^\+?[\d\s\-\(\)]+$/,
    zipCode: /^\d{5}-?\d{3}$/,
  },
} as const

// Business Logic
export const BUSINESS_CONFIG = {
  stock: {
    lowStockThreshold: 5,
    outOfStockThreshold: 0,
    autoDisableOnOutOfStock: true,
  },
  orders: {
    defaultPreparationTime: 30,
    maxPreparationTime: 120,
    autoCancelTimeout: 30, // minutes
  },
  pricing: {
    minPrice: 0.01,
    maxPrice: 99999.99,
    pricePrecision: 2,
  },
} as const

// Feature Flags
export const FEATURES = {
  darkMode: true,
  bulkOperations: true,
  realTimeUpdates: true,
  notifications: true,
  exportData: true,
  importData: true,
  advancedSearch: true,
  analytics: true,
} as const

// Error Messages
export const ERROR_MESSAGES = {
  network: 'Erro de conexão. Verifique sua internet e tente novamente.',
  timeout: 'A operação demorou muito tempo. Tente novamente.',
  unauthorized: 'Você não tem permissão para realizar esta ação.',
  forbidden: 'Acesso negado.',
  notFound: 'Recurso não encontrado.',
  validation: 'Dados inválidos. Verifique as informações e tente novamente.',
  server: 'Erro interno do servidor. Tente novamente mais tarde.',
  unknown: 'Ocorreu um erro inesperado.',
} as const

// Success Messages
export const SUCCESS_MESSAGES = {
  created: 'Item criado com sucesso!',
  updated: 'Item atualizado com sucesso!',
  deleted: 'Item excluído com sucesso!',
  saved: 'Alterações salvas com sucesso!',
  sent: 'Enviado com sucesso!',
} as const

// Local Storage Keys
export const STORAGE_KEYS = {
  auth: 'auth_token',
  user: 'user_data',
  preferences: 'user_preferences',
  theme: 'theme_preference',
  language: 'language_preference',
  lastActivity: 'last_activity',
} as const