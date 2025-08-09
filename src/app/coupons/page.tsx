"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Tag, 
  Plus, 
  Edit, 
  Trash2, 
  Search, 
  Filter,
  Calendar,
  DollarSign,
  Users,
  TrendingUp,
  Gift,
  Percent,
  Truck,
  Copy,
  CheckCircle,
  XCircle,
  Clock
} from 'lucide-react'

interface Coupon {
  id: string
  code: string
  name: string
  description?: string
  type: 'PERCENTAGE' | 'FIXED_AMOUNT' | 'FREE_DELIVERY'
  value: number
  minOrderValue: number
  maxDiscount?: number
  usageLimit?: number
  usageCount: number
  validFrom?: string
  validTo?: string
  isActive: boolean
  isSingleUse: boolean
  applicableProducts: string[]
  applicableCategories: string[]
  customerSegment?: string
  createdAt: string
  updatedAt: string
  orders: Order[]
}

interface Order {
  id: string
  orderNumber: string
  total: number
  customerName: string
  createdAt: string
}

interface Campaign {
  id: string
  name: string
  description: string
  type: 'COUPON' | 'LOYALTY' | 'CASHBACK' | 'REFERRAL'
  status: 'DRAFT' | 'ACTIVE' | 'PAUSED' | 'COMPLETED'
  startDate: string
  endDate: string
  targetAudience: string[]
  budget?: number
  spent: number
  metrics: {
    impressions: number
    clicks: number
    conversions: number
    revenue: number
  }
  coupons: Coupon[]
  createdAt: string
  updatedAt: string
}

