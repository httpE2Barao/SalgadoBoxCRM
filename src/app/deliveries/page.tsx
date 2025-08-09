"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { Label } from '@/components/ui/label'
import { 
  Truck, 
  MapPin, 
  Clock, 
  Phone, 
  User,
  CheckCircle,
  XCircle,
  AlertCircle,
  Navigation,
  Star,
  DollarSign,
  Calendar,
  Search,
  Filter
} from 'lucide-react'

interface Delivery {
  id: string
  orderNumber: string
  customerName: string
  customerPhone: string
  deliveryAddress: {
    street: string
    number: string
    neighborhood: string
    city: string
    complement?: string
  }
  status: 'PENDING' | 'ASSIGNED' | 'IN_TRANSIT' | 'DELIVERED' | 'CANCELLED'
  driverName?: string
  driverPhone?: string
  estimatedTime: number
  actualTime?: number
  distance: number
  fee: number
  notes?: string
  createdAt: string
  deliveredAt?: string
  rating?: number
}

interface Driver {
  id: string
  name: string
  phone: string
  status: 'AVAILABLE' | 'BUSY' | 'OFFLINE'
  currentLocation?: string
  rating: number
  totalDeliveries: number
  todayDeliveries: number
}

export default function DeliveriesPage() {
  const [deliveries, setDeliveries] = useState<Delivery[]>([])
  const [drivers, setDrivers] = useState<Driver[]>([])
  const [filteredDeliveries, setFilteredDeliveries] = useState<Delivery[]>([])
  const [selectedDelivery, setSelectedDelivery] = useState<Delivery | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [activeTab, setActiveTab] = useState('active')

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock deliveries data
      const mockDeliveries: Delivery[] = [
        {
          id: '1',
          orderNumber: '#1234',
          customerName: 'João Silva',
          customerPhone: '(11) 9999-1234',
          deliveryAddress: {
            street: 'Rua das Flores',
            number: '123',
            neighborhood: 'Centro',
            city: 'São Paulo',
            complement: 'Apto 45'
          },
          status: 'IN_TRANSIT',
          driverName: 'Carlos Santos',
          driverPhone: '(11) 9888-7777',
          estimatedTime: 30,
          actualTime: 25,
          distance: 3.5,
          fee: 5.00,
          notes: 'Cliente solicitou entrega rápida',
          createdAt: '2024-01-15T14:30:00Z'
        },
        {
          id: '2',
          orderNumber: '#1235',
          customerName: 'Maria Santos',
          customerPhone: '(11) 9999-5678',
          deliveryAddress: {
            street: 'Av. Paulista',
            number: '1000',
            neighborhood: 'Bela Vista',
            city: 'São Paulo'
          },
          status: 'PENDING',
          estimatedTime: 45,
          distance: 8.2,
          fee: 7.00,
          createdAt: '2024-01-15T14:45:00Z'
        },
        {
          id: '3',
          orderNumber: '#1236',
          customerName: 'Pedro Oliveira',
          customerPhone: '(11) 9999-9012',
          deliveryAddress: {
            street: 'Rua Augusta',
            number: '500',
            neighborhood: 'Consolação',
            city: 'São Paulo',
            complement: 'Casa 2'
          },
          status: 'DELIVERED',
          driverName: 'Ana Costa',
          driverPhone: '(11) 9777-6666',
          estimatedTime: 20,
          actualTime: 18,
          distance: 2.1,
          fee: 5.00,
          createdAt: '2024-01-15T13:15:00Z',
          deliveredAt: '2024-01-15T13:33:00Z',
          rating: 5
        },
        {
          id: '4',
          orderNumber: '#1237',
          customerName: 'Ana Costa',
          customerPhone: '(11) 9999-3456',
          deliveryAddress: {
            street: 'Rua Oscar Freire',
            number: '800',
            neighborhood: 'Jardins',
            city: 'São Paulo'
          },
          status: 'ASSIGNED',
          driverName: 'Roberto Silva',
          driverPhone: '(11) 9666-5555',
          estimatedTime: 35,
          distance: 5.8,
          fee: 6.00,
          createdAt: '2024-01-15T15:00:00Z'
        }
      ]

      const mockDrivers: Driver[] = [
        {
          id: '1',
          name: 'Carlos Santos',
          phone: '(11) 9888-7777',
          status: 'BUSY',
          currentLocation: 'Av. Paulista, 1000',
          rating: 4.8,
          totalDeliveries: 1247,
          todayDeliveries: 12
        },
        {
          id: '2',
          name: 'Ana Costa',
          phone: '(11) 9777-6666',
          status: 'AVAILABLE',
          currentLocation: 'Rua Augusta, 500',
          rating: 4.9,
          totalDeliveries: 892,
          todayDeliveries: 8
        },
        {
          id: '3',
          name: 'Roberto Silva',
          phone: '(11) 9666-5555',
          status: 'BUSY',
          currentLocation: 'Rua Oscar Freire, 800',
          rating: 4.7,
          totalDeliveries: 654,
          todayDeliveries: 10
        },
        {
          id: '4',
          name: 'Mariana Oliveira',
          phone: '(11) 9555-4444',
          status: 'AVAILABLE',
          currentLocation: 'Rua das Flores, 123',
          rating: 4.6,
          totalDeliveries: 423,
          todayDeliveries: 6
        }
      ]

      setDeliveries(mockDeliveries)
      setDrivers(mockDrivers)
      setFilteredDeliveries(mockDeliveries)
    }

    loadData()
  }, [])

  useEffect(() => {
    let filtered = deliveries

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(delivery => 
        delivery.orderNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        delivery.customerPhone.includes(searchTerm)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(delivery => delivery.status === statusFilter)
    }

    // Apply tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter(delivery => ['PENDING', 'ASSIGNED', 'IN_TRANSIT'].includes(delivery.status))
    } else if (activeTab === 'completed') {
      filtered = filtered.filter(delivery => ['DELIVERED', 'CANCELLED'].includes(delivery.status))
    }

    setFilteredDeliveries(filtered)
  }, [deliveries, searchTerm, statusFilter, activeTab])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'ASSIGNED': return 'bg-blue-500'
      case 'IN_TRANSIT': return 'bg-purple-500'
      case 'DELIVERED': return 'bg-green-500'
      case 'CANCELLED': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'ASSIGNED': return <User className="h-4 w-4" />
      case 'IN_TRANSIT': return <Truck className="h-4 w-4" />
      case 'DELIVERED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getDriverStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500'
      case 'BUSY': return 'bg-yellow-500'
      case 'OFFLINE': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const formatAddress = (address: Delivery['deliveryAddress']) => {
    return `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''} - ${address.neighborhood}`
  }

  const formatTime = (minutes: number) => {
    const hours = Math.floor(minutes / 60)
    const mins = minutes % 60
    return hours > 0 ? `${hours}h ${mins}m` : `${mins}m`
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Entregas</h1>
          <p className="text-muted-foreground">
            Acompanhe e gerencie todas as entregas em tempo real
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Navigation className="mr-2 h-4 w-4" />
            Roteirizador
          </Button>
          <Button>
            <Truck className="mr-2 h-4 w-4" />
            Nova Entrega
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {deliveries.filter(d => d.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Em Transito</CardTitle>
            <Truck className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {deliveries.filter(d => d.status === 'IN_TRANSIT').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Entregadores</CardTitle>
            <User className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {drivers.filter(d => d.status === 'AVAILABLE').length}
            </div>
            <p className="text-xs text-muted-foreground">
              disponíveis
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Tempo Médio</CardTitle>
            <Navigation className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              28min
            </div>
            <p className="text-xs text-muted-foreground">
              entrega
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Filters */}
      <Card>
        <CardHeader>
          <CardTitle>Filtros</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid gap-4 md:grid-cols-3">
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
                  <SelectItem value="ASSIGNED">Atribuído</SelectItem>
                  <SelectItem value="IN_TRANSIT">Em Trânsito</SelectItem>
                  <SelectItem value="DELIVERED">Entregue</SelectItem>
                  <SelectItem value="CANCELLED">Cancelado</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Ações</Label>
              <Button variant="outline" className="w-full">
                <Filter className="mr-2 h-4 w-4" />
                Mais Filtros
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Main Content */}
      <div className="grid gap-6 md:grid-cols-3">
        {/* Deliveries List */}
        <div className="md:col-span-2">
          <Tabs value={activeTab} onValueChange={setActiveTab}>
            <TabsList>
              <TabsTrigger value="active">Ativas ({deliveries.filter(d => ['PENDING', 'ASSIGNED', 'IN_TRANSIT'].includes(d.status)).length})</TabsTrigger>
              <TabsTrigger value="completed">Concluídas ({deliveries.filter(d => ['DELIVERED', 'CANCELLED'].includes(d.status)).length})</TabsTrigger>
            </TabsList>

            <TabsContent value={activeTab} className="mt-4">
              <ScrollArea className="h-[600px]">
                <div className="space-y-4">
                  {filteredDeliveries.map((delivery) => (
                    <Card 
                      key={delivery.id} 
                      className={`cursor-pointer transition-colors ${
                        selectedDelivery?.id === delivery.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                      }`}
                      onClick={() => setSelectedDelivery(delivery)}
                    >
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between mb-3">
                          <div className="flex items-center space-x-3">
                            <Badge className={`${getStatusColor(delivery.status)} text-white`}>
                              {getStatusIcon(delivery.status)}
                              <span className="ml-1">
                                {delivery.status === 'PENDING' && 'Pendente'}
                                {delivery.status === 'ASSIGNED' && 'Atribuído'}
                                {delivery.status === 'IN_TRANSIT' && 'Em Trânsito'}
                                {delivery.status === 'DELIVERED' && 'Entregue'}
                                {delivery.status === 'CANCELLED' && 'Cancelado'}
                              </span>
                            </Badge>
                            <span className="font-semibold">{delivery.orderNumber}</span>
                          </div>
                          <div className="text-sm text-muted-foreground">
                            {new Date(delivery.createdAt).toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })}
                          </div>
                        </div>

                        <div className="space-y-2">
                          <div className="flex items-center space-x-2">
                            <User className="h-4 w-4 text-muted-foreground" />
                            <span className="font-medium">{delivery.customerName}</span>
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{delivery.customerPhone}</span>
                          </div>

                          <div className="flex items-center space-x-2">
                            <MapPin className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{formatAddress(delivery.deliveryAddress)}</span>
                          </div>

                          <div className="flex items-center justify-between text-sm">
                            <div className="flex items-center space-x-4">
                              <div className="flex items-center space-x-1">
                                <Clock className="h-4 w-4 text-muted-foreground" />
                                <span>{formatTime(delivery.estimatedTime)}</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <Navigation className="h-4 w-4 text-muted-foreground" />
                                <span>{delivery.distance} km</span>
                              </div>
                              <div className="flex items-center space-x-1">
                                <DollarSign className="h-4 w-4 text-muted-foreground" />
                                <span>R$ {delivery.fee.toFixed(2)}</span>
                              </div>
                            </div>

                            {delivery.rating && (
                              <div className="flex items-center space-x-1">
                                <Star className="h-4 w-4 text-yellow-500" />
                                <span>{delivery.rating}</span>
                              </div>
                            )}
                          </div>

                          {delivery.driverName && (
                            <div className="flex items-center space-x-2 text-sm">
                              <Truck className="h-4 w-4 text-muted-foreground" />
                              <span>Entregador: {delivery.driverName}</span>
                            </div>
                          )}
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </ScrollArea>
            </TabsContent>
          </Tabs>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Selected Delivery Details */}
          {selectedDelivery && (
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center">
                  <Truck className="mr-2 h-5 w-5" />
                  Detalhes da Entrega
                </CardTitle>
                <CardDescription>{selectedDelivery.orderNumber}</CardDescription>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-3">
                  <div>
                    <Label className="text-sm font-medium">Cliente</Label>
                    <div className="mt-1">
                      <div className="font-medium">{selectedDelivery.customerName}</div>
                      <div className="text-sm text-muted-foreground">{selectedDelivery.customerPhone}</div>
                    </div>
                  </div>

                  <div>
                    <Label className="text-sm font-medium">Endereço de Entrega</Label>
                    <div className="mt-1 text-sm">
                      {formatAddress(selectedDelivery.deliveryAddress)}
                      <div className="text-muted-foreground">
                        {selectedDelivery.deliveryAddress.city}
                      </div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Distância</Label>
                      <div className="mt-1 font-medium">{selectedDelivery.distance} km</div>
                    </div>
                    <div>
                      <Label className="text-sm font-medium">Taxa de Entrega</Label>
                      <div className="mt-1 font-medium">R$ {selectedDelivery.fee.toFixed(2)}</div>
                    </div>
                  </div>

                  <div className="grid grid-cols-2 gap-4">
                    <div>
                      <Label className="text-sm font-medium">Tempo Estimado</Label>
                      <div className="mt-1 font-medium">{formatTime(selectedDelivery.estimatedTime)}</div>
                    </div>
                    {selectedDelivery.actualTime && (
                      <div>
                        <Label className="text-sm font-medium">Tempo Real</Label>
                        <div className="mt-1 font-medium">{formatTime(selectedDelivery.actualTime)}</div>
                      </div>
                    )}
                  </div>

                  {selectedDelivery.driverName && (
                    <div>
                      <Label className="text-sm font-medium">Entregador</Label>
                      <div className="mt-1">
                        <div className="font-medium">{selectedDelivery.driverName}</div>
                        <div className="text-sm text-muted-foreground">{selectedDelivery.driverPhone}</div>
                      </div>
                    </div>
                  )}

                  {selectedDelivery.notes && (
                    <div>
                      <Label className="text-sm font-medium">Observações</Label>
                      <div className="mt-1 text-sm">{selectedDelivery.notes}</div>
                    </div>
                  )}

                  {selectedDelivery.rating && (
                    <div>
                      <Label className="text-sm font-medium">Avaliação</Label>
                      <div className="mt-1 flex items-center space-x-1">
                        <Star className="h-4 w-4 text-yellow-500" />
                        <span className="font-medium">{selectedDelivery.rating}/5</span>
                      </div>
                    </div>
                  )}

                  <div className="flex space-x-2 pt-4">
                    <Button className="flex-1">
                      <Navigation className="mr-2 h-4 w-4" />
                      Rastrear
                    </Button>
                    <Button variant="outline" className="flex-1">
                      <Phone className="mr-2 h-4 w-4" />
                      Contato
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Available Drivers */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center">
                <User className="mr-2 h-5 w-5" />
                Entregadores Disponíveis
              </CardTitle>
            </CardHeader>
            <CardContent>
              <ScrollArea className="h-[300px]">
                <div className="space-y-3">
                  {drivers.filter(d => d.status === 'AVAILABLE').map((driver) => (
                    <div key={driver.id} className="p-3 border rounded-lg">
                      <div className="flex items-center justify-between mb-2">
                        <div className="font-medium">{driver.name}</div>
                        <div className="flex items-center space-x-1">
                          <Star className="h-4 w-4 text-yellow-500" />
                          <span className="text-sm">{driver.rating}</span>
                        </div>
                      </div>
                      <div className="text-sm text-muted-foreground mb-2">
                        {driver.phone}
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <div className="flex items-center space-x-2">
                          <div className={`w-2 h-2 rounded-full ${getDriverStatusColor(driver.status)}`} />
                          <span>{driver.status === 'AVAILABLE' ? 'Disponível' : driver.status}</span>
                        </div>
                        <span>{driver.todayDeliveries} entregas hoje</span>
                      </div>
                    </div>
                  ))}
                </div>
              </ScrollArea>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  )
}