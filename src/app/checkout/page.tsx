'use client'

import { useState } from 'react'
import { useRouter } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { useCartStore } from '@/store/cart'
import { CreditCard, MapPin, Phone, User, Truck } from 'lucide-react'

interface CartItem {
  product: {
    id: string
    name: string
    description: string
    price: number
    category: string
  }
  quantity: number
}

interface CheckoutForm {
  customerName: string
  phone: string
  email: string
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  deliveryInstructions: string
  paymentMethod: 'credit_card' | 'debit_card' | 'pix' | 'cash'
}

export default function Checkout() {
  const router = useRouter()
  const { items, getTotal, clearCart } = useCartStore()
  const [isSubmitting, setIsSubmitting] = useState(false)
  const [form, setForm] = useState<CheckoutForm>({
    customerName: '',
    phone: '',
    email: '',
    address: '',
    number: '',
    complement: '',
    neighborhood: '',
    city: '',
    state: '',
    zipCode: '',
    deliveryInstructions: '',
    paymentMethod: 'credit_card'
  })

  const deliveryFee = 5.00
  const subtotal = getTotal()
  const total = subtotal + deliveryFee

  const handleInputChange = (field: keyof CheckoutForm, value: string) => {
    setForm(prev => ({ ...prev, [field]: value }))
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setIsSubmitting(true)

    try {
      // Create order object
      const orderData = {
        customer: {
          name: form.customerName,
          phone: form.phone,
          email: form.email
        },
        delivery: {
          address: form.address,
          number: form.number,
          complement: form.complement,
          neighborhood: form.neighborhood,
          city: form.city,
          state: form.state,
          zipCode: form.zipCode,
          instructions: form.deliveryInstructions
        },
        items: items.map(item => ({
          productId: item.product.id,
          name: item.product.name,
          quantity: item.quantity,
          unitPrice: item.product.price,
          totalPrice: item.product.price * item.quantity
        })),
        payment: {
          method: form.paymentMethod,
          amount: total
        },
        totals: {
          subtotal,
          deliveryFee,
          total
        }
      }

      // Send order to backend
      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (!response.ok) {
        throw new Error('Failed to create order')
      }

      const order = await response.json()

      // Clear cart and redirect to confirmation
      clearCart()
      router.push(`/order-confirmation/${order.id}`)

    } catch (error) {
      console.error('Error creating order:', error)
      alert('Erro ao processar pedido. Por favor, tente novamente.')
    } finally {
      setIsSubmitting(false)
    }
  }

  if (items.length === 0) {
    return (
      <div className="min-h-screen bg-gray-50 flex items-center justify-center">
        <Card className="w-full max-w-md">
          <CardHeader>
            <CardTitle>Carrinho Vazio</CardTitle>
            <CardDescription>Seu carrinho de compras está vazio.</CardDescription>
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
    <div className="min-h-screen bg-gray-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex justify-between items-center h-16">
            <div className="flex items-center">
              <h1 className="text-2xl font-bold text-amber-600">SALGADO BOX</h1>
            </div>
            <Button variant="outline" onClick={() => router.push('/public-menu')}>
              Voltar ao Cardápio
            </Button>
          </div>
        </div>
      </header>

      <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Checkout Form */}
          <div className="lg:col-span-2">
            <form onSubmit={handleSubmit} className="space-y-6">
              {/* Customer Information */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <User className="h-5 w-5" />
                    Informações Pessoais
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label htmlFor="name">Nome Completo *</Label>
                      <Input
                        id="name"
                        value={form.customerName}
                        onChange={(e) => handleInputChange('customerName', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="phone">Telefone *</Label>
                      <Input
                        id="phone"
                        value={form.phone}
                        onChange={(e) => handleInputChange('phone', e.target.value)}
                        placeholder="(11) 99999-9999"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="email">E-mail</Label>
                    <Input
                      id="email"
                      type="email"
                      value={form.email}
                      onChange={(e) => handleInputChange('email', e.target.value)}
                      placeholder="seu@email.com"
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Delivery Address */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <MapPin className="h-5 w-5" />
                    Endereço de Entrega
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-4">
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="md:col-span-2">
                      <Label htmlFor="address">Rua *</Label>
                      <Input
                        id="address"
                        value={form.address}
                        onChange={(e) => handleInputChange('address', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        value={form.number}
                        onChange={(e) => handleInputChange('number', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="complement">Complemento</Label>
                      <Input
                        id="complement"
                        value={form.complement}
                        onChange={(e) => handleInputChange('complement', e.target.value)}
                      />
                    </div>
                    <div>
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        value={form.neighborhood}
                        onChange={(e) => handleInputChange('neighborhood', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="city">Cidade *</Label>
                      <Input
                        id="city"
                        value={form.city}
                        onChange={(e) => handleInputChange('city', e.target.value)}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="state">Estado *</Label>
                      <Input
                        id="state"
                        value={form.state}
                        onChange={(e) => handleInputChange('state', e.target.value)}
                        maxLength={2}
                        required
                      />
                    </div>
                    <div>
                      <Label htmlFor="zipCode">CEP *</Label>
                      <Input
                        id="zipCode"
                        value={form.zipCode}
                        onChange={(e) => handleInputChange('zipCode', e.target.value)}
                        placeholder="00000-000"
                        required
                      />
                    </div>
                  </div>
                  <div>
                    <Label htmlFor="instructions">Instruções de Entrega</Label>
                    <Textarea
                      id="instructions"
                      value={form.deliveryInstructions}
                      onChange={(e) => handleInputChange('deliveryInstructions', e.target.value)}
                      placeholder="Ex: Apartamento 42, tocar interfone, etc."
                    />
                  </div>
                </CardContent>
              </Card>

              {/* Payment Method */}
              <Card>
                <CardHeader>
                  <CardTitle className="flex items-center gap-2">
                    <CreditCard className="h-5 w-5" />
                    Forma de Pagamento
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-2 gap-4">
                    {[
                      { value: 'credit_card', label: 'Cartão de Crédito' },
                      { value: 'debit_card', label: 'Cartão de Débito' },
                      { value: 'pix', label: 'PIX' },
                      { value: 'cash', label: 'Dinheiro' }
                    ].map(method => (
                      <Button
                        key={method.value}
                        type="button"
                        variant={form.paymentMethod === method.value ? 'default' : 'outline'}
                        className="h-16"
                        onClick={() => handleInputChange('paymentMethod', method.value)}
                      >
                        {method.label}
                      </Button>
                    ))}
                  </div>
                </CardContent>
              </Card>

              <Button type="submit" className="w-full h-12" disabled={isSubmitting}>
                {isSubmitting ? 'Processando...' : 'Finalizar Pedido'}
              </Button>
            </form>
          </div>

          {/* Order Summary */}
          <div className="lg:col-span-1">
            <Card className="sticky top-8">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Truck className="h-5 w-5" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {items.map((item: CartItem) => (
                    <div key={item.product.id} className="flex justify-between">
                      <div className="flex-1">
                        <p className="font-medium text-sm">{item.product.name}</p>
                        <p className="text-gray-500 text-xs">Qtd: {item.quantity}</p>
                      </div>
                      <p className="font-medium">
                        R$ {(item.product.price * item.quantity).toFixed(2)}
                      </p>
                    </div>
                  ))}
                  
                  <Separator />
                  
                  <div className="space-y-2">
                    <div className="flex justify-between">
                      <span>Subtotal</span>
                      <span>R$ {subtotal.toFixed(2)}</span>
                    </div>
                    <div className="flex justify-between">
                      <span>Taxa de Entrega</span>
                      <span>R$ {deliveryFee.toFixed(2)}</span>
                    </div>
                    <Separator />
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>R$ {total.toFixed(2)}</span>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  )
}