export default function CouponManagement() {
  const [coupons, setCoupons] = useState<Coupon[]>([])
  const [campaigns, setCampaigns] = useState<Campaign[]>([])
  const [filteredCoupons, setFilteredCoupons] = useState<Coupon[]>([])
  const [selectedCoupon, setSelectedCoupon] = useState<Coupon | null>(null)
  const [selectedCampaign, setSelectedCampaign] = useState<Campaign | null>(null)
  const [isCouponDialogOpen, setIsCouponDialogOpen] = useState(false)
  const [isCampaignDialogOpen, setIsCampaignDialogOpen] = useState(false)
  const [isCouponDetailOpen, setIsCouponDetailOpen] = useState(false)
  const [isCampaignDetailOpen, setIsCampaignDetailOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('coupons')
  const [editingCoupon, setEditingCoupon] = useState<Coupon | null>(null)
  const [editingCampaign, setEditingCampaign] = useState<Campaign | null>(null)

  useEffect(() => {
    // Load mock data
    const mockCoupons: Coupon[] = [
      {
        id: '1',
        code: 'DESCONTO10',
        name: 'Desconto de 10%',
        description: 'Desconto de 10% em todo o cardápio',
        type: 'PERCENTAGE',
        value: 10,
        minOrderValue: 50,
        maxDiscount: 20,
        usageLimit: 100,
        usageCount: 45,
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2024-12-31T23:59:59Z',
        isActive: true,
        isSingleUse: false,
        applicableProducts: [],
        applicableCategories: [],
        customerSegment: 'all',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        orders: [
          { id: '1', orderNumber: '#1234', total: 90.50, customerName: 'João Silva', createdAt: '2024-01-15T10:30:00Z' },
          { id: '2', orderNumber: '#1230', total: 75.00, customerName: 'Maria Santos', createdAt: '2024-01-14T19:20:00Z' }
        ]
      },
      {
        id: '2',
        code: 'FRETEGRATIS',
        name: 'Frete Grátis',
        description: 'Entrega gratuita para pedidos acima de R$ 80',
        type: 'FREE_DELIVERY',
        value: 0,
        minOrderValue: 80,
        usageLimit: 50,
        usageCount: 12,
        validFrom: '2024-01-10T00:00:00Z',
        validTo: '2024-02-10T23:59:59Z',
        isActive: true,
        isSingleUse: false,
        applicableProducts: [],
        applicableCategories: [],
        customerSegment: 'all',
        createdAt: '2024-01-10T14:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        orders: [
          { id: '3', orderNumber: '#1236', total: 117.00, customerName: 'Pedro Oliveira', createdAt: '2024-01-15T11:00:00Z' }
        ]
      },
      {
        id: '3',
        code: 'PRIMEIRA20',
        name: 'Primeira Compra',
        description: 'R$ 20 de desconto na primeira compra',
        type: 'FIXED_AMOUNT',
        value: 20,
        minOrderValue: 30,
        usageLimit: 200,
        usageCount: 28,
        validFrom: '2024-01-01T00:00:00Z',
        validTo: '2024-03-31T23:59:59Z',
        isActive: true,
        isSingleUse: true,
        applicableProducts: [],
        applicableCategories: [],
        customerSegment: 'new',
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z',
        orders: []
      }
    ]

    const mockCampaigns: Campaign[] = [
      {
        id: '1',
        name: 'Campanha de Verão',
        description: 'Promoções especiais para o verão',
        type: 'COUPON',
        status: 'ACTIVE',
        startDate: '2024-01-01T00:00:00Z',
        endDate: '2024-02-29T23:59:59Z',
        targetAudience: ['all'],
        budget: 1000,
        spent: 450,
        metrics: {
          impressions: 5000,
          clicks: 250,
          conversions: 45,
          revenue: 2847.50
        },
        coupons: [mockCoupons[0]],
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      },
      {
        id: '2',
        name: 'Clientes VIP',
        description: 'Ofertas exclusivas para clientes fiéis',
        type: 'LOYALTY',
        status: 'ACTIVE',
        startDate: '2024-01-10T00:00:00Z',
        endDate: '2024-03-10T23:59:59Z',
        targetAudience: ['vip'],
        budget: 500,
        spent: 120,
        metrics: {
          impressions: 1000,
          clicks: 80,
          conversions: 12,
          revenue: 847.50
        },
        coupons: [],
        createdAt: '2024-01-10T14:00:00Z',
        updatedAt: '2024-01-15T10:00:00Z'
      }
    ]

    setCoupons(mockCoupons)
    setFilteredCoupons(mockCoupons)
    setCampaigns(mockCampaigns)
  }, [])

  useEffect(() => {
    let filtered = coupons

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(coupon => 
        coupon.code.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        coupon.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(coupon => coupon.type === typeFilter)
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(coupon => {
        const now = new Date()
        const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null
        const validTo = coupon.validTo ? new Date(coupon.validTo) : null
        
        if (statusFilter === 'active') {
          return coupon.isActive && 
                 (!validFrom || now >= validFrom) && 
                 (!validTo || now <= validTo)
        } else if (statusFilter === 'expired') {
          return validTo && now > validTo
        } else if (statusFilter === 'scheduled') {
          return validFrom && now < validFrom
        } else if (statusFilter === 'inactive') {
          return !coupon.isActive
        }
        return true
      })
    }

    setFilteredCoupons(filtered)
  }, [coupons, searchTerm, typeFilter, statusFilter])

  const getCouponTypeIcon = (type: string) => {
    switch (type) {
      case 'PERCENTAGE': return <Percent className="h-4 w-4" />
      case 'FIXED_AMOUNT': return <DollarSign className="h-4 w-4" />
      case 'FREE_DELIVERY': return <Truck className="h-4 w-4" />
      default: return <Tag className="h-4 w-4" />
    }
  }

  const getCouponStatus = (coupon: Coupon) => {
    const now = new Date()
    const validFrom = coupon.validFrom ? new Date(coupon.validFrom) : null
    const validTo = coupon.validTo ? new Date(coupon.validTo) : null

    if (!coupon.isActive) return 'inactive'
    if (validTo && now > validTo) return 'expired'
    if (validFrom && now < validFrom) return 'scheduled'
    return 'active'
  }

  const getCouponStatusColor = (status: string) => {
    switch (status) {
      case 'active': return 'bg-green-500'
      case 'expired': return 'bg-red-500'
      case 'scheduled': return 'bg-blue-500'
      case 'inactive': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getCampaignStatusColor = (status: string) => {
    switch (status) {
      case 'ACTIVE': return 'bg-green-500'
      case 'PAUSED': return 'bg-yellow-500'
      case 'COMPLETED': return 'bg-gray-500'
      case 'DRAFT': return 'bg-blue-500'
      default: return 'bg-gray-500'
    }
  }

  const copyCouponCode = async (code: string) => {
    try {
      if (navigator.clipboard && window.isSecureContext) {
        await navigator.clipboard.writeText(code)
      } else {
        // Fallback for older browsers or non-secure contexts
        const textArea = document.createElement('textarea')
        textArea.value = code
        textArea.style.position = 'fixed'
        textArea.style.left = '-999999px'
        textArea.style.top = '-999999px'
        document.body.appendChild(textArea)
        textArea.focus()
        textArea.select()
        document.execCommand('copy')
        textArea.remove()
      }
    } catch (err) {
      console.error('Failed to copy coupon code:', err)
    }
  }

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat('pt-BR', {
      style: 'currency',
      currency: 'BRL'
    }).format(value)
  }

  const formatDate = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleDateString('pt-BR')
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR')
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Cupons e Campanhas</h1>
            <p className="text-muted-foreground">
              Gerencie cupons de desconto e campanhas de marketing
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
            <Button onClick={() => setIsCampaignDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Campanha
            </Button>
            <Button onClick={() => setIsCouponDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cupom
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Cupons</CardTitle>
              <Tag className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{coupons.length}</div>
              <p className="text-xs text-muted-foreground">
                {coupons.filter(c => getCouponStatus(c) === 'active').length} ativos
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Campanhas</CardTitle>
              <Gift className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{campaigns.length}</div>
              <p className="text-xs text-muted-foreground">
                {campaigns.filter(c => c.status === 'ACTIVE').length} ativas
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Cupons Usados</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {coupons.reduce((sum, coupon) => sum + coupon.usageCount, 0)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total de utilizações
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Desconto Concedido</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {coupons.reduce((sum, coupon) => {
                  const discount = coupon.type === 'PERCENTAGE' 
                    ? (coupon.value / 100) * coupon.usageCount * 50 // média estimada
                    : coupon.value * coupon.usageCount
                  return sum + discount
                }, 0).toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                Total em descontos
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-6">
          <TabsList>
            <TabsTrigger value="coupons">Cupons</TabsTrigger>
            <TabsTrigger value="campaigns">Campanhas</TabsTrigger>
          </TabsList>

          <TabsContent value="coupons" className="space-y-6">
            {/* Filters */}
            <Card>
              <CardHeader>
                <CardTitle>Filtros</CardTitle>
              </CardHeader>
              <CardContent>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Buscar</Label>
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                      <Input
                        placeholder="Código, nome..."
                        value={searchTerm}
                        onChange={(e) => setSearchTerm(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Tipo</Label>
                    <Select value={typeFilter} onValueChange={setTypeFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os tipos" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="PERCENTAGE">Percentual</SelectItem>
                        <SelectItem value="FIXED_AMOUNT">Valor Fixo</SelectItem>
                        <SelectItem value="FREE_DELIVERY">Frete Grátis</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Status</Label>
                    <Select value={statusFilter} onValueChange={setStatusFilter}>
                      <SelectTrigger>
                        <SelectValue placeholder="Todos os status" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="all">Todos</SelectItem>
                        <SelectItem value="active">Ativos</SelectItem>
                        <SelectItem value="expired">Expirados</SelectItem>
                        <SelectItem value="scheduled">Agendados</SelectItem>
                        <SelectItem value="inactive">Inativos</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Ações</Label>
                    <Button variant="outline" className="w-full" onClick={() => {
                      setSearchTerm('')
                      setTypeFilter('all')
                      setStatusFilter('all')
                    }}>
                      <Filter className="mr-2 h-4 w-4" />
                      Limpar Filtros
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Coupons List */}
            <Card>
              <CardHeader>
                <CardTitle>Cupons</CardTitle>
                <CardDescription>
                  Lista de todos os cupons de desconto
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredCoupons.map((coupon) => {
                      const status = getCouponStatus(coupon)
                      return (
                        <div key={coupon.id} className="border rounded-lg p-4 space-y-4">
                          <div className="flex items-center justify-between">
                            <div className="flex items-center space-x-3">
                              <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full">
                                {getCouponTypeIcon(coupon.type)}
                              </div>
                              <div>
                                <div className="flex items-center space-x-2">
                                  <h3 className="font-semibold">{coupon.name}</h3>
                                  <Badge variant="outline" className="font-mono text-xs">
                                    {coupon.code}
                                  </Badge>
                                  <Badge className={`${getCouponStatusColor(status)} text-white text-xs`}>
                                    {status === 'active' && <CheckCircle className="h-3 w-3 mr-1" />}
                                    {status === 'expired' && <XCircle className="h-3 w-3 mr-1" />}
                                    {status === 'scheduled' && <Clock className="h-3 w-3 mr-1" />}
                                    <span className="capitalize">{status}</span>
                                  </Badge>
                                </div>
                                {coupon.description && (
                                  <p className="text-sm text-muted-foreground">{coupon.description}</p>
                                )}
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              <Button variant="outline" size="sm" onClick={() => copyCouponCode(coupon.code)}>
                                <Copy className="h-4 w-4" />
                              </Button>
                              <Button variant="outline" size="sm" onClick={() => {
                                setSelectedCoupon(coupon)
                                setIsCouponDetailOpen(true)
                              }}>
                                <Edit className="h-4 w-4" />
                              </Button>
                            </div>
                          </div>

                          <div className="grid gap-4 md:grid-cols-3">
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Tipo:</span>
                                <span className="font-medium">
                                  {coupon.type === 'PERCENTAGE' ? `${coupon.value}%` :
                                   coupon.type === 'FIXED_AMOUNT' ? formatCurrency(coupon.value) :
                                   'Frete Grátis'}
                                </span>
                              </div>
                              {coupon.minOrderValue > 0 && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Min. pedido:</span>
                                  <span className="font-medium">{formatCurrency(coupon.minOrderValue)}</span>
                                </div>
                              )}
                              {coupon.maxDiscount && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Max. desconto:</span>
                                  <span className="font-medium">{formatCurrency(coupon.maxDiscount)}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Usos:</span>
                                <span className="font-medium">
                                  {coupon.usageCount}{coupon.usageLimit && `/${coupon.usageLimit}`}
                                </span>
                              </div>
                              {coupon.validFrom && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Válido de:</span>
                                  <span className="font-medium">{formatDate(coupon.validFrom)}</span>
                                </div>
                              )}
                              {coupon.validTo && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Válido até:</span>
                                  <span className="font-medium">{formatDate(coupon.validTo)}</span>
                                </div>
                              )}
                            </div>
                            <div className="space-y-2">
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Uso único:</span>
                                <span className="font-medium">{coupon.isSingleUse ? 'Sim' : 'Não'}</span>
                              </div>
                              {coupon.customerSegment && (
                                <div className="flex items-center justify-between">
                                  <span className="text-sm text-muted-foreground">Segmento:</span>
                                  <span className="font-medium capitalize">{coupon.customerSegment}</span>
                                </div>
                              )}
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Ativo:</span>
                                <Switch checked={coupon.isActive} disabled />
                              </div>
                            </div>
                          </div>
                        </div>
                      )
                    })}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="campaigns" className="space-y-6">
            {/* Campaigns List */}
            <Card>
              <CardHeader>
                <CardTitle>Campanhas</CardTitle>
                <CardDescription>
                  Gerencie suas campanhas de marketing
                </CardDescription>
              </CardHeader>
              <CardContent>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {campaigns.map((campaign) => (
                      <div key={campaign.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full">
                              <Gift className="h-5 w-5" />
                            </div>
                            <div>
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{campaign.name}</h3>
                                <Badge className={`${getCampaignStatusColor(campaign.status)} text-white text-xs`}>
                                  {campaign.status}
                                </Badge>
                              </div>
                              {campaign.description && (
                                <p className="text-sm text-muted-foreground">{campaign.description}</p>
                              )}
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedCampaign(campaign)
                              setIsCampaignDetailOpen(true)
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Tipo:</span>
                              <span className="font-medium">{campaign.type}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Início:</span>
                              <span className="font-medium">{formatDate(campaign.startDate)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Término:</span>
                              <span className="font-medium">{formatDate(campaign.endDate)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Orçamento:</span>
                              <span className="font-medium">{campaign.budget ? formatCurrency(campaign.budget) : 'Não definido'}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Gasto:</span>
                              <span className="font-medium">{formatCurrency(campaign.spent)}</span>
                            </div>
                            {campaign.budget && (
                              <div className="flex items-center justify-between">
                                <span className="text-sm text-muted-foreground">Restante:</span>
                                <span className="font-medium">{formatCurrency(campaign.budget - campaign.spent)}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Impressões:</span>
                              <span className="font-medium">{campaign.metrics.impressions.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Cliques:</span>
                              <span className="font-medium">{campaign.metrics.clicks.toLocaleString()}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Conversões:</span>
                              <span className="font-medium">{campaign.metrics.conversions.toLocaleString()}</span>
                            </div>
                          </div>
                        </div>

                        <div className="p-3 bg-muted rounded-lg">
                          <div className="flex items-center justify-between">
                            <span className="text-sm font-medium">Receita gerada:</span>
                            <span className="font-semibold text-green-600">{formatCurrency(campaign.metrics.revenue)}</span>
                          </div>
                          <div className="flex items-center justify-between mt-1">
                            <span className="text-sm text-muted-foreground">ROI:</span>
                            <span className="text-sm font-medium">
                              {campaign.spent > 0 ? `${((campaign.metrics.revenue - campaign.spent) / campaign.spent * 100).toFixed(1)}%` : 'N/A'}
                            </span>
                          </div>
                        </div>
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>

      {/* Coupon Dialog */}
      <Dialog open={isCouponDialogOpen} onOpenChange={setIsCouponDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCoupon ? 'Editar Cupom' : 'Novo Cupom'}
            </DialogTitle>
            <DialogDescription>
              {editingCoupon ? 'Edite as informações do cupom' : 'Crie um novo cupom de desconto'}
            </DialogDescription>
          </DialogHeader>
          <CouponForm 
            coupon={editingCoupon} 
            onSave={(couponData) => {
              if (editingCoupon) {
                setCoupons(coupons.map(c => c.id === editingCoupon.id ? { ...editingCoupon, ...couponData } : c))
              } else {
                const newCoupon: Coupon = {
                  ...couponData,
                  id: Date.now().toString(),
                  usageCount: 0,
                  orders: [],
                  applicableProducts: [],
                  applicableCategories: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
                setCoupons([...coupons, newCoupon])
              }
              setIsCouponDialogOpen(false)
              setEditingCoupon(null)
            }}
            onCancel={() => {
              setIsCouponDialogOpen(false)
              setEditingCoupon(null)
            }}
          />
        </DialogContent>
      </Dialog>

      {/* Campaign Dialog */}
      <Dialog open={isCampaignDialogOpen} onOpenChange={setIsCampaignDialogOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>
              {editingCampaign ? 'Editar Campanha' : 'Nova Campanha'}
            </DialogTitle>
            <DialogDescription>
              {editingCampaign ? 'Edite as informações da campanha' : 'Crie uma nova campanha de marketing'}
            </DialogDescription>
          </DialogHeader>
          <CampaignForm 
            campaign={editingCampaign} 
            onSave={(campaignData) => {
              if (editingCampaign) {
                setCampaigns(campaigns.map(c => c.id === editingCampaign.id ? { ...editingCampaign, ...campaignData } : c))
              } else {
                const newCampaign: Campaign = {
                  ...campaignData,
                  id: Date.now().toString(),
                  spent: 0,
                  metrics: {
                    impressions: 0,
                    clicks: 0,
                    conversions: 0,
                    revenue: 0
                  },
                  coupons: [],
                  createdAt: new Date().toISOString(),
                  updatedAt: new Date().toISOString()
                }
                setCampaigns([...campaigns, newCampaign])
              }
              setIsCampaignDialogOpen(false)
              setEditingCampaign(null)
            }}
            onCancel={() => {
              setIsCampaignDialogOpen(false)
              setEditingCampaign(null)
            }}
          />
        </DialogContent>
      </Dialog>
    </div>
  )
}

function CouponForm({ 
  coupon, 
  onSave, 
  onCancel 
}: { 
  coupon: Coupon | null
  onSave: (data: Omit<Coupon, 'id' | 'usageCount' | 'orders' | 'applicableProducts' | 'applicableCategories' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    code: coupon?.code || '',
    name: coupon?.name || '',
    description: coupon?.description || '',
    type: coupon?.type || 'PERCENTAGE',
    value: coupon?.value || 0,
    minOrderValue: coupon?.minOrderValue || 0,
    maxDiscount: coupon?.maxDiscount || 0,
    usageLimit: coupon?.usageLimit || 0,
    validFrom: coupon?.validFrom?.split('T')[0] || '',
    validTo: coupon?.validTo?.split('T')[0] || '',
    isActive: coupon?.isActive ?? true,
    isSingleUse: coupon?.isSingleUse ?? false,
    customerSegment: coupon?.customerSegment || 'all'
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      validFrom: formData.validFrom ? `${formData.validFrom}T00:00:00Z` : undefined,
      validTo: formData.validTo ? `${formData.validTo}T23:59:59Z` : undefined,
      maxDiscount: formData.maxDiscount > 0 ? formData.maxDiscount : undefined,
      usageLimit: formData.usageLimit > 0 ? formData.usageLimit : undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="code">Código do Cupom</Label>
          <Input
            id="code"
            value={formData.code}
            onChange={(e) => setFormData({ ...formData, code: e.target.value.toUpperCase() })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="name">Nome do Cupom</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="type">Tipo de Desconto</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Coupon['type'] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="PERCENTAGE">Percentual (%)</SelectItem>
              <SelectItem value="FIXED_AMOUNT">Valor Fixo (R$)</SelectItem>
              <SelectItem value="FREE_DELIVERY">Frete Grátis</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="value">Valor do Desconto</Label>
          <Input
            id="value"
            type="number"
            step="0.01"
            value={formData.value}
            onChange={(e) => setFormData({ ...formData, value: parseFloat(e.target.value) })}
            required
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="minOrderValue">Valor Mínimo do Pedido</Label>
          <Input
            id="minOrderValue"
            type="number"
            step="0.01"
            value={formData.minOrderValue}
            onChange={(e) => setFormData({ ...formData, minOrderValue: parseFloat(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="maxDiscount">Desconto Máximo (opcional)</Label>
          <Input
            id="maxDiscount"
            type="number"
            step="0.01"
            value={formData.maxDiscount}
            onChange={(e) => setFormData({ ...formData, maxDiscount: parseFloat(e.target.value) })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="usageLimit">Limite de Usos (opcional)</Label>
          <Input
            id="usageLimit"
            type="number"
            value={formData.usageLimit}
            onChange={(e) => setFormData({ ...formData, usageLimit: parseInt(e.target.value) })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="customerSegment">Segmento de Clientes</Label>
          <Select value={formData.customerSegment} onValueChange={(value) => setFormData({ ...formData, customerSegment: value })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos os clientes</SelectItem>
              <SelectItem value="new">Novos clientes</SelectItem>
              <SelectItem value="vip">Clientes VIP</SelectItem>
              <SelectItem value="inactive">Clientes inativos</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="validFrom">Válido a partir de</Label>
          <Input
            id="validFrom"
            type="date"
            value={formData.validFrom}
            onChange={(e) => setFormData({ ...formData, validFrom: e.target.value })}
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="validTo">Válido até</Label>
          <Input
            id="validTo"
            type="date"
            value={formData.validTo}
            onChange={(e) => setFormData({ ...formData, validTo: e.target.value })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="flex items-center space-x-2">
          <Switch
            id="isActive"
            checked={formData.isActive}
            onCheckedChange={(checked) => setFormData({ ...formData, isActive: checked })}
          />
          <Label htmlFor="isActive">Ativo</Label>
        </div>
        <div className="flex items-center space-x-2">
          <Switch
            id="isSingleUse"
            checked={formData.isSingleUse}
            onCheckedChange={(checked) => setFormData({ ...formData, isSingleUse: checked })}
          />
          <Label htmlFor="isSingleUse">Uso único</Label>
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  )
}

function CampaignForm({ 
  campaign, 
  onSave, 
  onCancel 
}: { 
  campaign: Campaign | null
  onSave: (data: Omit<Campaign, 'id' | 'spent' | 'metrics' | 'coupons' | 'createdAt' | 'updatedAt'>) => void
  onCancel: () => void
}) {
  const [formData, setFormData] = useState({
    name: campaign?.name || '',
    description: campaign?.description || '',
    type: campaign?.type || 'COUPON',
    status: campaign?.status || 'DRAFT',
    startDate: campaign?.startDate?.split('T')[0] || '',
    endDate: campaign?.endDate?.split('T')[0] || '',
    targetAudience: campaign?.targetAudience || ['all'],
    budget: campaign?.budget || 0
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave({
      ...formData,
      startDate: `${formData.startDate}T00:00:00Z`,
      endDate: `${formData.endDate}T23:59:59Z`,
      budget: formData.budget > 0 ? formData.budget : undefined
    })
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-4">
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="name">Nome da Campanha</Label>
          <Input
            id="name"
            value={formData.name}
            onChange={(e) => setFormData({ ...formData, name: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="type">Tipo da Campanha</Label>
          <Select value={formData.type} onValueChange={(value) => setFormData({ ...formData, type: value as Campaign['type'] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="COUPON">Cupons</SelectItem>
              <SelectItem value="LOYALTY">Fidelidade</SelectItem>
              <SelectItem value="CASHBACK">Cashback</SelectItem>
              <SelectItem value="REFERRAL">Indicação</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>
      <div className="space-y-2">
        <Label htmlFor="description">Descrição</Label>
        <Textarea
          id="description"
          value={formData.description}
          onChange={(e) => setFormData({ ...formData, description: e.target.value })}
          rows={3}
        />
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="status">Status</Label>
          <Select value={formData.status} onValueChange={(value) => setFormData({ ...formData, status: value as Campaign['status'] })}>
            <SelectTrigger>
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="DRAFT">Rascunho</SelectItem>
              <SelectItem value="ACTIVE">Ativa</SelectItem>
              <SelectItem value="PAUSED">Pausada</SelectItem>
              <SelectItem value="COMPLETED">Concluída</SelectItem>
            </SelectContent>
          </Select>
        </div>
        <div className="space-y-2">
          <Label htmlFor="budget">Orçamento (R$)</Label>
          <Input
            id="budget"
            type="number"
            step="0.01"
            value={formData.budget}
            onChange={(e) => setFormData({ ...formData, budget: parseFloat(e.target.value) })}
          />
        </div>
      </div>
      <div className="grid grid-cols-2 gap-4">
        <div className="space-y-2">
          <Label htmlFor="startDate">Data de Início</Label>
          <Input
            id="startDate"
            type="date"
            value={formData.startDate}
            onChange={(e) => setFormData({ ...formData, startDate: e.target.value })}
            required
          />
        </div>
        <div className="space-y-2">
          <Label htmlFor="endDate">Data de Término</Label>
          <Input
            id="endDate"
            type="date"
            value={formData.endDate}
            onChange={(e) => setFormData({ ...formData, endDate: e.target.value })}
            required
          />
        </div>
      </div>
      <DialogFooter>
        <Button type="button" variant="outline" onClick={onCancel}>
          Cancelar
        </Button>
        <Button type="submit">Salvar</Button>
      </DialogFooter>
    </form>
  )
}