"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { toast } from 'sonner'
import { 
  ShoppingCart, 
  Users, 
  TrendingUp, 
  Clock, 
  CheckCircle, 
  XCircle,
  AlertCircle,
  DollarSign,
  ChefHat,
  Truck,
  Package,
  ExternalLink
} from 'lucide-react'

interface DashboardStats {
  todayRevenue: number
  todayOrders: number
  avgTicket: number
  activeCustomers: number
  pendingOrders: number
  preparingOrders: number
  readyOrders: number
  deliveredOrders: number
  revenueChange: number
  ordersChange: number
  newCustomersToday: number
}

interface RecentOrder {
  id: string
  orderNumber: string
  customerName: string
  status: string
  total: number
  type: string
  createdAt: string
}

interface PopularProduct {
  id: string
  name: string
  sold: number
  revenue: number
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    todayRevenue: 0,
    todayOrders: 0,
    avgTicket: 0,
    activeCustomers: 0,
    pendingOrders: 0,
    preparingOrders: 0,
    readyOrders: 0,
    deliveredOrders: 0,
    revenueChange: 0,
    ordersChange: 0,
    newCustomersToday: 0
  })

  const [recentOrders, setRecentOrders] = useState<RecentOrder[]>([])
  const [popularProducts, setPopularProducts] = useState<PopularProduct[]>([])
  const [isLoading, setIsLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchDashboardData = async () => {
      try {
        setIsLoading(true)
        setError(null)
        const response = await fetch('/api/dashboard?restaurantId=default')
        
        if (!response.ok) {
          throw new Error('Failed to fetch dashboard data')
        }
        
        const data = await response.json()
        
        setStats(data.stats)
        setRecentOrders(data.recentOrders)
        setPopularProducts(data.popularProducts)
      } catch (error) {
        console.error('Error fetching dashboard data:', error)
        setError('Erro ao carregar dados do dashboard')
        // Fallback to mock data if API fails
        const mockStats: DashboardStats = {
          todayRevenue: 0,
          todayOrders: 0,
          avgTicket: 0,
          activeCustomers: 0,
          pendingOrders: 0,
          preparingOrders: 0,
          readyOrders: 0,
          deliveredOrders: 0,
          revenueChange: 0,
          ordersChange: 0,
          newCustomersToday: 0
        }

        const mockOrders: RecentOrder[] = []
        const mockProducts: PopularProduct[] = []

        setStats(mockStats)
        setRecentOrders(mockOrders)
        setPopularProducts(mockProducts)
      } finally {
        setIsLoading(false)
      }
    }

    fetchDashboardData()
    
    // Refresh data every 30 seconds
    const interval = setInterval(fetchDashboardData, 30000)
    
    return () => clearInterval(interval)
  }, [])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'PREPARING': return 'bg-blue-500'
      case 'READY': return 'bg-green-500'
      case 'DELIVERED': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'PREPARING': return <ChefHat className="h-4 w-4" />
      case 'READY': return <Package className="h-4 w-4" />
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTypeIcon = (type: string) => {
    switch (type) {
      case 'DELIVERY': return <Truck className="h-4 w-4" />
      case 'TAKEAWAY': return <Package className="h-4 w-4" />
      case 'DINE_IN': return <Users className="h-4 w-4" />
      default: return <ShoppingCart className="h-4 w-4" />
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Dashboard</h1>
            <p className="text-muted-foreground">
              Visão geral do seu restaurante
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button 
              variant="outline" 
              onClick={() => window.open('/public-menu', '_blank')}
              className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:text-green-800"
            >
              <ExternalLink className="mr-2 h-4 w-4" />
              Cardápio Público
            </Button>
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Relatórios
            </Button>
            <Button>
              <ShoppingCart className="mr-2 h-4 w-4" />
              Novo Pedido
            </Button>
          </div>
        </div>

        {error && (
          <Card className="border-red-200 bg-red-50">
            <CardContent className="p-4">
              <div className="flex items-center space-x-2 text-red-700">
                <AlertCircle className="h-4 w-4" />
                <span>{error}</span>
              </div>
            </CardContent>
          </Card>
        )}

        {isLoading ? (
          <div className="flex items-center justify-center h-64">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
          </div>
        ) : (
          <>
        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Receita Hoje
              </CardTitle>
              <DollarSign className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.todayRevenue.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                {stats.revenueChange >= 0 ? '+' : ''}{stats.revenueChange.toFixed(1)}% em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Pedidos Hoje
              </CardTitle>
              <ShoppingCart className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.todayOrders}</div>
              <p className="text-xs text-muted-foreground">
                {stats.ordersChange >= 0 ? '+' : ''}{stats.ordersChange.toFixed(1)}% em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Ticket Médio
              </CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">
                R$ {stats.avgTicket.toFixed(2)}
              </div>
              <p className="text-xs text-muted-foreground">
                +5.2% em relação a ontem
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">
                Clientes Ativos
              </CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.activeCustomers}</div>
              <p className="text-xs text-muted-foreground">
                +{stats.newCustomersToday} novos hoje
              </p>
            </CardContent>
          </Card>
        </div>

        {/* Order Status Overview */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.pendingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Preparando</CardTitle>
              <ChefHat className="h-4 w-4 text-blue-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-blue-600">{stats.preparingOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Prontos</CardTitle>
              <Package className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.readyOrders}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Entregues</CardTitle>
              <CheckCircle className="h-4 w-4 text-gray-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-gray-600">{stats.deliveredOrders}</div>
            </CardContent>
          </Card>
        </div>

        {/* Main Content */}
        <div className="grid gap-6 md:grid-cols-2">
          {/* Recent Orders */}
          <Card>
            <CardHeader>
              <CardTitle>Pedidos Recentes</CardTitle>
              <CardDescription>
                Últimos pedidos recebidos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {recentOrders.map((order) => (
                    <div key={order.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="space-y-1">
                        <div className="flex items-center space-x-2">
                          <span className="font-semibold">{order.orderNumber}</span>
                          <Badge variant="outline" className="text-xs">
                            {getTypeIcon(order.type)}
                            <span className="ml-1">{order.type}</span>
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">{order.customerName}</p>
                        <p className="text-xs text-muted-foreground">{order.createdAt}</p>
                      </div>
                      <div className="text-right space-y-1">
                        <div className="flex items-center space-x-2">
                          <Badge className={`${getStatusColor(order.status)} text-white text-xs`}>
                            {getStatusIcon(order.status)}
                            <span className="ml-1">{order.status}</span>
                          </Badge>
                        </div>
                        <p className="font-semibold">R$ {order.total.toFixed(2)}</p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>

          {/* Popular Products */}
          <Card>
            <CardHeader>
              <CardTitle>Produtos Populares</CardTitle>
              <CardDescription>
                Mais vendidos hoje
              </CardDescription>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[400px]">
                <div className="space-y-4">
                  {popularProducts.map((product, index) => (
                    <div key={product.id} className="flex items-center justify-between p-4 border rounded-lg">
                      <div className="flex items-center space-x-3">
                        <div className="flex items-center justify-center w-8 h-8 bg-primary text-primary-foreground rounded-full text-sm font-bold">
                          {index + 1}
                        </div>
                        <div>
                          <p className="font-medium">{product.name}</p>
                          <p className="text-sm text-muted-foreground">{product.sold} vendidos</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="font-semibold">R$ {product.revenue.toFixed(2)}</p>
                        <p className="text-sm text-muted-foreground">
                          R$ {(product.revenue / product.sold).toFixed(2)} un
                        </p>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>

        {/* Quick Actions */}
        <Card>
          <CardHeader>
            <CardTitle>Ações Rápidas</CardTitle>
            <CardDescription>
              Acessar rapidamente as principais funcionalidades
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => window.location.href = '/orders'}
              >
                <ShoppingCart className="h-6 w-6 mb-2" />
                <span>Novo Pedido</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => window.location.href = '/customers'}
              >
                <Users className="h-6 w-6 mb-2" />
                <span>Clientes</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => window.location.href = '/menu'}
              >
                <ChefHat className="h-6 w-6 mb-2" />
                <span>Cardápio</span>
              </Button>
              <Button 
                variant="outline" 
                className="h-20 flex-col"
                onClick={() => {
                  toast.info('Relatórios em desenvolvimento')
                }}
              >
                <TrendingUp className="h-6 w-6 mb-2" />
                <span>Relatórios</span>
              </Button>
            </div>
          </CardContent>
        </Card>
        </>
        )}
      </div>
    </div>
  )
}