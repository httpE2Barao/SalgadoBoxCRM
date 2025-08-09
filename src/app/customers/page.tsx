"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { ScrollArea } from '@/components/ui/scroll-area'
import { Separator } from '@/components/ui/separator'
import { 
  Users, 
  Search, 
  Phone, 
  Mail, 
  MapPin, 
  Calendar,
  DollarSign,
  ShoppingCart,
  Star,
  MessageCircle,
  Plus,
  Edit,
  Trash2,
  Filter,
  TrendingUp,
  Clock,
  AlertCircle,
  CheckCircle
} from 'lucide-react'

interface Customer {
  id: string
  name?: string
  email?: string
  phone?: string
  avatar?: string
  birthDate?: string
  notes?: string
  tags: string[]
  source?: string
  isActive: boolean
  createdAt: string
  updatedAt: string
  lastOrderAt?: string
  totalOrders: number
  totalSpent: number
  averageTicket: number
  segment: 'active' | 'potential' | 'inactive'
  orders: Order[]
  customerNotes: CustomerNote[]
}

interface Order {
  id: string
  orderNumber: string
  status: string
  total: number
  type: string
  createdAt: string
}

interface CustomerNote {
  id: string
  note: string
  createdAt: string
  staffName: string
}

export default function CustomerManagement() {
  const [customers, setCustomers] = useState<Customer[]>([])
  const [filteredCustomers, setFilteredCustomers] = useState<Customer[]>([])
  const [selectedCustomer, setSelectedCustomer] = useState<Customer | null>(null)
  const [isCustomerDetailOpen, setIsCustomerDetailOpen] = useState(false)
  const [isNoteDialogOpen, setIsNoteDialogOpen] = useState(false)
  const [searchTerm, setSearchTerm] = useState('')
  const [segmentFilter, setSegmentFilter] = useState<string>('all')
  const [sourceFilter, setSourceFilter] = useState<string>('all')
  const [activeTab, setActiveTab] = useState('all')
  const [newNote, setNewNote] = useState('')

  useEffect(() => {
    // Load mock data
    const mockCustomers: Customer[] = [
      {
        id: '1',
        name: 'João Silva',
        email: 'joao.silva@email.com',
        phone: '(11) 99999-1234',
        birthDate: '1990-05-15',
        notes: 'Cliente fiel, sempre pede aos sábados',
        tags: ['VIP', 'Sábado'],
        source: 'WhatsApp',
        isActive: true,
        createdAt: '2024-01-01T10:00:00Z',
        updatedAt: '2024-01-15T10:30:00Z',
        lastOrderAt: '2024-01-15T10:30:00Z',
        totalOrders: 15,
        totalSpent: 847.50,
        averageTicket: 56.50,
        segment: 'active',
        orders: [
          { id: '1', orderNumber: '#1234', status: 'DELIVERED', total: 90.50, type: 'DELIVERY', createdAt: '2024-01-15T10:30:00Z' },
          { id: '2', orderNumber: '#1220', status: 'DELIVERED', total: 85.00, type: 'DELIVERY', createdAt: '2024-01-13T19:20:00Z' }
        ],
        customerNotes: [
          { id: '1', note: 'Cliente gosta de molho extra', createdAt: '2024-01-10T15:00:00Z', staffName: 'Maria' }
        ]
      },
      {
        id: '2',
        name: 'Maria Santos',
        email: 'maria.santos@email.com',
        phone: '(11) 99999-5678',
        tags: ['Novo'],
        source: 'Instagram',
        isActive: true,
        createdAt: '2024-01-10T14:00:00Z',
        updatedAt: '2024-01-10T14:00:00Z',
        totalOrders: 1,
        totalSpent: 45.00,
        averageTicket: 45.00,
        segment: 'potential',
        orders: [
          { id: '3', orderNumber: '#1235', status: 'PENDING', total: 45.00, type: 'TAKEAWAY', createdAt: '2024-01-15T10:45:00Z' }
        ],
        customerNotes: []
      },
      {
        id: '3',
        name: 'Pedro Oliveira',
        email: 'pedro.oliveira@email.com',
        phone: '(11) 99999-9012',
        birthDate: '1985-08-20',
        notes: 'Cliente antigo, não compra há 2 meses',
        tags: ['Antigo'],
        source: 'App',
        isActive: true,
        createdAt: '2023-10-01T09:00:00Z',
        updatedAt: '2023-11-15T16:00:00Z',
        lastOrderAt: '2023-11-15T16:00:00Z',
        totalOrders: 8,
        totalSpent: 425.00,
        averageTicket: 53.12,
        segment: 'inactive',
        orders: [
          { id: '4', orderNumber: '#1100', status: 'DELIVERED', total: 67.80, type: 'DELIVERY', createdAt: '2023-11-15T16:00:00Z' }
        ],
        customerNotes: [
          { id: '2', note: 'Cliente reclamou da demora na entrega', createdAt: '2023-11-10T14:00:00Z', staffName: 'João' }
        ]
      }
    ]

    setCustomers(mockCustomers)
    setFilteredCustomers(mockCustomers)
  }, [])

  useEffect(() => {
    let filtered = customers

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(customer => 
        customer.name?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.email?.toLowerCase().includes(searchTerm.toLowerCase()) ||
        customer.phone?.includes(searchTerm) ||
        customer.tags.some(tag => tag.toLowerCase().includes(searchTerm.toLowerCase()))
      )
    }

    // Apply segment filter
    if (segmentFilter !== 'all') {
      filtered = filtered.filter(customer => customer.segment === segmentFilter)
    }

    // Apply source filter
    if (sourceFilter !== 'all') {
      filtered = filtered.filter(customer => customer.source === sourceFilter)
    }

    // Apply tab filter
    if (activeTab === 'active') {
      filtered = filtered.filter(customer => customer.segment === 'active')
    } else if (activeTab === 'potential') {
      filtered = filtered.filter(customer => customer.segment === 'potential')
    } else if (activeTab === 'inactive') {
      filtered = filtered.filter(customer => customer.segment === 'inactive')
    }

    setFilteredCustomers(filtered)
  }, [customers, searchTerm, segmentFilter, sourceFilter, activeTab])

  const getSegmentColor = (segment: string) => {
    switch (segment) {
      case 'active': return 'bg-green-500'
      case 'potential': return 'bg-yellow-500'
      case 'inactive': return 'bg-red-500'
      default: return 'bg-gray-500'
    }
  }

  const getSegmentIcon = (segment: string) => {
    switch (segment) {
      case 'active': return <CheckCircle className="h-4 w-4" />
      case 'potential': return <Clock className="h-4 w-4" />
      case 'inactive': return <AlertCircle className="h-4 w-4" />
      default: return <Users className="h-4 w-4" />
    }
  }

  const addCustomerNote = (customerId: string, note: string) => {
    const newCustomerNote: CustomerNote = {
      id: Date.now().toString(),
      note,
      createdAt: new Date().toISOString(),
      staffName: 'Usuário Atual'
    }

    setCustomers(customers.map(customer => 
      customer.id === customerId
        ? {
            ...customer,
            customerNotes: [...customer.customerNotes, newCustomerNote],
            updatedAt: new Date().toISOString()
          }
        : customer
    ))

    setNewNote('')
    setIsNoteDialogOpen(false)
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

  const getDaysSinceLastOrder = (lastOrderAt?: string) => {
    if (!lastOrderAt) return 'Nunca comprou'
    const days = Math.floor((new Date().getTime() - new Date(lastOrderAt).getTime()) / (1000 * 60 * 60 * 24))
    return `${days} dias`
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">CRM - Gestão de Clientes</h1>
            <p className="text-muted-foreground">
              Gerencie seu relacionamento com os clientes
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button variant="outline">
              <TrendingUp className="mr-2 h-4 w-4" />
              Exportar
            </Button>
            <Button>
              <Plus className="mr-2 h-4 w-4" />
              Novo Cliente
            </Button>
          </div>
        </div>

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total de Clientes</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{customers.length}</div>
              <p className="text-xs text-muted-foreground">
                +{customers.filter(c => new Date(c.createdAt) > new Date(Date.now() - 30 * 24 * 60 * 60 * 1000)).length} novos este mês
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">
                {customers.filter(c => c.segment === 'active').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Compraram nos últimos 30 dias
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Potenciais</CardTitle>
              <Clock className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">
                {customers.filter(c => c.segment === 'potential').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Primeira compra em andamento
              </p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Clientes Inativos</CardTitle>
              <AlertCircle className="h-4 w-4 text-red-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">
                {customers.filter(c => c.segment === 'inactive').length}
              </div>
              <p className="text-xs text-muted-foreground">
                Sem compra há mais de 30 dias
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
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div className="space-y-2">
                <Label className="text-sm font-medium">Buscar</Label>
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                  <Input
                    placeholder="Nome, email, telefone..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="pl-10"
                  />
                </div>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Segmento</Label>
                <Select value={segmentFilter} onValueChange={setSegmentFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos os segmentos" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="potential">Potenciais</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Origem</Label>
                <Select value={sourceFilter} onValueChange={setSourceFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas as origens" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas</SelectItem>
                    <SelectItem value="WhatsApp">WhatsApp</SelectItem>
                    <SelectItem value="Instagram">Instagram</SelectItem>
                    <SelectItem value="App">App</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label className="text-sm font-medium">Ações</Label>
                <Button variant="outline" className="w-full" onClick={() => {
                  setSearchTerm('')
                  setSegmentFilter('all')
                  setSourceFilter('all')
                }}>
                  <Filter className="mr-2 h-4 w-4" />
                  Limpar Filtros
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Customers List */}
        <Card>
          <CardHeader>
            <CardTitle>Clientes</CardTitle>
            <CardDescription>
              Lista de todos os clientes cadastrados
            </CardDescription>
          </CardHeader>
          <CardContent>
            <Tabs value={activeTab} onValueChange={setActiveTab} className="space-y-4">
              <TabsList>
                <TabsTrigger value="all">Todos</TabsTrigger>
                <TabsTrigger value="active">Ativos</TabsTrigger>
                <TabsTrigger value="potential">Potenciais</TabsTrigger>
                <TabsTrigger value="inactive">Inativos</TabsTrigger>
              </TabsList>

              <TabsContent value={activeTab}>
                <ScrollArea className="h-[600px]">
                  <div className="space-y-4">
                    {filteredCustomers.map((customer) => (
                      <div key={customer.id} className="border rounded-lg p-4 space-y-4">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="flex items-center justify-center w-10 h-10 bg-primary text-primary-foreground rounded-full">
                              {customer.name ? customer.name.charAt(0).toUpperCase() : '?'}
                            </div>
                            <div>
                              <h3 className="font-semibold">{customer.name || 'Cliente sem nome'}</h3>
                              <div className="flex items-center space-x-2">
                                <Badge className={`${getSegmentColor(customer.segment)} text-white text-xs`}>
                                  {getSegmentIcon(customer.segment)}
                                  <span className="ml-1 capitalize">{customer.segment}</span>
                                </Badge>
                                {customer.source && (
                                  <Badge variant="outline" className="text-xs">
                                    {customer.source}
                                  </Badge>
                                )}
                              </div>
                            </div>
                          </div>
                          <div className="flex items-center space-x-2">
                            <Button variant="outline" size="sm" onClick={() => {
                              setSelectedCustomer(customer)
                              setIsCustomerDetailOpen(true)
                            }}>
                              <Edit className="h-4 w-4" />
                            </Button>
                            <Button variant="outline" size="sm">
                              <MessageCircle className="h-4 w-4" />
                            </Button>
                          </div>
                        </div>

                        <div className="grid gap-4 md:grid-cols-3">
                          <div className="space-y-2">
                            {customer.email && (
                              <div className="flex items-center space-x-2">
                                <Mail className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.email}</span>
                              </div>
                            )}
                            {customer.phone && (
                              <div className="flex items-center space-x-2">
                                <Phone className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">{customer.phone}</span>
                              </div>
                            )}
                            {customer.birthDate && (
                              <div className="flex items-center space-x-2">
                                <Calendar className="h-4 w-4 text-muted-foreground" />
                                <span className="text-sm">Aniversário: {formatDate(customer.birthDate)}</span>
                              </div>
                            )}
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Total de pedidos:</span>
                              <span className="font-medium">{customer.totalOrders}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Total gasto:</span>
                              <span className="font-medium">{formatCurrency(customer.totalSpent)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Ticket médio:</span>
                              <span className="font-medium">{formatCurrency(customer.averageTicket)}</span>
                            </div>
                          </div>
                          <div className="space-y-2">
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Último pedido:</span>
                              <span className="font-medium">{getDaysSinceLastOrder(customer.lastOrderAt)}</span>
                            </div>
                            <div className="flex items-center justify-between">
                              <span className="text-sm text-muted-foreground">Cliente desde:</span>
                              <span className="font-medium">{formatDate(customer.createdAt)}</span>
                            </div>
                            {customer.tags.length > 0 && (
                              <div className="flex flex-wrap gap-1">
                                {customer.tags.map((tag, index) => (
                                  <Badge key={index} variant="secondary" className="text-xs">
                                    {tag}
                                  </Badge>
                                ))}
                              </div>
                            )}
                          </div>
                        </div>

                        {customer.notes && (
                          <div className="p-3 bg-muted rounded-lg">
                            <p className="text-sm text-muted-foreground">{customer.notes}</p>
                          </div>
                        )}
                      </div>
                    ))}
                  </div>
                </ScrollArea>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>

      {/* Customer Detail Dialog */}
      <Dialog open={isCustomerDetailOpen} onOpenChange={setIsCustomerDetailOpen}>
        <DialogContent className="sm:max-w-[800px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Cliente</DialogTitle>
            <DialogDescription>
              Informações completas do cliente
            </DialogDescription>
          </DialogHeader>
          {selectedCustomer && (
            <div className="space-y-6">
              <Tabs defaultValue="info" className="space-y-4">
                <TabsList>
                  <TabsTrigger value="info">Informações</TabsTrigger>
                  <TabsTrigger value="orders">Pedidos</TabsTrigger>
                  <TabsTrigger value="notes">Notas</TabsTrigger>
                </TabsList>

                <TabsContent value="info" className="space-y-4">
                  <div className="grid gap-4 md:grid-cols-2">
                    <div className="space-y-3">
                      <h4 className="font-semibold">Dados Pessoais</h4>
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{selectedCustomer.name || 'Não informado'}</span>
                        </div>
                        {selectedCustomer.email && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedCustomer.email}</span>
                          </div>
                        )}
                        {selectedCustomer.phone && (
                          <div className="flex items-center space-x-2">
                            <Phone className="h-4 w-4 text-muted-foreground" />
                            <span>{selectedCustomer.phone}</span>
                          </div>
                        )}
                        {selectedCustomer.birthDate && (
                          <div className="flex items-center space-x-2">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>Aniversário: {formatDate(selectedCustomer.birthDate)}</span>
                          </div>
                        )}
                      </div>
                    </div>
                    <div className="space-y-3">
                      <h4 className="font-semibold">Informações de Compra</h4>
                      <div className="space-y-2">
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total de pedidos:</span>
                          <span className="font-medium">{selectedCustomer.totalOrders}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Total gasto:</span>
                          <span className="font-medium">{formatCurrency(selectedCustomer.totalSpent)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Ticket médio:</span>
                          <span className="font-medium">{formatCurrency(selectedCustomer.averageTicket)}</span>
                        </div>
                        <div className="flex items-center justify-between">
                          <span className="text-sm text-muted-foreground">Último pedido:</span>
                          <span className="font-medium">{getDaysSinceLastOrder(selectedCustomer.lastOrderAt)}</span>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="space-y-3">
                    <h4 className="font-semibold">Segmentação</h4>
                    <div className="flex items-center space-x-2">
                      <Badge className={`${getSegmentColor(selectedCustomer.segment)} text-white`}>
                        {getSegmentIcon(selectedCustomer.segment)}
                        <span className="ml-1 capitalize">{selectedCustomer.segment}</span>
                      </Badge>
                      {selectedCustomer.source && (
                        <Badge variant="outline">Origem: {selectedCustomer.source}</Badge>
                      )}
                    </div>
                  </div>

                  {selectedCustomer.tags.length > 0 && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Tags</h4>
                      <div className="flex flex-wrap gap-2">
                        {selectedCustomer.tags.map((tag, index) => (
                          <Badge key={index} variant="secondary">{tag}</Badge>
                        ))}
                      </div>
                    </div>
                  )}

                  {selectedCustomer.notes && (
                    <div className="space-y-3">
                      <h4 className="font-semibold">Observações</h4>
                      <div className="p-3 bg-muted rounded-lg">
                        <p className="text-sm">{selectedCustomer.notes}</p>
                      </div>
                    </div>
                  )}
                </TabsContent>

                <TabsContent value="orders" className="space-y-4">
                  <div className="space-y-3">
                    <h4 className="font-semibold">Histórico de Pedidos</h4>
                    <div className="space-y-2">
                      {selectedCustomer.orders.map((order) => (
                        <div key={order.id} className="border rounded p-3">
                          <div className="flex items-center justify-between">
                            <div>
                              <p className="font-medium">{order.orderNumber}</p>
                              <p className="text-sm text-muted-foreground">{formatDateTime(order.createdAt)}</p>
                            </div>
                            <div className="text-right">
                              <p className="font-medium">{formatCurrency(order.total)}</p>
                              <Badge variant="outline" className="text-xs">
                                {order.type}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="notes" className="space-y-4">
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <h4 className="font-semibold">Notas do Cliente</h4>
                      <Button size="sm" onClick={() => setIsNoteDialogOpen(true)}>
                        <Plus className="h-4 w-4 mr-2" />
                        Adicionar Nota
                      </Button>
                    </div>
                    <div className="space-y-2">
                      {selectedCustomer.customerNotes.map((note) => (
                        <div key={note.id} className="border rounded p-3">
                          <div className="flex items-center justify-between mb-2">
                            <span className="font-medium text-sm">{note.staffName}</span>
                            <span className="text-xs text-muted-foreground">{formatDateTime(note.createdAt)}</span>
                          </div>
                          <p className="text-sm">{note.note}</p>
                        </div>
                      ))}
                    </div>
                  </div>
                </TabsContent>
              </Tabs>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsCustomerDetailOpen(false)}>
              Fechar
            </Button>
            <Button>
              <MessageCircle className="mr-2 h-4 w-4" />
              Enviar Mensagem
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Add Note Dialog */}
      <Dialog open={isNoteDialogOpen} onOpenChange={setIsNoteDialogOpen}>
        <DialogContent className="sm:max-w-[425px]">
          <DialogHeader>
            <DialogTitle>Adicionar Nota</DialogTitle>
            <DialogDescription>
              Adicione uma nota sobre este cliente
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="space-y-2">
              <Label htmlFor="note">Nota</Label>
              <Textarea
                id="note"
                value={newNote}
                onChange={(e) => setNewNote(e.target.value)}
                rows={4}
                placeholder="Digite sua nota aqui..."
              />
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsNoteDialogOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={() => selectedCustomer && addCustomerNote(selectedCustomer.id, newNote)}>
              Salvar Nota
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  )
}