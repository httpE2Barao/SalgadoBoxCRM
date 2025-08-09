// Base interfaces
export interface BaseEntity {
  id: string
  createdAt: Date
  updatedAt: Date
}

export interface NamedEntity extends BaseEntity {
  name: string
  description?: string
}

// User interfaces
export interface User extends BaseEntity {
  email: string
  name?: string
  phone?: string
  avatar?: string
  role: UserRole
  isActive: boolean
}

export enum UserRole {
  OWNER = 'OWNER',
  MANAGER = 'MANAGER',
  STAFF = 'STAFF',
}

// Restaurant interfaces
export interface Restaurant extends BaseEntity {
  name: string
  description?: string
  logo?: string
  phone: string
  email?: string
  address?: string
  neighborhood?: string
  city?: string
  state?: string
  zipCode?: string
  latitude?: number
  longitude?: number
  timezone: string
  currency: string
  status: RestaurantStatus
  deliveryEnabled: boolean
  takeawayEnabled: boolean
  dineInEnabled: boolean
  deliveryFee: number
  minimumOrder: number
  deliveryRadius?: number
  openingHours: OpeningHours[]
  socialMedia?: SocialMedia
  paymentMethods: PaymentMethod[]
  ownerId: string
}

export enum RestaurantStatus {
  ACTIVE = 'ACTIVE',
  INACTIVE = 'INACTIVE',
  MAINTENANCE = 'MAINTENANCE',
}

export interface OpeningHours {
  dayOfWeek: number
  openTime: string
  closeTime: string
  isClosed: boolean
}

export interface SocialMedia {
  instagram?: string
  facebook?: string
  twitter?: string
  website?: string
}

export interface PaymentMethod {
  id: string
  name: string
  isActive: boolean
}

// Menu interfaces
export interface Category extends NamedEntity {
  icon?: string
  color?: string
  displayOrder: number
  isActive: boolean
  image?: string
  restaurantId: string
  products?: Product[]
}

export interface Product extends NamedEntity {
  price: number
  costPrice?: number
  image?: string
  isActive: boolean
  isAvailable: boolean
  isFeatured: boolean
  stock: number
  minimumStock: number
  preparationTime?: number
  calories?: number
  displayOrder: number
  categoryId?: string
  category?: Category
  options: ProductOption[]
  spicyLevel?: number
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  tags?: string[]
  ingredients?: string[]
  allergens?: string[]
  nutritionalInfo?: NutritionalInfo
  restaurantId: string
}

export interface ProductOption extends BaseEntity {
  name: string
  description?: string
  price: number
  isActive: boolean
  displayOrder: number
  productId: string
  product?: Product
}

export interface Combo extends NamedEntity {
  price: number
  originalPrice?: number
  image?: string
  isActive: boolean
  isAvailable: boolean
  isFeatured: boolean
  preparationTime?: number
  displayOrder: number
  restaurantId: string
  comboItems: ComboItem[]
  orderItems?: OrderItem[]
}

export interface ComboItem extends BaseEntity {
  quantity: number
  isOptional: boolean
  displayOrder: number
  comboId: string
  combo?: Combo
  productId: string
  product?: Product
}

export interface NutritionalInfo {
  calories?: number
  protein?: number
  carbs?: number
  fat?: number
  fiber?: number
  sugar?: number
  sodium?: number
}

// Customer interfaces
export interface Customer extends BaseEntity {
  name?: string
  email?: string
  phone?: string
  avatar?: string
  birthDate?: Date
  notes?: string
  tags?: string[]
  source?: string
  isActive: boolean
  restaurantId: string
  orders?: Order[]
  loyaltyPoints?: LoyaltyPoint[]
  cashback?: Cashback[]
}

// Order interfaces
export interface Order extends BaseEntity {
  orderNumber: string
  status: OrderStatus
  type: OrderType
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryAddress?: DeliveryAddress
  subtotal: number
  deliveryFee: number
  discount: number
  tax: number
  total: number
  paymentMethod?: string
  paymentStatus: PaymentStatus
  notes?: string
  estimatedTime?: number
  preparationTime?: number
  deliveryTime?: number
  source?: string
  couponId?: string
  coupon?: Coupon
  loyaltyPointsUsed?: number
  cashbackUsed?: number
  restaurantId: string
  customerId?: string
  customer?: Customer
  staffId?: string
  staff?: User
  orderItems: OrderItem[]
  orderStatusHistory?: OrderStatusHistory[]
  loyaltyPoints?: LoyaltyPoint[]
  cashback?: Cashback[]
  lalamoveOrderId?: string
  lalamoveTrackingUrl?: string
  lalamoveDriverInfo?: any
  deliveredAt?: Date
  cancellationReason?: string
}

export enum OrderStatus {
  PENDING = 'PENDING',
  CONFIRMED = 'CONFIRMED',
  PREPARING = 'PREPARING',
  READY = 'READY',
  OUT_FOR_DELIVERY = 'OUT_FOR_DELIVERY',
  DELIVERED = 'DELIVERED',
  CANCELLED = 'CANCELLED',
  REFUNDED = 'REFUNDED',
}

export enum OrderType {
  DELIVERY = 'DELIVERY',
  TAKEAWAY = 'TAKEAWAY',
  DINE_IN = 'DINE_IN',
}

