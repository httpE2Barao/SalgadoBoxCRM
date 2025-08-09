"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  TrendingUp, 
  TrendingDown, 
  DollarSign, 
  ShoppingCart, 
  Users, 
  Star,
  Clock,
  Calendar,
  Download,
  Filter,
  RefreshCw
} from 'lucide-react'
import { 
  LineChart, 
  Line, 
  AreaChart, 
  Area,
  BarChart, 
  Bar, 
  PieChart, 
  Pie, 
  Cell,
  XAxis, 
  YAxis, 
  CartesianGrid, 
  Tooltip, 
  ResponsiveContainer,
  Legend
} from 'recharts'

interface AnalyticsData {
  revenue: Array<{ date: string; value: number }>
  orders: Array<{ date: string; value: number }>
  customers: Array<{ date: string; value: number }>
  topProducts: Array<{ name: string; value: number; color: string }>
  paymentMethods: Array<{ name: string; value: number; color: string }>
  orderTypes: Array<{ name: string; value: number; color: string }>
  hourlySales: Array<{ hour: string; value: number }>
  weeklySales: Array<{ day: string; value: number }>
}

const COLORS = ['#0088FE', '#00C49F', '#FFBB28', '#FF8042', '#8884D8', '#82CA9D']

export default function AnalyticsPage() {
  const [dateRange, setDateRange] = useState('7d')
  const [isLoading, setIsLoading] = useState(true)
  const [analyticsData, setAnalyticsData] = useState<AnalyticsData | null>(null)

  useEffect(() => {
    // Simular carregamento de dados
    const loadData = async () => {
      setIsLoading(true)
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Dados mockados para demonstração
      const mockData: AnalyticsData = {
        revenue: [
          { date: '01/01', value: 1200 },
          { date: '02/01', value: 1900 },
          { date: '03/01', value: 1500 },
          { date: '04/01', value: 2100 },
          { date: '05/01', value: 1800 },
          { date: '06/01', value: 2400 },
          { date: '07/01', value: 2200 },
        ],
        orders: [
          { date: '01/01', value: 25 },
          { date: '02/01', value: 38 },
          { date: '03/01', value: 31 },
          { date: '04/01', value: 42 },
          { date: '05/01', value: 36 },
          { date: '06/01', value: 48 },
          { date: '07/01', value: 45 },
        ],
        customers: [
          { date: '01/01', value: 15 },
          { date: '02/01', value: 22 },
          { date: '03/01', value: 18 },
          { date: '04/01', value: 28 },
          { date: '05/01', value: 24 },
          { date: '06/01', value: 32 },
          { date: '07/01', value: 29 },
        ],
        topProducts: [
          { name: 'X-Burger', value: 35, color: '#0088FE' },
          { name: 'Pizza Calabresa', value: 28, color: '#00C49F' },
          { name: 'Batata Frita', value: 22, color: '#FFBB28' },
          { name: 'Refrigerante', value: 18, color: '#FF8042' },
          { name: 'Salgado Assado', value: 15, color: '#8884D8' },
        ],
        paymentMethods: [
          { name: 'PIX', value: 45, color: '#0088FE' },
          { name: 'Cartão', value: 30, color: '#00C49F' },
          { name: 'Dinheiro', value: 20, color: '#FFBB28' },
          { name: 'Outros', value: 5, color: '#FF8042' },
        ],
        orderTypes: [
          { name: 'Delivery', value: 60, color: '#0088FE' },
          { name: 'Retirada', value: 25, color: '#00C49F' },
          { name: 'Local', value: 15, color: '#FFBB28' },
        ],
        hourlySales: [
          { hour: '08:00', value: 200 },
          { hour: '10:00', value: 450 },
          { hour: '12:00', value: 800 },
          { hour: '14:00', value: 600 },
          { hour: '16:00', value: 400 },
          { hour: '18:00', value: 900 },
          { hour: '20:00', value: 700 },
          { hour: '22:00', value: 300 },
        ],
        weeklySales: [
          { day: 'Seg', value: 1200 },
          { day: 'Ter', value: 1500 },
          { day: 'Qua', value: 1800 },
          { day: 'Qui', value: 2100 },
          { day: 'Sex', value: 2400 },
          { day: 'Sáb', value: 2800 },
          { day: 'Dom', value: 2200 },
        ]
      }
      
      setAnalyticsData(mockData)
      setIsLoading(false)
    }
    
    loadData()
  }, [dateRange])

  const StatCard = ({ title, value, change, icon: Icon, format = 'number' }: {
    title: string
    value: number
    change: number
    icon: any
    format?: 'currency' | 'number' | 'percentage'
  }) => (
    <Card>
      <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
        <CardTitle className="text-sm font-medium">{title}</CardTitle>
        <Icon className="h-4 w-4 text-muted-foreground" />
      </CardHeader>
      <CardContent>
        <div className="text-2xl font-bold">
          {format === 'currency' ? `R$ ${value.toLocaleString()}` : 
           format === 'percentage' ? `${value}%` : 
           value.toLocaleString()}
        </div>
        <p className="text-xs text-muted-foreground flex items-center">
          {change > 0 ? (
            <TrendingUp className="h-3 w-3 mr-1 text-green-500" />
          ) : (
            <TrendingDown className="h-3 w-3 mr-1 text-red-500" />
          )}
          {Math.abs(change)}% em relação ao período anterior
        </p>
      </CardContent>
    </Card>
  )

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  if (!analyticsData) {
    return <div>Nenhum dado disponível</div>
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Relatórios e Analytics</h1>
          <p className="text-muted-foreground">
            Análise detalhada do desempenho do seu negócio
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Select value={dateRange} onValueChange={setDateRange}>
            <SelectTrigger className="w-[180px]">
              <Calendar className="mr-2 h-4 w-4" />
              <SelectValue placeholder="Selecione o período" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="1d">Hoje</SelectItem>
              <SelectItem value="7d">Últimos 7 dias</SelectItem>
              <SelectItem value="30d">Últimos 30 dias</SelectItem>
              <SelectItem value="90d">Últimos 90 dias</SelectItem>
              <SelectItem value="1y">Último ano</SelectItem>
            </SelectContent>
          </Select>
          <Button variant="outline">
            <Filter className="mr-2 h-4 w-4" />
            Filtros
          </Button>
          <Button>
            <Download className="mr-2 h-4 w-4" />
            Exportar
          </Button>
          <Button variant="outline" size="icon">
            <RefreshCw className="h-4 w-4" />
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <StatCard
          title="Receita Total"
          value={13100}
          change={12.5}
          icon={DollarSign}
          format="currency"
        />
        <StatCard
          title="Total de Pedidos"
          value={265}
          change={8.2}
          icon={ShoppingCart}
        />
        <StatCard
          title="Novos Clientes"
          value={168}
          change={15.3}
          icon={Users}
        />
        <StatCard
          title="Ticket Médio"
          value={49.4}
          change={3.8}
          icon={TrendingUp}
          format="currency"
        />
      </div>

      {/* Charts */}
      <Tabs defaultValue="revenue" className="space-y-4">
        <TabsList>
          <TabsTrigger value="revenue">Receita</TabsTrigger>
          <TabsTrigger value="orders">Pedidos</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
          <TabsTrigger value="behavior">Comportamento</TabsTrigger>
        </TabsList>

        <TabsContent value="revenue" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Receita ao Longo do Tempo</CardTitle>
                <CardDescription>Evolução da receita no período selecionado</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.revenue}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Receita']} />
                    <Area type="monotone" dataKey="value" stroke="#8884d8" fill="#8884d8" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Vendas por Dia da Semana</CardTitle>
                <CardDescription>Padrão de vendas semanal</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.weeklySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="day" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                    <Bar dataKey="value" fill="#8884d8" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="orders" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Pedidos ao Longo do Tempo</CardTitle>
                <CardDescription>Evolução do número de pedidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.orders}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Pedidos']} />
                    <Line type="monotone" dataKey="value" stroke="#82ca9d" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Distribuição de Tipos de Pedido</CardTitle>
                <CardDescription>Percentual por tipo de pedido</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.orderTypes}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.orderTypes.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="products" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Produtos Mais Vendidos</CardTitle>
                <CardDescription>Top 5 produtos mais vendidos</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <PieChart>
                    <Pie
                      data={analyticsData.topProducts}
                      cx="50%"
                      cy="50%"
                      labelLine={false}
                      label={({ name, percent }) => `${name} ${(percent * 100).toFixed(0)}%`}
                      outerRadius={80}
                      fill="#8884d8"
                      dataKey="value"
                    >
                      {analyticsData.topProducts.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.color} />
                      ))}
                    </Pie>
                    <Tooltip />
                  </PieChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Métodos de Pagamento</CardTitle>
                <CardDescription>Distribuição dos métodos de pagamento</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <BarChart data={analyticsData.paymentMethods} layout="horizontal">
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis type="number" />
                    <YAxis dataKey="name" type="category" width={80} />
                    <Tooltip formatter={(value) => [`${value}%`, 'Percentual']} />
                    <Bar dataKey="value" fill="#82ca9d" />
                  </BarChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="behavior" className="space-y-4">
          <div className="grid gap-4 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Vendas por Horário</CardTitle>
                <CardDescription>Distribuição de vendas durante o dia</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <AreaChart data={analyticsData.hourlySales}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="hour" />
                    <YAxis />
                    <Tooltip formatter={(value) => [`R$ ${value}`, 'Vendas']} />
                    <Area type="monotone" dataKey="value" stroke="#ffc658" fill="#ffc658" fillOpacity={0.6} />
                  </AreaChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Crescimento de Clientes</CardTitle>
                <CardDescription>Evolução da base de clientes</CardDescription>
              </CardHeader>
              <CardContent>
                <ResponsiveContainer width="100%" height={300}>
                  <LineChart data={analyticsData.customers}>
                    <CartesianGrid strokeDasharray="3 3" />
                    <XAxis dataKey="date" />
                    <YAxis />
                    <Tooltip formatter={(value) => [value, 'Clientes']} />
                    <Line type="monotone" dataKey="value" stroke="#ff7300" strokeWidth={2} />
                  </LineChart>
                </ResponsiveContainer>
              </CardContent>
            </Card>
          </div>
        </TabsContent>
      </Tabs>
    </div>
  )
}