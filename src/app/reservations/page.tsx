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
  Calendar, 
  Clock, 
  Users, 
  Phone, 
  Mail,
  MapPin,
  CheckCircle,
  XCircle,
  AlertCircle,
  Plus,
  Edit,
  Trash2,
  Search,
  Filter,
  Utensils,
  Chair
} from 'lucide-react'

interface Reservation {
  id: string
  reservationNumber: string
  customerName: string
  customerPhone: string
  customerEmail?: string
  date: string
  time: string
  partySize: number
  tableNumber?: string
  status: 'PENDING' | 'CONFIRMED' | 'SEATED' | 'COMPLETED' | 'CANCELLED' | 'NO_SHOW'
  specialRequests?: string
  occasion?: string
  createdAt: string
  updatedAt: string
  notes?: string
}

interface Table {
  id: string
  number: string
  capacity: number
  area: string
  status: 'AVAILABLE' | 'RESERVED' | 'OCCUPIED' | 'MAINTENANCE'
  position: {
    x: number
    y: number
  }
}

export default function ReservationsPage() {
  const [reservations, setReservations] = useState<Reservation[]>([])
  const [tables, setTables] = useState<Table[]>([])
  const [filteredReservations, setFilteredReservations] = useState<Reservation[]>([])
  const [selectedReservation, setSelectedReservation] = useState<Reservation | null>(null)
  const [searchTerm, setSearchTerm] = useState('')
  const [statusFilter, setStatusFilter] = useState('all')
  const [dateFilter, setDateFilter] = useState(new Date().toISOString().split('T')[0])
  const [activeTab, setActiveTab] = useState('list')

  useEffect(() => {
    const loadData = async () => {
      await new Promise(resolve => setTimeout(resolve, 1000))
      
      // Mock reservations data
      const mockReservations: Reservation[] = [
        {
          id: '1',
          reservationNumber: 'RES001',
          customerName: 'João Silva',
          customerPhone: '(11) 9999-1234',
          customerEmail: 'joao@email.com',
          date: '2024-01-15',
          time: '19:00',
          partySize: 4,
          tableNumber: 'T5',
          status: 'CONFIRMED',
          specialRequests: 'Cadeira para criança',
          occasion: 'Aniversário',
          createdAt: '2024-01-10T10:00:00Z',
          updatedAt: '2024-01-10T10:00:00Z',
          notes: 'Cliente VIP'
        },
        {
          id: '2',
          reservationNumber: 'RES002',
          customerName: 'Maria Santos',
          customerPhone: '(11) 9999-5678',
          customerEmail: 'maria@email.com',
          date: '2024-01-15',
          time: '20:30',
          partySize: 2,
          tableNumber: 'T12',
          status: 'PENDING',
          createdAt: '2024-01-12T14:30:00Z',
          updatedAt: '2024-01-12T14:30:00Z'
        },
        {
          id: '3',
          reservationNumber: 'RES003',
          customerName: 'Pedro Oliveira',
          customerPhone: '(11) 9999-9012',
          customerEmail: 'pedro@email.com',
          date: '2024-01-15',
          time: '18:00',
          partySize: 6,
          tableNumber: 'T8',
          status: 'SEATED',
          specialRequests: 'Janela preferencial',
          createdAt: '2024-01-11T09:15:00Z',
          updatedAt: '2024-01-11T09:15:00Z'
        },
        {
          id: '4',
          reservationNumber: 'RES004',
          customerName: 'Ana Costa',
          customerPhone: '(11) 9999-3456',
          customerEmail: 'ana@email.com',
          date: '2024-01-14',
          time: '19:30',
          partySize: 3,
          status: 'COMPLETED',
          createdAt: '2024-01-09T16:20:00Z',
          updatedAt: '2024-01-14T21:00:00Z'
        }
      ]

      const mockTables: Table[] = [
        { id: '1', number: 'T1', capacity: 2, area: 'Janela', status: 'AVAILABLE', position: { x: 50, y: 50 } },
        { id: '2', number: 'T2', capacity: 2, area: 'Janela', status: 'RESERVED', position: { x: 150, y: 50 } },
        { id: '3', number: 'T3', capacity: 4, area: 'Centro', status: 'AVAILABLE', position: { x: 50, y: 150 } },
        { id: '4', number: 'T4', capacity: 4, area: 'Centro', status: 'OCCUPIED', position: { x: 150, y: 150 } },
        { id: '5', number: 'T5', capacity: 4, area: 'Janela', status: 'RESERVED', position: { x: 250, y: 50 } },
        { id: '6', number: 'T6', capacity: 6, area: 'Fundos', status: 'AVAILABLE', position: { x: 50, y: 250 } },
        { id: '7', number: 'T7', capacity: 6, area: 'Fundos', status: 'AVAILABLE', position: { x: 150, y: 250 } },
        { id: '8', number: 'T8', capacity: 6, area: 'Fundos', status: 'OCCUPIED', position: { x: 250, y: 250 } },
        { id: '9', number: 'T9', capacity: 8, area: 'VIP', status: 'AVAILABLE', position: { x: 350, y: 150 } },
        { id: '10', number: 'T10', capacity: 2, area: 'Bar', status: 'AVAILABLE', position: { x: 350, y: 50 } },
        { id: '11', number: 'T11', capacity: 2, area: 'Bar', status: 'AVAILABLE', position: { x: 350, y: 100 } },
        { id: '12', number: 'T12', capacity: 4, area: 'Janela', status: 'RESERVED', position: { x: 250, y: 150 } }
      ]

      setReservations(mockReservations)
      setTables(mockTables)
      setFilteredReservations(mockReservations)
    }

    loadData()
  }, [])

  useEffect(() => {
    let filtered = reservations

    // Apply search filter
    if (searchTerm) {
      filtered = filtered.filter(reservation => 
        reservation.reservationNumber.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customerName.toLowerCase().includes(searchTerm.toLowerCase()) ||
        reservation.customerPhone.includes(searchTerm)
      )
    }

    // Apply status filter
    if (statusFilter !== 'all') {
      filtered = filtered.filter(reservation => reservation.status === statusFilter)
    }

    // Apply date filter
    if (dateFilter) {
      filtered = filtered.filter(reservation => reservation.date === dateFilter)
    }

    setFilteredReservations(filtered)
  }, [reservations, searchTerm, statusFilter, dateFilter])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'PENDING': return 'bg-yellow-500'
      case 'CONFIRMED': return 'bg-blue-500'
      case 'SEATED': return 'bg-purple-500'
      case 'COMPLETED': return 'bg-green-500'
      case 'CANCELLED': return 'bg-red-500'
      case 'NO_SHOW': return 'bg-orange-500'
      default: return 'bg-gray-500'
    }
  }

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'PENDING': return <Clock className="h-4 w-4" />
      case 'CONFIRMED': return <CheckCircle className="h-4 w-4" />
      case 'SEATED': return <Chair className="h-4 w-4" />
      case 'COMPLETED': return <CheckCircle className="h-4 w-4" />
      case 'CANCELLED': return <XCircle className="h-4 w-4" />
      case 'NO_SHOW': return <AlertCircle className="h-4 w-4" />
      default: return <AlertCircle className="h-4 w-4" />
    }
  }

  const getTableStatusColor = (status: string) => {
    switch (status) {
      case 'AVAILABLE': return 'bg-green-500'
      case 'RESERVED': return 'bg-yellow-500'
      case 'OCCUPIED': return 'bg-red-500'
      case 'MAINTENANCE': return 'bg-gray-500'
      default: return 'bg-gray-500'
    }
  }

  const formatDateTime = (date: string, time: string) => {
    const dateObj = new Date(`${date}T${time}`)
    return dateObj.toLocaleString('pt-BR', {
      weekday: 'short',
      day: '2-digit',
      month: '2-digit',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Reservas</h1>
          <p className="text-muted-foreground">
            Gerencie as reservas do restaurante e mesas disponíveis
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline">
            <Calendar className="mr-2 h-4 w-4" />
            Calendário
          </Button>
          <Button>
            <Plus className="mr-2 h-4 w-4" />
            Nova Reserva
          </Button>
        </div>
      </div>

      {/* Stats Cards */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Hoje</CardTitle>
            <Calendar className="h-4 w-4 text-blue-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-blue-600">
              {reservations.filter(r => r.date === new Date().toISOString().split('T')[0]).length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Confirmadas</CardTitle>
            <CheckCircle className="h-4 w-4 text-green-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-green-600">
              {reservations.filter(r => r.status === 'CONFIRMED').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Pendentes</CardTitle>
            <Clock className="h-4 w-4 text-yellow-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-yellow-600">
              {reservations.filter(r => r.status === 'PENDING').length}
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Mesas Livres</CardTitle>
            <Chair className="h-4 w-4 text-purple-500" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-purple-600">
              {tables.filter(t => t.status === 'AVAILABLE').length}
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
          <div className="grid gap-4 md:grid-cols-4">
            <div className="space-y-2">
              <Label className="text-sm font-medium">Buscar</Label>
              <div className="relative">
                <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 h-4 w-4 text-muted-foreground" />
                <Input
                  placeholder="Nome ou reserva..."
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  className="pl-10"
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label className="text-sm font-medium">Data</Label>
              <Input
                type="date"
                value={dateFilter}
                onChange={(e) => setDateFilter(e.target.value)}
              />
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
                  <SelectItem value="CONFIRMED">Confirmada</SelectItem>
                  <SelectItem value="SEATED">Acomodado</SelectItem>
                  <SelectItem value="COMPLETED">Concluída</SelectItem>
                  <SelectItem value="CANCELLED">Cancelada</SelectItem>
                  <SelectItem value="NO_SHOW">Não Compareceu</SelectItem>
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
      <Tabs value={activeTab} onValueChange={setActiveTab}>
        <TabsList>
          <TabsTrigger value="list">Lista de Reservas</TabsTrigger>
          <TabsTrigger value="floor">Mapa do Restaurante</TabsTrigger>
          <TabsTrigger value="calendar">Calendário</TabsTrigger>
        </TabsList>

        <TabsContent value="list" className="space-y-4">
          <ScrollArea className="h-[600px]">
            <div className="space-y-4">
              {filteredReservations.map((reservation) => (
                <Card 
                  key={reservation.id} 
                  className={`cursor-pointer transition-colors ${
                    selectedReservation?.id === reservation.id ? 'ring-2 ring-primary' : 'hover:bg-muted/50'
                  }`}
                  onClick={() => setSelectedReservation(reservation)}
                >
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between mb-3">
                      <div className="flex items-center space-x-3">
                        <Badge className={`${getStatusColor(reservation.status)} text-white`}>
                          {getStatusIcon(reservation.status)}
                          <span className="ml-1">
                            {reservation.status === 'PENDING' && 'Pendente'}
                            {reservation.status === 'CONFIRMED' && 'Confirmada'}
                            {reservation.status === 'SEATED' && 'Acomodado'}
                            {reservation.status === 'COMPLETED' && 'Concluída'}
                            {reservation.status === 'CANCELLED' && 'Cancelada'}
                            {reservation.status === 'NO_SHOW' && 'Não Compareceu'}
                          </span>
                        </Badge>
                        <span className="font-semibold">{reservation.reservationNumber}</span>
                      </div>
                      <div className="text-sm text-muted-foreground">
                        {formatDateTime(reservation.date, reservation.time)}
                      </div>
                    </div>

                    <div className="space-y-2">
                      <div className="flex items-center space-x-4">
                        <div className="flex items-center space-x-2">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">{reservation.customerName}</span>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Phone className="h-4 w-4 text-muted-foreground" />
                          <span className="text-sm">{reservation.customerPhone}</span>
                        </div>
                        {reservation.customerEmail && (
                          <div className="flex items-center space-x-2">
                            <Mail className="h-4 w-4 text-muted-foreground" />
                            <span className="text-sm">{reservation.customerEmail}</span>
                          </div>
                        )}
                      </div>

                      <div className="flex items-center space-x-4 text-sm">
                        <div className="flex items-center space-x-1">
                          <Users className="h-4 w-4 text-muted-foreground" />
                          <span>{reservation.partySize} pessoas</span>
                        </div>
                        {reservation.tableNumber && (
                          <div className="flex items-center space-x-1">
                            <Chair className="h-4 w-4 text-muted-foreground" />
                            <span>Mesa {reservation.tableNumber}</span>
                          </div>
                        )}
                        {reservation.occasion && (
                          <div className="flex items-center space-x-1">
                            <Calendar className="h-4 w-4 text-muted-foreground" />
                            <span>{reservation.occasion}</span>
                          </div>
                        )}
                      </div>

                      {reservation.specialRequests && (
                        <div className="text-sm">
                          <span className="font-medium">Pedido especial: </span>
                          {reservation.specialRequests}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </ScrollArea>
        </TabsContent>

        <TabsContent value="floor" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Mapa do Restaurante</CardTitle>
              <CardDescription>Visualização das mesas e seu status atual</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="relative bg-muted/30 rounded-lg p-8" style={{ height: '500px' }}>
                {/* Restaurant floor map */}
                <div className="absolute inset-4 border-2 border-dashed border-muted-foreground/20 rounded">
                  {/* Area labels */}
                  <div className="absolute top-2 left-2 text-xs font-medium text-muted-foreground">Janela</div>
                  <div className="absolute top-2 left-1/2 transform -translate-x-1/2 text-xs font-medium text-muted-foreground">Centro</div>
                  <div className="absolute top-2 right-2 text-xs font-medium text-muted-foreground">VIP</div>
                  <div className="absolute bottom-2 left-2 text-xs font-medium text-muted-foreground">Fundos</div>
                  <div className="absolute bottom-2 right-2 text-xs font-medium text-muted-foreground">Bar</div>

                  {/* Tables */}
                  {tables.map((table) => (
                    <div
                      key={table.id}
                      className={`absolute w-12 h-12 rounded-lg border-2 cursor-pointer transition-colors flex items-center justify-center text-xs font-medium ${
                        table.status === 'AVAILABLE' ? 'bg-green-100 border-green-500 text-green-700' :
                        table.status === 'RESERVED' ? 'bg-yellow-100 border-yellow-500 text-yellow-700' :
                        table.status === 'OCCUPIED' ? 'bg-red-100 border-red-500 text-red-700' :
                        'bg-gray-100 border-gray-500 text-gray-700'
                      }`}
                      style={{
                        left: `${table.position.x}px`,
                        top: `${table.position.y}px`,
                        transform: 'translate(-50%, -50%)'
                      }}
                      title={`Mesa ${table.number} - ${table.capacity} pessoas - ${
                        table.status === 'AVAILABLE' ? 'Disponível' :
                        table.status === 'RESERVED' ? 'Reservada' :
                        table.status === 'OCCUPIED' ? 'Ocupada' :
                        'Manutenção'
                      }`}
                    >
                      {table.number}
                    </div>
                  ))}
                </div>
              </div>

              {/* Legend */}
              <div className="mt-4 flex flex-wrap gap-4 text-sm">
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-green-100 border border-green-500 rounded"></div>
                  <span>Disponível</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-yellow-100 border border-yellow-500 rounded"></div>
                  <span>Reservada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-red-100 border border-red-500 rounded"></div>
                  <span>Ocupada</span>
                </div>
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 bg-gray-100 border border-gray-500 rounded"></div>
                  <span>Manutenção</span>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="calendar" className="space-y-4">
          <Card>
            <CardHeader>
              <CardTitle>Calendário de Reservas</CardTitle>
              <CardDescription>Visualização mensal das reservas</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-center py-8 text-muted-foreground">
                <Calendar className="h-12 w-12 mx-auto mb-4" />
                <p>Visualização do calendário em desenvolvimento</p>
                <p className="text-sm">Em breve você poderá ver todas as reservas em um calendário interativo</p>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Selected Reservation Details */}
      {selectedReservation && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center">
              <Calendar className="mr-2 h-5 w-5" />
              Detalhes da Reserva
            </CardTitle>
            <CardDescription>{selectedReservation.reservationNumber}</CardDescription>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2">
              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <div className="mt-1">
                    <div className="font-medium">{selectedReservation.customerName}</div>
                    <div className="text-sm text-muted-foreground">{selectedReservation.customerPhone}</div>
                    {selectedReservation.customerEmail && (
                      <div className="text-sm text-muted-foreground">{selectedReservation.customerEmail}</div>
                    )}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Data e Hora</Label>
                  <div className="mt-1 font-medium">
                    {formatDateTime(selectedReservation.date, selectedReservation.time)}
                  </div>
                </div>

                <div>
                  <Label className="text-sm font-medium">Número de Pessoas</Label>
                  <div className="mt-1 font-medium">{selectedReservation.partySize} pessoas</div>
                </div>

                {selectedReservation.tableNumber && (
                  <div>
                    <Label className="text-sm font-medium">Mesa</Label>
                    <div className="mt-1 font-medium">Mesa {selectedReservation.tableNumber}</div>
                  </div>
                )}
              </div>

              <div className="space-y-4">
                <div>
                  <Label className="text-sm font-medium">Status</Label>
                  <div className="mt-1">
                    <Badge className={`${getStatusColor(selectedReservation.status)} text-white`}>
                      {getStatusIcon(selectedReservation.status)}
                      <span className="ml-1">
                        {selectedReservation.status === 'PENDING' && 'Pendente'}
                        {selectedReservation.status === 'CONFIRMED' && 'Confirmada'}
                        {selectedReservation.status === 'SEATED' && 'Acomodado'}
                        {selectedReservation.status === 'COMPLETED' && 'Concluída'}
                        {selectedReservation.status === 'CANCELLED' && 'Cancelada'}
                        {selectedReservation.status === 'NO_SHOW' && 'Não Compareceu'}
                      </span>
                    </Badge>
                  </div>
                </div>

                {selectedReservation.occasion && (
                  <div>
                    <Label className="text-sm font-medium">Ocasião</Label>
                    <div className="mt-1 font-medium">{selectedReservation.occasion}</div>
                  </div>
                )}

                {selectedReservation.specialRequests && (
                  <div>
                    <Label className="text-sm font-medium">Pedidos Especiais</Label>
                    <div className="mt-1 text-sm">{selectedReservation.specialRequests}</div>
                  </div>
                )}

                {selectedReservation.notes && (
                  <div>
                    <Label className="text-sm font-medium">Observações</Label>
                    <div className="mt-1 text-sm">{selectedReservation.notes}</div>
                  </div>
                )}

                <div className="flex space-x-2 pt-4">
                  <Button className="flex-1">
                    <Edit className="mr-2 h-4 w-4" />
                    Editar
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Phone className="mr-2 h-4 w-4" />
                    Contato
                  </Button>
                  <Button variant="outline" className="flex-1">
                    <Trash2 className="mr-2 h-4 w-4" />
                    Cancelar
                  </Button>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  )
}