export enum PaymentStatus {
  PENDING = 'PENDING',
  PAID = 'PAID',
  FAILED = 'FAILED',
  REFUNDED = 'REFUNDED',
  PARTIALLY_REFUNDED = 'PARTIALLY_REFUNDED',
}

export interface DeliveryAddress {
  street: string
  number: string
  complement?: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  latitude?: number
  longitude?: number
}

export interface OrderItem extends BaseEntity {
  quantity: number
  price: number
  notes?: string
  orderId: string
  order?: Order
  productId?: string
  product?: Product
  comboId?: string
  combo?: Combo
  orderItemOptions?: OrderItemOption[]
}

export interface OrderItemOption extends BaseEntity {
  price: number
  orderItemId: string
  orderItem?: OrderItem
  productOptionId: string
  productOption?: ProductOption
}

export interface OrderStatusHistory extends BaseEntity {
  status: OrderStatus
  notes?: string
  orderId: string
  order?: Order
  staffId?: string
  staff?: User
}

// Coupon interfaces
export interface Coupon extends BaseEntity {
  code: string
  name: string
  description?: string
  type: CouponType
  value: number
  minOrderValue: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  validFrom?: Date
  validTo?: Date
  isActive: boolean
  isSingleUse: boolean
  applicableProducts?: string[]
  applicableCategories?: string[]
  customerSegment?: string
  restaurantId: string
  orders?: Order[]
}

export enum CouponType {
  PERCENTAGE = 'PERCENTAGE',
  FIXED_AMOUNT = 'FIXED_AMOUNT',
  FREE_DELIVERY = 'FREE_DELIVERY',
}

// Loyalty Program interfaces
export interface LoyaltyProgram extends BaseEntity {
  name: string
  description?: string
  pointsPerPurchase: number
  pointsValue: number
  minOrderValue: number
  isActive: boolean
  validFrom?: Date
  validTo?: Date
  restaurantId: string
  loyaltyPoints?: LoyaltyPoint[]
}

export interface LoyaltyPoint extends BaseEntity {
  points: number
  expiresAt?: Date
  customerId: string
  customer?: Customer
  loyaltyProgramId: string
  loyaltyProgram?: LoyaltyProgram
  orderId?: string
  order?: Order
}

export interface Cashback extends BaseEntity {
  amount: number
  percentage: number
  expiresAt?: Date
  isUsed: boolean
  usedAt?: Date
  customerId: string
  customer?: Customer
  orderId?: string
  order?: Order
}

// Analytics interfaces
export interface Analytics extends BaseEntity {
  date: Date
  metrics: AnalyticsMetrics
  restaurantId: string
}

export interface AnalyticsMetrics {
  revenue: number
  orders: number
  customers: number
  averageTicket: number
  popularProducts: ProductAnalytics[]
  popularCategories: CategoryAnalytics[]
  peakHours: HourAnalytics[]
  paymentMethods: PaymentMethodAnalytics[]
}

export interface ProductAnalytics {
  productId: string
  productName: string
  quantitySold: number
  revenue: number
}

export interface CategoryAnalytics {
  categoryId: string
  categoryName: string
  quantitySold: number
  revenue: number
}

export interface HourAnalytics {
  hour: number
  orders: number
  revenue: number
}

export interface PaymentMethodAnalytics {
  method: string
  count: number
  total: number
}

// UI Component interfaces
export interface SelectOption {
  value: string
  label: string
}

export interface TableColumn<T = any> {
  key: keyof T
  title: string
  sortable?: boolean
  filterable?: boolean
  render?: (value: any, record: T) => React.ReactNode
}

export interface FilterState {
  search?: string
  filters?: Record<string, any>
  sortBy?: string
  sortOrder?: 'asc' | 'desc'
  page?: number
  pageSize?: number
}

export interface PaginationResult<T> {
  data: T[]
  total: number
  page: number
  pageSize: number
  totalPages: number
}

// Form interfaces
export interface FormField {
  name: string
  label: string
  type: 'text' | 'email' | 'number' | 'select' | 'textarea' | 'checkbox' | 'switch'
  required?: boolean
  placeholder?: string
  options?: SelectOption[]
  validation?: {
    min?: number
    max?: number
    pattern?: string
    custom?: (value: any) => string | null
  }
}

export interface FormState {
  values: Record<string, any>
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
}

// API interfaces
export interface ApiResponse<T = any> {
  success: boolean
  data?: T
  error?: string
  message?: string
}

export interface PaginatedResponse<T> {
  data: T[]
  pagination: {
    page: number
    pageSize: number
    total: number
    totalPages: number
  }
}

export interface ApiError {
  code: string
  message: string
  details?: any
}

// Hook interfaces
export interface UseAsyncState<T> {
  data: T | null
  loading: boolean
  error: Error | null
  refetch: () => Promise<void>
}

export interface UseFormState<T> {
  values: T
  errors: Record<string, string>
  touched: Record<string, boolean>
  isValid: boolean
  setValue: (name: keyof T, value: any) => void
  setError: (name: keyof T, error: string) => void
  clearErrors: () => void
  validate: () => boolean
  submit: () => Promise<void>
  reset: () => void
}