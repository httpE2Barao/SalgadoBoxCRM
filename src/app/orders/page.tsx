"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  ShoppingCart, 
  Clock, 
  CheckCircle, 
  XCircle, 
  AlertCircle,
  DollarSign,
  User,
  Phone,
  MapPin,
  Truck,
  Package,
  ChefHat,
  Eye,
  Edit,
  Printer,
  Search,
  Filter,
  Plus,
  Zap,
  Users,
  Navigation
} from 'lucide-react'
import PrintDialog from '@/components/PrintDialog'
import CreateTestOrderDialog from '@/components/CreateTestOrderDialog'

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED' | 'driver_dispatched' | 'driver_dispatch_failed'
  type: 'DELIVERY' | 'TAKEAWAY' | 'DINE_IN'
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryAddress?: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    complement?: string
  }
  subtotal: number
  deliveryFee: number
  discount: number
  tax: number
  total: number
  paymentMethod?: string
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  notes?: string
  estimatedTime?: number
  preparationTime?: number
  deliveryTime?: number
  source?: string
  couponCode?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  lalamoveOrderId?: string
  lalamoveTrackingUrl?: string
  lalamoveDriverInfo?: any
  items: OrderItem[]
}

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  notes?: string
  options: OrderItemOption[]
}

interface OrderItemOption {
  id: string
  name: string
  price: number
}

