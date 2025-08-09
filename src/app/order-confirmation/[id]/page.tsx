'use client'

import { useEffect, useState } from 'react'
import { useParams, useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { CheckCircle, Clock, MapPin, Phone, Utensils, CreditCard } from 'lucide-react'

interface OrderItem {
  id: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Order {
  id: string
  orderNumber: string
  status: string
  customerName: string
  customerPhone: string
  customerEmail: string
  deliveryAddress: string
  deliveryNeighborhood: string
  deliveryCity: string
  deliveryState: string
  deliveryZipCode: string
  deliveryInstructions: string
  paymentMethod: string
  subtotal: number
  deliveryFee: number
  total: number
  orderItems: OrderItem[]
  lalamoveTrackingUrl?: string
  createdAt: string
}

export default function OrderConfirmation() {
  const params = useParams()
  const router = useRouter()
  const [order, setOrder] = useState<Order | null>(null)
  const [loading, setLoading] = useState(true)
  const [statusUpdates, setStatusUpdates] = useState<string[]>([])

  useEffect(() => {
    const fetchOrder = async () => {
      try {
        const response = await fetch(`/api/orders/${params.id}`)
        if (response.ok) {
          const orderData = await response.json()
          setOrder(orderData)
        }
      } catch (error) {
        console.error('Error fetching order:', error)
      } finally {
        setLoading(false)
      }
    }

    if (params.id) {
      fetchOrder()
      
      // Set up status update simulation
      const updates = [
        'Pedido confirmado!',
        'Iniciando preparo dos itens...',
        'Pedido pronto para retirada!',
        'Motorista a caminho!',
        'Pedido entregue! 🎉'
      ]
      
      updates.forEach((update, index) => {
        setTimeout(() => {
          setStatusUpdates(prev => [...prev, update])
        }, (index + 1) * 10000) // Update every 10 seconds
      })
    }
  }, [params.id])

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'pending': return 'bg-yellow-100 text-yellow-800'
      case 'confirmed': return 'bg-blue-100 text-blue-800'
      case 'preparing': return 'bg-orange-100 text-orange-800'
      case 'ready': return 'bg-green-100 text-green-800'
      case 'driver_dispatched': return 'bg-purple-100 text-purple-800'
      case 'delivered': return 'bg-green-100 text-green-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const getStatusText = (status: string) => {
    switch (status) {
      case 'pending': return 'Pendente'
      case 'confirmed': return 'Confirmado'
      case 'preparing': return 'Preparando'
      case 'ready': return 'Pronto'
      case 'driver_dispatched': return 'Motorista a caminho'
      case 'delivered': return 'Entregue'
      default: return status
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-amber-600 mx-auto mb-4"></div>
          <p className="text-gray-600">Carregando informações do pedido...</p>
        </div>
      </div>
    )
  }

  if (!order) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Pedido não encontrado</CardTitle>
            <CardDescription>Não foi possível encontrar as informações do pedido.</CardDescription>
          </CardHeader>
          <CardContent>
            <Button onClick={() => router.push('/public-menu')} className="w-full">
              Voltar ao Cardápio
            </Button>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 to-emerald-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-amber-600">SALGADO BOX</h1>
            </div>
          </div>
        </div>
      </header>

      <div className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Success Message */}
        <div className="text-center mb-8">
          <CheckCircle className="h-16 w-16 text-green-600 mx-auto mb-4" />
          <h2 className="text-3xl font-bold text-gray-900 mb-2">Pedido Confirmado!</h2>
          <p className="text-gray-600">Seu pedido foi recebido e está sendo processado.</p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Order Details */}
          <div className="space-y-6">
            {/* Order Status */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Clock className="h-5 w-5" />
                  Status do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="flex items-center gap-2 mb-4">
                  <Badge className={getStatusColor(order.status)}>
                    {getStatusText(order.status)}
                  </Badge>
                  <span className="text-sm text-gray-500">
                    Pedido #{order.orderNumber}
                  </span>
                </div>
                
                {/* Status Updates */}
                <div className="space-y-2">
                  {statusUpdates.map((update, index) => (
                    <div key={index} className="flex items-center gap-2 text-sm text-gray-600">
                      <CheckCircle className="h-4 w-4 text-green-600" />
                      {update}
                    </div>
                  ))}
                </div>

                {order.lalamoveTrackingUrl && (
                  <div className="mt-4">
                    <Button 
                      variant="outline" 
                      className="w-full"
                      onClick={() => window.open(order.lalamoveTrackingUrl, '_blank')}
                    >
                      Acompanhar Entrega
                    </Button>
                  </div>
                )}
              </CardContent>
            </Card>

            {/* Customer Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Phone className="h-5 w-5" />
                  Informações do Cliente
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div>
                  <p className="font-medium">{order.customerName}</p>
                  <p className="text-sm text-gray-600">{order.customerPhone}</p>
                  {order.customerEmail && (
                    <p className="text-sm text-gray-600">{order.customerEmail}</p>
                  )}
                </div>
              </CardContent>
            </Card>

            {/* Delivery Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <MapPin className="h-5 w-5" />
                  Endereço de Entrega
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-1">
                  <p className="font-medium">{order.deliveryAddress}</p>
                  <p className="text-sm text-gray-600">
                    {order.deliveryNeighborhood}, {order.deliveryCity} - {order.deliveryState}
                  </p>
                  <p className="text-sm text-gray-600">CEP: {order.deliveryZipCode}</p>
                  {order.deliveryInstructions && (
                    <p className="text-sm text-gray-600 mt-2">
                      <strong>Instruções:</strong> {order.deliveryInstructions}
                    </p>
                  )}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Order Summary */}
          <div className="space-y-6">
            {/* Order Items */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Utensils className="h-5 w-5" />
                  Itens do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {order.orderItems.map(item => (
                    <div key={item.id} className="flex justify-between items-center">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.name}</p>
                        <p className="text-gray-500 text-xs">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        R$ {item.totalPrice.toFixed(2)}
                      </p>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Payment Information */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <CreditCard className="h-5 w-5" />
                  Informações de Pagamento
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  <div className="flex justify-between">
                    <span>Forma de pagamento:</span>
                    <span className="font-medium">
                      {order.paymentMethod === 'credit_card' ? 'Cartão de Crédito' :
                       order.paymentMethod === 'debit_card' ? 'Cartão de Débito' :
                       order.paymentMethod === 'pix' ? 'PIX' : 'Dinheiro'}
                    </span>
                  </div>
                  
                  <div className="border-t pt-3 space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>R$ {order.subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de entrega</span>
                      <span>R$ {order.deliveryFee.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between font-bold text-lg border-t pt-2">
                      <span>Total</span>
                      <span>R$ {order.total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Actions */}
            <Card>
              <CardContent className="pt-6">
                <div className="space-y-3">
                  <Button 
                    variant="outline" 
                    className="w-full"
                    onClick={() => router.push('/public-menu')}
                  >
                    Fazer Novo Pedido
                  </Button>
                  <Button 
                    variant="ghost" 
                    className="w-full"
                    onClick={() => {
                      // Share order details
                      if (navigator.share) {
                        navigator.share({
                          title: 'Meu Pedido - SALGADO BOX',
                          text: `Pedido #${order.orderNumber} - Total: R$ ${order.total.toFixed(2)}`,
                          url: window.location.href
                        })
                      }
                    }}
                  >
                    Compartilhar Pedido
                  </Button>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}