"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { 
  Truck, 
  MapPin, 
  Clock, 
  DollarSign, 
  User, 
  Phone,
  Package,
  Navigation,
  CheckCircle,
  AlertCircle,
  RefreshCw
} from 'lucide-react'

interface DeliveryQuote {
  id: string
  provider: 'lalamove' | 'uber' | 'local'
  price: number
  currency: string
  estimatedDuration: number
  distance: number
  driver?: {
    id: string
    name: string
    phone: string
    vehicle: string
    rating: number
  }
}

interface DeliveryRequest {
  orderId: string
  pickupAddress: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  deliveryAddress: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
  }
  items: {
    name: string
    quantity: number
    size?: string
  }[]
  specialInstructions?: string
  priority: 'normal' | 'urgent' | 'scheduled'
}

export default function DeliveryDemo() {
  const [quotes, setQuotes] = useState<DeliveryQuote[]>([])
  const [selectedQuote, setSelectedQuote] = useState<DeliveryQuote | null>(null)
  const [deliveryResponse, setDeliveryResponse] = useState<any>(null)
  const [trackingInfo, setTrackingInfo] = useState<any>(null)
  const [loading, setLoading] = useState(false)
  const [trackingLoading, setTrackingLoading] = useState(false)

  // Form state
  const [orderId, setOrderId] = useState('TEST-001')
  const [priority, setPriority] = useState<'normal' | 'urgent' | 'scheduled'>('normal')
  const [specialInstructions, setSpecialInstructions] = useState('')
  
  // Pickup address
  const [pickupStreet, setPickupStreet] = useState('Av. Paulista')
  const [pickupNumber, setPickupNumber] = useState('1000')
  const [pickupNeighborhood, setPickupNeighborhood] = useState('Bela Vista')
  const [pickupCity, setPickupCity] = useState('São Paulo')
  const [pickupState, setPickupState] = useState('SP')
  const [pickupZipCode, setPickupZipCode] = useState('01310-100')
  
  // Delivery address
  const [deliveryStreet, setDeliveryStreet] = useState('Rua das Flores')
  const [deliveryNumber, setDeliveryNumber] = useState('123')
  const [deliveryNeighborhood, setDeliveryNeighborhood] = useState('Centro')
  const [deliveryCity, setDeliveryCity] = useState('São Paulo')
  const [deliveryState, setDeliveryState] = useState('SP')
  const [deliveryZipCode, setDeliveryZipCode] = useState('01234-567')

  const getQuotes = async () => {
    setLoading(true)
    
    try {
      const request: DeliveryRequest = {
        orderId,
        pickupAddress: {
          street: pickupStreet,
          number: pickupNumber,
          neighborhood: pickupNeighborhood,
          city: pickupCity,
          state: pickupState,
          zipCode: pickupZipCode
        },
        deliveryAddress: {
          street: deliveryStreet,
          number: deliveryNumber,
          neighborhood: deliveryNeighborhood,
          city: deliveryCity,
          state: deliveryState,
          zipCode: deliveryZipCode
        },
        items: [
          { name: 'Coxinha', quantity: 5 },
          { name: 'Mini Churros', quantity: 3 }
        ],
        specialInstructions,
        priority
      }

      const response = await fetch('/api/delivery/quote', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(request),
      })

      if (response.ok) {
        const data = await response.json()
        setQuotes(data.quotes)
        setDeliveryResponse(null)
        setTrackingInfo(null)
      } else {
        throw new Error('Failed to get quotes')
      }
    } catch (error) {
      console.error('Error getting quotes:', error)
      alert('Erro ao obter cotações')
    } finally {
      setLoading(false)
    }
  }

  const requestDelivery = async () => {
    if (!selectedQuote) {
      alert('Selecione uma cotação primeiro')
      return
    }

    setLoading(true)
    
    try {
      const request: DeliveryRequest = {
        orderId,
        pickupAddress: {
          street: pickupStreet,
          number: pickupNumber,
          neighborhood: pickupNeighborhood,
          city: pickupCity,
          state: pickupState,
          zipCode: pickupZipCode
        },
        deliveryAddress: {
          street: deliveryStreet,
          number: deliveryNumber,
          neighborhood: deliveryNeighborhood,
          city: deliveryCity,
          state: deliveryState,
          zipCode: deliveryZipCode
        },
        items: [
          { name: 'Coxinha', quantity: 5 },
          { name: 'Mini Churros', quantity: 3 }
        ],
        specialInstructions,
        priority
      }

      const response = await fetch('/api/delivery/request', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          ...request,
          provider: selectedQuote.provider
        }),
      })

      if (response.ok) {
        const data = await response.json()
        setDeliveryResponse(data.delivery)
        setTrackingInfo(null)
      } else {
        throw new Error('Failed to request delivery')
      }
    } catch (error) {
      console.error('Error requesting delivery:', error)
      alert('Erro ao solicitar entrega')
    } finally {
      setLoading(false)
    }
  }

  const trackDelivery = async () => {
    if (!deliveryResponse?.deliveryId) {
      alert('Nenhuma entrega para rastrear')
      return
    }

    setTrackingLoading(true)
    
    try {
      const response = await fetch(`/api/delivery/track/${deliveryResponse.deliveryId}?provider=${selectedQuote?.provider || 'local'}`)
      
      if (response.ok) {
        const data = await response.json()
        setTrackingInfo(data.tracking)
      } else {
        throw new Error('Failed to track delivery')
      }
    } catch (error) {
      console.error('Error tracking delivery:', error)
      alert('Erro ao rastrear entrega')
    } finally {
      setTrackingLoading(false)
    }
  }

  const cancelDelivery = async () => {
    if (!deliveryResponse?.deliveryId) {
      alert('Nenhuma entrega para cancelar')
      return
    }

    if (!confirm('Tem certeza que deseja cancelar esta entrega?')) {
      return
    }

    setLoading(true)
    
    try {
      const response = await fetch(`/api/delivery/cancel/${deliveryResponse.deliveryId}`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          provider: selectedQuote?.provider || 'local',
          reason: 'Cancelado pelo usuário'
        }),
      })

      if (response.ok) {
        setDeliveryResponse(null)
        setTrackingInfo(null)
        alert('Entrega cancelada com sucesso')
      } else {
        throw new Error('Failed to cancel delivery')
      }
    } catch (error) {
      console.error('Error cancelling delivery:', error)
      alert('Erro ao cancelar entrega')
    } finally {
      setLoading(false)
    }
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="text-center space-y-2">
          <h1 className="text-3xl font-bold tracking-tight">Demonstração de API de Entrega</h1>
          <p className="text-muted-foreground">
            Teste a integração com serviços de entrega e motoristas
          </p>
        </div>

        <Tabs defaultValue="quote" className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="quote">Cotação</TabsTrigger>
            <TabsTrigger value="request">Solicitar Motorista</TabsTrigger>
            <TabsTrigger value="tracking">Rastreamento</TabsTrigger>
          </TabsList>

          <TabsContent value="quote" className="space-y-6">
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
              {/* Form */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Informações da Entrega
                  </CardTitle>
                  <CardDescription>
                    Preencha os dados para obter cotações de entrega
                  </CardDescription>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="orderId">ID do Pedido</Label>
                      <Input
                        id="orderId"
                        value={orderId}
                        onChange={(e) => setOrderId(e.target.value)}
                        placeholder="TEST-001"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="priority">Prioridade</Label>
                      <Select value={priority} onValueChange={(value: any) => setPriority(value)}>
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="normal">Normal</SelectItem>
                          <SelectItem value="urgent">Urgente</SelectItem>
                          <SelectItem value="scheduled">Agendado</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Endereço de Retirada</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickupStreet">Rua</Label>
                        <Input
                          id="pickupStreet"
                          value={pickupStreet}
                          onChange={(e) => setPickupStreet(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickupNumber">Número</Label>
                        <Input
                          id="pickupNumber"
                          value={pickupNumber}
                          onChange={(e) => setPickupNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="pickupNeighborhood">Bairro</Label>
                        <Input
                          id="pickupNeighborhood"
                          value={pickupNeighborhood}
                          onChange={(e) => setPickupNeighborhood(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="pickupZipCode">CEP</Label>
                        <Input
                          id="pickupZipCode"
                          value={pickupZipCode}
                          onChange={(e) => setPickupZipCode(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <Separator />

                  <div className="space-y-2">
                    <Label className="text-sm font-medium">Endereço de Entrega</Label>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryStreet">Rua</Label>
                        <Input
                          id="deliveryStreet"
                          value={deliveryStreet}
                          onChange={(e) => setDeliveryStreet(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryNumber">Número</Label>
                        <Input
                          id="deliveryNumber"
                          value={deliveryNumber}
                          onChange={(e) => setDeliveryNumber(e.target.value)}
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-2 gap-4">
                      <div className="space-y-2">
                        <Label htmlFor="deliveryNeighborhood">Bairro</Label>
                        <Input
                          id="deliveryNeighborhood"
                          value={deliveryNeighborhood}
                          onChange={(e) => setDeliveryNeighborhood(e.target.value)}
                        />
                      </div>
                      <div className="space-y-2">
                        <Label htmlFor="deliveryZipCode">CEP</Label>
                        <Input
                          id="deliveryZipCode"
                          value={deliveryZipCode}
                          onChange={(e) => setDeliveryZipCode(e.target.value)}
                        />
                      </div>
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label htmlFor="specialInstructions">Instruções Especiais</Label>
                    <Textarea
                      id="specialInstructions"
                      value={specialInstructions}
                      onChange={(e) => setSpecialInstructions(e.target.value)}
                      placeholder="Instruções para o motorista..."
                      rows={3}
                    />
                  </div>

                  <Button onClick={getQuotes} disabled={loading} className="w-full">
                    {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                    {loading ? 'Obtendo Cotações...' : 'Obter Cotações'}
                  </Button>
                </CardContent>
              </Card>

              {/* Quotes */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <DollarSign className="h-5 w-5" />
                    Cotações Disponíveis
                  </CardTitle>
                  <CardDescription>
                    Selecione uma opção para solicitar o motorista
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  {quotes.length === 0 ? (
                    <div className="text-center py-8 text-muted-foreground">
                      <Truck className="h-12 w-12 mx-auto mb-4 opacity-50" />
                      <p>Nenhuma cotação disponível</p>
                      <p className="text-sm">Preencha o formulário e clique em "Obter Cotações"</p>
                    </div>
                  ) : (
                    <div className="space-y-4">
                      {quotes.map((quote) => (
                        <div
                          key={quote.id}
                          className={`p-4 border rounded-lg cursor-pointer transition-colors ${
                            selectedQuote?.id === quote.id
                              ? 'border-primary bg-primary/10'
                              : 'border-border hover:border-primary/50'
                          }`}
                          onClick={() => setSelectedQuote(quote)}
                        >
                          <div className="flex items-center justify-between mb-2">
                            <Badge variant={quote.provider === 'lalamove' ? 'default' : 'secondary'}>
                              {quote.provider.toUpperCase()}
                            </Badge>
                            <div className="text-right">
                              <div className="text-lg font-bold">R$ {quote.price.toFixed(2)}</div>
                              <div className="text-sm text-muted-foreground">{quote.currency}</div>
                            </div>
                          </div>
                          
                          <div className="grid grid-cols-2 gap-4 text-sm">
                            <div className="flex items-center gap-2">
                              <Clock className="h-4 w-4" />
                              {quote.estimatedDuration} min
                            </div>
                            <div className="flex items-center gap-2">
                              <Navigation className="h-4 w-4" />
                              {quote.distance} km
                            </div>
                          </div>

                          {quote.driver && (
                            <div className="mt-3 pt-3 border-t">
                              <div className="flex items-center gap-2 text-sm">
                                <User className="h-4 w-4" />
                                <span>{quote.driver.name}</span>
                                <Badge variant="outline">⭐ {quote.driver.rating}</Badge>
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {quote.driver.vehicle} • {quote.driver.phone}
                              </div>
                            </div>
                          )}
                        </div>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            </div>
          </TabsContent>

          <TabsContent value="request" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Solicitar Motorista
                </CardTitle>
                <CardDescription>
                  {selectedQuote
                    ? `Solicitar entrega com ${selectedQuote.provider.toUpperCase()}`
                    : 'Selecione uma cotação primeiro'
                  }
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {selectedQuote && (
                  <div className="p-4 border rounded-lg">
                    <h3 className="font-medium mb-2">Cotação Selecionada</h3>
                    <div className="grid grid-cols-3 gap-4 text-sm">
                      <div>
                        <div className="text-muted-foreground">Provedor</div>
                        <div className="font-medium">{selectedQuote.provider.toUpperCase()}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Preço</div>
                        <div className="font-medium">R$ {selectedQuote.price.toFixed(2)}</div>
                      </div>
                      <div>
                        <div className="text-muted-foreground">Tempo</div>
                        <div className="font-medium">{selectedQuote.estimatedDuration} min</div>
                      </div>
                    </div>
                  </div>
                )}

                {deliveryResponse ? (
                  <div className="space-y-4">
                    <div className="flex items-center gap-2 text-green-600">
                      <CheckCircle className="h-5 w-5" />
                      <span className="font-medium">Motorista solicitado com sucesso!</span>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <Card>
                        <CardHeader className="pb-3">
                          <CardTitle className="text-lg">Informações da Entrega</CardTitle>
                        </CardHeader>
                        <CardContent className="space-y-3">
                          <div>
                            <div className="text-sm text-muted-foreground">ID da Entrega</div>
                            <div className="font-mono">{deliveryResponse.deliveryId}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">URL de Rastreamento</div>
                            <a 
                              href={deliveryResponse.trackingUrl} 
                              target="_blank" 
                              rel="noopener noreferrer"
                              className="text-blue-600 hover:underline"
                            >
                              {deliveryResponse.trackingUrl}
                            </a>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Previsão de Retirada</div>
                            <div>{new Date(deliveryResponse.estimatedPickup).toLocaleString('pt-BR')}</div>
                          </div>
                          <div>
                            <div className="text-sm text-muted-foreground">Previsão de Entrega</div>
                            <div>{new Date(deliveryResponse.estimatedDelivery).toLocaleString('pt-BR')}</div>
                          </div>
                        </CardContent>
                      </Card>

                      {deliveryResponse.driver && (
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Informações do Motorista</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-3">
                            <div className="flex items-center gap-3">
                              <div className="w-12 h-12 bg-primary/10 rounded-full flex items-center justify-center">
                                <User className="h-6 w-6" />
                              </div>
                              <div>
                                <div className="font-medium">{deliveryResponse.driver.name}</div>
                                <div className="text-sm text-muted-foreground">{deliveryResponse.driver.vehicle}</div>
                              </div>
                            </div>
                            <div className="grid grid-cols-2 gap-3 text-sm">
                              <div>
                                <div className="text-muted-foreground">Telefone</div>
                                <div>{deliveryResponse.driver.phone}</div>
                              </div>
                              <div>
                                <div className="text-muted-foreground">Avaliação</div>
                                <div>⭐ {deliveryResponse.driver.rating}</div>
                              </div>
                            </div>
                            <div>
                              <div className="text-muted-foreground">Previsão de Chegada</div>
                              <div>{deliveryResponse.driver.estimatedArrival} minutos</div>
                            </div>
                          </CardContent>
                        </Card>
                      )}
                    </div>

                    <div className="flex gap-2">
                      <Button onClick={cancelDelivery} disabled={loading} variant="destructive">
                        Cancelar Entrega
                      </Button>
                    </div>
                  </div>
                ) : (
                  <div className="text-center">
                    <Button 
                      onClick={requestDelivery} 
                      disabled={!selectedQuote || loading}
                      size="lg"
                    >
                      {loading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <Truck className="mr-2 h-4 w-4" />}
                      {loading ? 'Solicitando...' : 'Solicitar Motorista'}
                    </Button>
                    {!selectedQuote && (
                      <p className="text-sm text-muted-foreground mt-2">
                        Selecione uma cotação na aba anterior
                      </p>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="tracking" className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Navigation className="h-5 w-5" />
                  Rastreamento de Entrega
                </CardTitle>
                <CardDescription>
                  Acompanhe a entrega em tempo real
                </CardDescription>
              </CardHeader>
              <CardContent className="space-y-6">
                {deliveryResponse ? (
                  <div className="space-y-6">
                    <div className="flex items-center justify-between">
                      <div>
                        <h3 className="font-medium">Entrega: {deliveryResponse.deliveryId}</h3>
                        <p className="text-sm text-muted-foreground">
                          Provedor: {selectedQuote?.provider.toUpperCase()}
                        </p>
                      </div>
                      <Button onClick={trackDelivery} disabled={trackingLoading}>
                        {trackingLoading ? <RefreshCw className="mr-2 h-4 w-4 animate-spin" /> : <RefreshCw className="mr-2 h-4 w-4" />}
                        {trackingLoading ? 'Atualizando...' : 'Atualizar Rastreamento'}
                      </Button>
                    </div>

                    {trackingInfo ? (
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Status da Entrega</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="flex items-center gap-2">
                              <Badge variant={trackingInfo.status === 'on_the_way' ? 'default' : 'secondary'}>
                                {trackingInfo.status === 'preparing' && 'Preparando'}
                                {trackingInfo.status === 'on_the_way' && 'A Caminho'}
                                {trackingInfo.status === 'delivered' && 'Entregue'}
                              </Badge>
                            </div>
                            
                            <div>
                              <div className="text-sm text-muted-foreground">Progresso</div>
                              <div className="w-full bg-secondary rounded-full h-2 mt-1">
                                <div 
                                  className="bg-primary h-2 rounded-full transition-all" 
                                  style={{ width: `${trackingInfo.progress || 0}%` }}
                                />
                              </div>
                              <div className="text-xs text-muted-foreground mt-1">
                                {trackingInfo.progress || 0}% completo
                              </div>
                            </div>

                            <div>
                              <div className="text-sm text-muted-foreground">Tempo Estimado</div>
                              <div className="font-medium">{trackingInfo.estimatedArrival} minutos</div>
                            </div>
                          </CardContent>
                        </Card>

                        <Card>
                          <CardHeader className="pb-3">
                            <CardTitle className="text-lg">Localização do Motorista</CardTitle>
                          </CardHeader>
                          <CardContent className="space-y-4">
                            <div className="h-32 bg-muted rounded-lg flex items-center justify-center">
                              <div className="text-center">
                                <MapPin className="h-8 w-8 mx-auto mb-2 text-muted-foreground" />
                                <p className="text-sm text-muted-foreground">
                                  Mapa seria exibido aqui
                                </p>
                                <p className="text-xs text-muted-foreground">
                                  Lat: {trackingInfo.driverLocation?.lat}, Lng: {trackingInfo.driverLocation?.lng}
                                </p>
                              </div>
                            </div>
                            
                            <div className="text-sm">
                              <div className="text-muted-foreground">Última atualização</div>
                              <div>{new Date().toLocaleString('pt-BR')}</div>
                            </div>
                          </CardContent>
                        </Card>
                      </div>
                    ) : (
                      <div className="text-center py-8 text-muted-foreground">
                        <Navigation className="h-12 w-12 mx-auto mb-4 opacity-50" />
                        <p>Clique em "Atualizar Rastreamento" para ver o status atual</p>
                      </div>
                    )}
                  </div>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    <AlertCircle className="h-12 w-12 mx-auto mb-4 opacity-50" />
                    <p>Nenhuma entrega para rastrear</p>
                    <p className="text-sm">Solicite uma entrega primeiro</p>
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  )
}