export default function OrderManagement() {
  const [orders, setOrders] = useState<Order[]>([])
  const [filteredOrders, setFilteredOrders] = useState<Order[]>([])
  const [selectedOrder, setSelectedOrder] = useState<Order | null>(null)
  const [isOrderDetailOpen, setIsOrderDetailOpen] = useState(false)
  const [isPrintDialogOpen, setIsPrintDialogOpen] = useState(false)
  const [isTestOrderDialogOpen, setIsTestOrderDialogOpen] = useState(false)
  const [isDispatchDialogOpen, setIsDispatchDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState<string>('all')
  const [typeFilter, setTypeFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')
  const [loading, setLoading] = useState(false)
  const [testOrderLoading, setTestOrderLoading] = useState(false)
  const [dispatchLoading, setDispatchLoading] = useState(false)
  const [message, setMessage] = useState<{ type: 'success' | 'error', text: string } | null>(null)

  useEffect(() => {
    loadOrders()
  }, [])

  const loadOrders = async () => {
    try {
      setLoading(true)
      const response = await fetch('/api/orders?restaurantId=default')
      if (response.ok) {
        const data = await response.json()
        setOrders(data)
        setFilteredOrders(data)
      }
    } catch (error) {
      console.error('Error loading orders:', error)
      setMessage({ type: 'error', text: 'Erro ao carregar pedidos' })
    } finally {
      setLoading(false)
    }
  }

  useEffect(() => {
    let filtered = orders

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(order => 
        order.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        order.customerPhone.includes(searchTerm)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(order => order.status === statusFilter)
    }

    // Apply type filter
    if (typeFilter !== 'all') {
      filtered = filtered.filter(order => order.type === typeFilter)
    }

    // Apply tab filter
    if (activeTab === 'pending') {
      filtered = filtered.filter(order => ['PENDING', 'CONFIRMED'].includes(order.status))
    } else if (activeTab === 'preparing') {
      filtered = filtered.filter(order => order.status === 'PREPARING')
    } else if (activeTab === 'ready') {
      filtered = filtered.filter(order => ['READY', 'OUT_FOR_DELIVERY', 'driver_dispatched'].includes(order.status))
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(order => ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(order.status))
    }

    setFilteredOrders(filtered)
  }, [orders, searchTerm, statusFilter, typeFilter, activeTab])

  const createTestOrder = async (autoDispatchDriver = false) => {
    try {
      setTestOrderLoading(true)
      const response = await fetch('/api/orders/test/create', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          autoDispatchDriver
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: `Pedido de teste criado: ${data.order.orderNumber}` })
        loadOrders()
        setIsTestOrderDialogOpen(false)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erro ao criar pedido de teste' })
      }
    } catch (error) {
      console.error('Error creating test order:', error)
      setMessage({ type: 'error', text: 'Erro ao criar pedido de teste' })
    } finally {
      setTestOrderLoading(false)
    }
  }

  const dispatchDriver = async (orderId: string) => {
    try {
      setDispatchLoading(true)
      const response = await fetch(`/api/orders/${orderId}/dispatch-driver`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          forceDispatch: true
        })
      })

      if (response.ok) {
        const data = await response.json()
        setMessage({ type: 'success', text: `Motorista despachado para pedido ${selectedOrder?.orderNumber}` })
        loadOrders()
        setIsDispatchDialogOpen(false)
        setSelectedOrder(data.order)
      } else {
        const error = await response.json()
        setMessage({ type: 'error', text: error.error || 'Erro ao despachar motorista' })
      }
    } catch (error) {
      console.error('Error dispatching driver:', error)
      setMessage({ type: 'error', text: 'Erro ao despachar motorista' })
    } finally {
      setDispatchLoading(false)
    }
  }

  const updateOrderStatus = async (orderId: string, newStatus: string) => {
    try {
      const response = await fetch(`/api/orders/${orderId}/status`, {
        method: 'PATCH',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          status: newStatus
        })
      })

      if (response.ok) {
        loadOrders()
        setMessage({ type: 'success', text: 'Status do pedido atualizado' })
      } else {
        setMessage({ type: 'error', text: 'Erro ao atualizar status do pedido' })
      }
    } catch (error) {
      console.error('Error updating order status:', error)
      setMessage({ type: 'error', text: 'Erro ao atualizar status do pedido' })
    }
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'CONFIRMED': return 'bg-blue-500'
      case 'PREPARING': return 'bg-orange-500'
      case 'READY': return 'bg-green-500'
      case 'OUT_FOR_DELIVERY': return 'bg-purple-500'
      case 'driver_dispatched': return 'bg-indigo-500'
      case 'DELIVERED': return 'bg-gray-500'
      case 'CANCELLED': return 'bg-red-500'
      case 'REFUNDED': return 'bg-red-400'
      case 'driver_dispatch_failed': return 'bg-red-600'
      default: return 'bg-gray-500'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'PENDING': return 'Pendente'
      case 'CONFIRMED': return 'Confirmado'
      case 'PREPARING': return 'Preparando'
      case 'READY': return 'Pronto'
      case 'OUT_FOR_DELIVERY': return 'Saiu para Entrega'
      case 'driver_dispatched': return 'Motorista Despachado'
      case 'DELIVERED': return 'Entregue'
      case 'CANCELLED': return 'Cancelado'
      case 'REFUNDED': return 'Reembolsado'
      case 'driver_dispatch_failed': return 'Falha no Despacho'
      default: return status
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'PREPARING': return <ChefHat className="h-4 w-4" />
      case 'READY': return <Package className="h-4 w-4" />
      case 'OUT_FOR_DELIVERY': return <Truck className="h-4 w-4" />
      case 'driver_dispatched': return <Navigation className="h-4 w-4" />
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      case 'REFUNDED': return <AlertCircle className="h-4 w-4" />
      case 'driver_dispatch_failed': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY': return <Truck className="h-4 w-4" />
      case 'TAKEAWAY': return <Package className="h-4 w-4" />
      case 'DINE_IN': return <User className="h-4 w-4" />
      default: return <ShoppingCart className="h-4 w-4" />
    }
  }

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case 'PAID': return 'bg-green-500'
      case 'PENDING': return 'bg-yellow-500'
      case 'FAILED': return 'bg-red-500'
      case 'REFUNDED': return 'bg-orange-500'
      case 'PARTIALLY_REFUNDED': return 'bg-orange-400'
      default: return 'bg-gray-500'
    }
  }

  const handleViewOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsOrderDetailOpen(true)
  }

  const handlePrintOrder = (order: Order) => {
    setSelectedOrder(order)
    setIsPrintDialogOpen(true)
  }

  const handleDispatchDriver = (order: Order) => {
    setSelectedOrder(order)
    setIsDispatchDialogOpen(true)
  }

  const formatAddress = (address?: Order['deliveryAddress']) => {
    if (!address) return '-'
    return `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''} - ${address.neighborhood}, ${address.city} - ${address.state}`
  }

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Pedidos</h1>
            <p className="text-muted-foreground">
              Acompanhe e gerencie todos os pedidos em tempo real
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline" onClick={() => setIsTestOrderDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Pedido de Teste
            </Button>
            <Button variant="outline">
              <Printer className="mr-2 h-4 w-4" />
              Imprimir Relatório
            </Button>
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
            <Button variant="outline" onClick={() => setIsTestOrderDialogOpen(true)}>
              <Plus className="mr-2 h-4 w-4" />
              Criar Pedido de Teste
            </Button>
          </div>
        </div>

        {/* Message Alert */}
        {message && (
          <Alert className={message.type === 'success' ? 'border-green-500' : 'border-red-500'}>
            <AlertDescription className={message.type === 'success' ? 'text-green-700' : 'text-red-700'}>
              {message.text}
            </AlertDescription>
          </Alert>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {orders.filter(o => ['PENDING', 'CONFIRMED'].includes(o.status)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preparando</CardTitle>
              <ChefHat className="h-4 w-4 text-orange-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">
                {orders.filter(o => o.status === 'PREPARING').length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prontos</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {orders.filter(o => ['READY', 'OUT_FOR_DELIVERY', 'driver_dispatched'].includes(o.status)).length}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Hoje</CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {orders.reduce((sum, order) => sum + order.total, 0).toFixed(2)}
              </div>
            </CardContent>
          </Card>
        </div>

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
                    placeholder="Número do pedido ou cliente..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Status</Label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="PENDING">Pendente</SelectItem>
                    <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                    <SelectItem value="PREPARING">Preparando</SelectItem>
                    <SelectItem value="READY">Pronto</SelectItem>
                    <SelectItem value="driver_dispatched">Motorista Despachado</SelectItem>
                    <SelectItem value="OUT_FOR_DELIVERY">Saiu para Entrega</SelectItem>
                    <SelectItem value="DELIVERED">Entregue</SelectItem>
                    <SelectItem value="CANCELLED">Cancelado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Tipo</Label>
                <Select value={typeFilter} onValueChange={setTypeFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os tipos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="DELIVERY">Delivery</SelectItem>
                    <SelectItem value="TAKEAWAY">Retirada</SelectItem>
                    <SelectItem value="DINE_IN">Local</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ações</Label>
                <Button 
                  variant="outline" 
                  className="w-full justify-start"
                  onClick={() => setIsTestOrderDialogOpen(true)}
                >
                  <Plus className="mr-2 h-4 w-4" />
                  Criar Teste
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Orders List */}
        <Tabs value={activeTab} onValueChange={setActiveTab}>
          <TabsList>
            <TabsTrigger value="all">Todos ({filteredOrders.length})</TabsTrigger>
            <TabsTrigger value="pending">
              Pendentes ({filteredOrders.filter(o => ['PENDING', 'CONFIRMED'].includes(o.status)).length})
            </TabsTrigger>
            <TabsTrigger value="preparing">
              Preparando ({filteredOrders.filter(o => o.status === 'PREPARING').length})
            </TabsTrigger>
            <TabsTrigger value="ready">
              Prontos ({filteredOrders.filter(o => ['READY', 'OUT_FOR_DELIVERY', 'driver_dispatched'].includes(o.status)).length})
            </TabsTrigger>
            <TabsTrigger value="completed">
              Concluídos ({filteredOrders.filter(o => ['DELIVERED', 'CANCELLED', 'REFUNDED'].includes(o.status)).length})
            </TabsTrigger>
          </TabsList>

          <TabsContent value={activeTab} className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos</CardTitle>
                <CardDescription>
                  Lista de pedidos {activeTab !== 'all' ? `filtrados por "${activeTab}"` : ''}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="text-center py-8">Carregando pedidos...</div>
                ) : filteredOrders.length === 0 ? (
                  <div className="text-center py-8">
                    <p className="text-muted-foreground">Nenhum pedido encontrado</p>
                    <Button 
                      className="mt-4" 
                      onClick={() => setIsTestOrderDialogOpen(true)}
                    >
                      Criar Pedido de Teste
                    </Button>
                  </div>
                ) : (
                  <div className="space-y-4">
                    {filteredOrders.map((order) => (
                      <Card key={order.id} className="hover:shadow-md transition-shadow">
                        <CardContent className="p-6">
                          <div className="flex items-start justify-between">
                            <div className="space-y-2">
                              <div className="flex items-center space-x-2">
                                <h3 className="font-semibold">{order.orderNumber}</h3>
                                <Badge className={`${getStatusColor(order.status)} text-white`}>
                                  {getStatusIcon(order.status)}
                                  <span className="ml-1">{getStatusText(order.status)}</span>
                                </Badge>
                                <Badge variant="outline">
                                  {getTypeIcon(order.type)}
                                  <span className="ml-1">
                                    {order.type === 'DELIVERY' ? 'Delivery' : 
                                     order.type === 'TAKEAWAY' ? 'Retirada' : 'Local'}
                                  </span>
                                </Badge>
                                {order.lalamoveOrderId && (
                                  <Badge variant="outline" className="border-indigo-500 text-indigo-700">
                                    <Navigation className="h-3 w-3 mr-1" />
                                    Motorista
                                  </Badge>
                                )}
                              </div>
                              
                              <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                                <div className="flex items-center space-x-1">
                                  <User className="h-4 w-4" />
                                  <span>{order.customerName}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Phone className="h-4 w-4" />
                                  <span>{order.customerPhone}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Clock className="h-4 w-4" />
                                  <span>{formatDateTime(order.createdAt)}</span>
                                </div>
                              </div>

                              {order.type === 'DELIVERY' && order.deliveryAddress && (
                                <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                                  <MapPin className="h-4 w-4" />
                                  <span>{formatAddress(order.deliveryAddress)}</span>
                                </div>
                              )}

                              <div className="flex items-center space-x-4 text-sm">
                                <div className="flex items-center space-x-1">
                                  <DollarSign className="h-4 w-4" />
                                  <span className="font-medium">R$ {order.total.toFixed(2)}</span>
                                </div>
                                <div className="flex items-center space-x-1">
                                  <Package className="h-4 w-4" />
                                  <span>{order.items.length} itens</span>
                                </div>
                                <Badge className={`${getPaymentStatusColor(order.paymentStatus)} text-white`}>
                                  {order.paymentStatus === 'PAID' ? 'Pago' : 
                                   order.paymentStatus === 'PENDING' ? 'Pendente' :
                                   order.paymentStatus === 'FAILED' ? 'Falhou' :
                                   order.paymentStatus === 'REFUNDED' ? 'Reembolsado' : 'Parcial'}
                                </Badge>
                              </div>
                            </div>

                            <div className="flex items-center space-x-2">
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handleViewOrder(order)}
                              >
                                <Eye className="h-4 w-4" />
                              </Button>
                              <Button
                                variant="outline"
                                size="sm"
                                onClick={() => handlePrintOrder(order)}
                              >
                                <Printer className="h-4 w-4" />
                              </Button>
                              {order.type === 'DELIVERY' && !order.lalamoveOrderId && 
                               ['CONFIRMED', 'PREPARING', 'READY'].includes(order.status) && (
                                <Button
                                  variant="outline"
                                  size="sm"
                                  onClick={() => handleDispatchDriver(order)}
                                  className="text-indigo-600 border-indigo-600 hover:bg-indigo-50"
                                >
                                  <Navigation className="h-4 w-4" />
                                  Despachar
                                </Button>
                              )}
                              <Select
                                value={order.status}
                                onValueChange={(value) => updateOrderStatus(order.id, value)}
                              >
                                <SelectTrigger className="w-32">
                                  <SelectValue />
                                </SelectTrigger>
                                <SelectContent>
                                  <SelectItem value="PENDING">Pendente</SelectItem>
                                  <SelectItem value="CONFIRMED">Confirmado</SelectItem>
                                  <SelectItem value="PREPARING">Preparando</SelectItem>
                                  <SelectItem value="READY">Pronto</SelectItem>
                                  <SelectItem value="driver_dispatched">Despachar</SelectItem>
                                  <SelectItem value="OUT_FOR_DELIVERY">Saiu Entrega</SelectItem>
                                  <SelectItem value="DELIVERED">Entregue</SelectItem>
                                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                                </SelectContent>
                              </Select>
                            </div>
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>

        {/* Test Order Dialog */}
        <Dialog open={isTestOrderDialogOpen} onOpenChange={setIsTestOrderDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Criar Pedido de Teste</DialogTitle>
              <DialogDescription>
                Crie um pedido de teste para testar o sistema e fluxo de entrega.
              </DialogDescription>
            </DialogHeader>
            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <Button
                  onClick={() => createTestOrder(false)}
                  disabled={testOrderLoading}
                  className="h-20 flex-col"
                >
                  <Plus className="h-6 w-6 mb-2" />
                  Pedido Simples
                  <span className="text-xs opacity-70">Apenas criar pedido</span>
                </Button>
                <Button
                  onClick={() => createTestOrder(true)}
                  disabled={testOrderLoading}
                  className="h-20 flex-col"
                  variant="default"
                >
                  <Zap className="h-6 w-6 mb-2" />
                  Pedido Completo
                  <span className="text-xs opacity-70">Criar + Despachar</span>
                </Button>
              </div>
              <p className="text-sm text-muted-foreground">
                O pedido será criado com dados aleatórios de clientes e produtos disponíveis.
              </p>
            </div>
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsTestOrderDialogOpen(false)}>
                Cancelar
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Dispatch Driver Dialog */}
        <Dialog open={isDispatchDialogOpen} onOpenChange={setIsDispatchDialogOpen}>
          <DialogContent>
            <DialogHeader>
              <DialogTitle>Despachar Motorista</DialogTitle>
              <DialogDescription>
                Chamar um motorista para entregar o pedido {selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <div className="space-y-4">
                <div className="grid grid-cols-2 gap-4 text-sm">
                  <div>
                    <Label className="font-medium">Cliente</Label>
                    <p>{selectedOrder.customerName}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Telefone</Label>
                    <p>{selectedOrder.customerPhone}</p>
                  </div>
                  <div className="col-span-2">
                    <Label className="font-medium">Endereço de Entrega</Label>
                    <p>{selectedOrder.deliveryAddress ? formatAddress(selectedOrder.deliveryAddress) : 'N/A'}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Valor do Pedido</Label>
                    <p>R$ {selectedOrder.total.toFixed(2)}</p>
                  </div>
                  <div>
                    <Label className="font-medium">Status Atual</Label>
                    <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                      {getStatusText(selectedOrder.status)}
                    </Badge>
                  </div>
                </div>
                <Alert>
                  <AlertDescription>
                    Um motorista será chamado através do serviço Lalamove para realizar a entrega.
                    O custo da entrega será calculado automaticamente com base na distância.
                  </AlertDescription>
                </Alert>
              </div>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsDispatchDialogOpen(false)}>
                Cancelar
              </Button>
              <Button 
                onClick={() => selectedOrder && dispatchDriver(selectedOrder.id)}
                disabled={dispatchLoading}
              >
                {dispatchLoading ? 'Despachando...' : 'Despachar Motorista'}
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Order Detail Dialog */}
        <Dialog open={isOrderDetailOpen} onOpenChange={setIsOrderDetailOpen}>
          <DialogContent className="max-w-2xl">
            <DialogHeader>
              <DialogTitle>Detalhes do Pedido</DialogTitle>
              <DialogDescription>
                Informações completas do pedido {selectedOrder?.orderNumber}
              </DialogDescription>
            </DialogHeader>
            {selectedOrder && (
              <ScrollArea className="max-h-96">
                <div className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="font-medium">Número do Pedido</Label>
                      <p>{selectedOrder.orderNumber}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Status</Label>
                      <Badge className={`${getStatusColor(selectedOrder.status)} text-white`}>
                        {getStatusIcon(selectedOrder.status)}
                        <span className="ml-1">{getStatusText(selectedOrder.status)}</span>
                      </Badge>
                    </div>
                    <div>
                      <Label className="font-medium">Cliente</Label>
                      <p>{selectedOrder.customerName}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Telefone</Label>
                      <p>{selectedOrder.customerPhone}</p>
                    </div>
                    {selectedOrder.customerEmail && (
                      <div className="col-span-2">
                        <Label className="font-medium">Email</Label>
                        <p>{selectedOrder.customerEmail}</p>
                      </div>
                    )}
                    {selectedOrder.type === 'DELIVERY' && selectedOrder.deliveryAddress && (
                      <div className="col-span-2">
                        <Label className="font-medium">Endereço de Entrega</Label>
                        <p>{formatAddress(selectedOrder.deliveryAddress)}</p>
                      </div>
                    )}
                    <div>
                      <Label className="font-medium">Forma de Pagamento</Label>
                      <p>{selectedOrder.paymentMethod || 'N/A'}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Status do Pagamento</Label>
                      <Badge className={`${getPaymentStatusColor(selectedOrder.paymentStatus)} text-white`}>
                        {selectedOrder.paymentStatus === 'PAID' ? 'Pago' : 
                         selectedOrder.paymentStatus === 'PENDING' ? 'Pendente' :
                         selectedOrder.paymentStatus === 'FAILED' ? 'Falhou' :
                         selectedOrder.paymentStatus === 'REFUNDED' ? 'Reembolsado' : 'Parcial'}
                      </Badge>
                    </div>
                    <div>
                      <Label className="font-medium">Data do Pedido</Label>
                      <p>{formatDateTime(selectedOrder.createdAt)}</p>
                    </div>
                    <div>
                      <Label className="font-medium">Última Atualização</Label>
                      <p>{formatDateTime(selectedOrder.updatedAt)}</p>
                    </div>
                  </div>

                  {selectedOrder.lalamoveOrderId && (
                    <div className="border-t pt-4">
                      <h4 className="font-medium mb-2">Informações da Entrega</h4>
                      <div className="grid grid-cols-2 gap-4 text-sm">
                        <div>
                          <Label className="font-medium">ID do Motorista</Label>
                          <p>{selectedOrder.lalamoveOrderId}</p>
                        </div>
                        {selectedOrder.lalamoveTrackingUrl && (
                          <div>
                            <Label className="font-medium">Rastreamento</Label>
                            <a 
                              href={selectedOrder.lalamoveTrackingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              Acompanhar Entrega
                            </a>
                          </div>
                        )}
                        {selectedOrder.lalamoveDriverInfo && (
                          <div className="col-span-2">
                            <Label className="font-medium">Motorista</Label>
                            <p>{selectedOrder.lalamoveDriverInfo.name || 'N/A'}</p>
                            {selectedOrder.lalamoveDriverInfo.phone && (
                              <p className="text-sm text-muted-foreground">
                                Telefone: {selectedOrder.lalamoveDriverInfo.phone}
                              </p>
                            )}
                            {selectedOrder.lalamoveDriverInfo.vehiclePlate && (
                              <p className="text-sm text-muted-foreground">
                                Placa: {selectedOrder.lalamoveDriverInfo.vehiclePlate}
                              </p>
                            )}
                          </div>
                        )}
                      </div>
                    </div>
                  )}

                  <div className="border-t pt-4">
                    <h4 className="font-medium mb-2">Itens do Pedido</h4>
                    <div className="space-y-2">
                      {selectedOrder.items.map((item) => (
                        <div key={item.id} className="flex justify-between items-center">
                          <div>
                            <span className="font-medium">{item.productName}</span>
                            <span className="text-muted-foreground ml-2">x{item.quantity}</span>
                            {item.notes && (
                              <p className="text-sm text-muted-foreground">{item.notes}</p>
                            )}
                            {item.options.length > 0 && (
                              <div className="text-sm text-muted-foreground">
                                {item.options.map(option => `${option.name} (+R$${option.price.toFixed(2)})`).join(', ')}
                              </div>
                            )}
                          </div>
                          <span className="font-medium">R$ {(item.price * item.quantity).toFixed(2)}</span>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="border-t pt-4">
                    <div className="space-y-2">
                      <div className="flex justify-between">
                        <span>Subtotal</span>
                        <span>R$ {selectedOrder.subtotal.toFixed(2)}</span>
                      </div>
                      <div className="flex justify-between">
                        <span>Taxa de Entrega</span>
                        <span>R$ {selectedOrder.deliveryFee.toFixed(2)}</span>
                      </div>
                      {selectedOrder.discount > 0 && (
                        <div className="flex justify-between text-green-600">
                          <span>Desconto</span>
                          <span>-R$ {selectedOrder.discount.toFixed(2)}</span>
                        </div>
                      )}
                      <div className="flex justify-between font-bold text-lg border-t pt-2">
                        <span>Total</span>
                        <span>R$ {selectedOrder.total.toFixed(2)}</span>
                      </div>
                    </div>
                  </div>

                  {selectedOrder.notes && (
                    <div className="border-t pt-4">
                      <Label className="font-medium">Observações</Label>
                      <p className="text-muted-foreground">{selectedOrder.notes}</p>
                    </div>
                  )}
                </div>
              </ScrollArea>
            )}
            <DialogFooter>
              <Button variant="outline" onClick={() => setIsOrderDetailOpen(false)}>
                Fechar
              </Button>
              <Button onClick={() => {
                setIsOrderDetailOpen(false)
                handlePrintOrder(selectedOrder!)
              }}>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </Button>
            </DialogFooter>
          </DialogContent>
        </Dialog>

        {/* Print Dialog */}
        {selectedOrder && (
          <PrintDialog
            open={isPrintDialogOpen}
            onOpenChange={setIsPrintDialogOpen}
            order={selectedOrder}
          />
        )}

        {/* Test Order Dialog */}
        <CreateTestOrderDialog
          isOpen={isTestOrderDialogOpen}
          onClose={() => setIsTestOrderDialogOpen(false)}
          onOrderCreated={() => {
            loadOrders()
            setMessage({ type: 'success', text: 'Pedido de teste criado com sucesso!' })
            setTimeout(() => setMessage(null), 3000)
          }}
        />
      </div>
    </div>
  )
}