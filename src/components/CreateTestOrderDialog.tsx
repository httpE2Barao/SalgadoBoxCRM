"use client"

import { useState } from 'react'
import { Button } from '@/components/ui/button'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Textarea } from '@/components/ui/textarea'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import { Plus, Minus, ShoppingCart } from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  category: string
  stock: number
}

interface TestOrderItem {
  productId: string
  productName: string
  quantity: number
  price: number
}

interface CreateTestOrderDialogProps {
  isOpen: boolean
  onClose: () => void
  onOrderCreated: () => void
}

export default function CreateTestOrderDialog({ isOpen, onClose, onOrderCreated }: CreateTestOrderDialogProps) {
  const [customerName, setCustomerName] = useState('')
  const [customerPhone, setCustomerPhone] = useState('')
  const [customerEmail, setCustomerEmail] = useState('')
  const [orderType, setOrderType] = useState<'DELIVERY' | 'TAKEAWAY' | 'DINE_IN'>('DELIVERY')
  const [paymentMethod, setPaymentMethod] = useState('PIX')
  const [notes, setNotes] = useState('')
  const [isCreating, setIsCreating] = useState(false)
  
  // Endereço de entrega
  const [street, setStreet] = useState('')
  const [number, setNumber] = useState('')
  const [neighborhood, setNeighborhood] = useState('')
  const [city, setCity] = useState('São Paulo')
  const [state, setState] = useState('SP')
  const [zipCode, setZipCode] = useState('')
  
  // Itens do pedido
  const [selectedItems, setSelectedItems] = useState<TestOrderItem[]>([])
  const [availableProducts] = useState<Product[]>([
    { id: 'SF01', name: 'Coxinha', price: 6.50, category: 'Salgados Fritos', stock: 20 },
    { id: 'SF02', name: 'Kibe', price: 6.50, category: 'Salgados Fritos', stock: 20 },
    { id: 'DT01', name: 'Mini Churros de Doce de Leite', price: 4.50, category: 'Doces', stock: 20 },
  ])

  const addItemToOrder = (product: Product) => {
    setSelectedItems(prev => {
      const existingItem = prev.find(item => item.productId === product.id)
      if (existingItem) {
        return prev.map(item =>
          item.productId === product.id
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      } else {
        return [...prev, {
          productId: product.id,
          productName: product.name,
          quantity: 1,
          price: product.price
        }]
      }
    })
  }

  const removeItemFromOrder = (productId: string) => {
    setSelectedItems(prev => prev.filter(item => item.productId !== productId))
  }

  const updateItemQuantity = (productId: string, quantity: number) => {
    if (quantity < 1) {
      removeItemFromOrder(productId)
      return
    }
    
    setSelectedItems(prev =>
      prev.map(item =>
        item.productId === productId
          ? { ...item, quantity }
          : item
      )
    )
  }

  const calculateTotal = () => {
    const subtotal = selectedItems.reduce((sum, item) => sum + (item.price * item.quantity), 0)
    const deliveryFee = orderType === 'DELIVERY' ? 5.00 : 0
    return {
      subtotal,
      deliveryFee,
      total: subtotal + deliveryFee
    }
  }

  const generateOrderNumber = () => {
    return `#${Math.floor(Math.random() * 9000) + 1000}`
  }

  const createTestOrder = async () => {
    if (!customerName || !customerPhone || selectedItems.length === 0) {
      alert('Por favor, preencha todos os campos obrigatórios')
      return
    }

    if (orderType === 'DELIVERY' && (!street || !number || !neighborhood)) {
      alert('Para delivery, preencha o endereço de entrega')
      return
    }

    setIsCreating(true)
    
    try {
      const totals = calculateTotal()
      const orderData = {
        orderNumber: generateOrderNumber(),
        status: 'PENDING' as const,
        type: orderType,
        customerName,
        customerPhone,
        customerEmail: customerEmail || null,
        deliveryAddress: orderType === 'DELIVERY' ? {
          street,
          number,
          neighborhood,
          city,
          state,
          zipCode
        } : null,
        subtotal: totals.subtotal,
        deliveryFee: totals.deliveryFee,
        discount: 0,
        tax: 0,
        total: totals.total,
        paymentMethod,
        paymentStatus: 'PENDING' as const,
        notes: notes || null,
        estimatedTime: orderType === 'DELIVERY' ? 45 : 20,
        preparationTime: 15,
        deliveryTime: orderType === 'DELIVERY' ? 30 : 0,
        source: 'TESTE',
        items: selectedItems.map(item => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          notes: null
        }))
      }

      const response = await fetch('/api/orders', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(orderData),
      })

      if (response.ok) {
        onOrderCreated()
        onClose()
        // Reset form
        setCustomerName('')
        setCustomerPhone('')
        setCustomerEmail('')
        setNotes('')
        setStreet('')
        setNumber('')
        setNeighborhood('')
        setZipCode('')
        setSelectedItems([])
      } else {
        throw new Error('Failed to create order')
      }
    } catch (error) {
      console.error('Error creating test order:', error)
      alert('Erro ao criar pedido de teste')
    } finally {
      setIsCreating(false)
    }
  }

  const totals = calculateTotal()

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>Criar Pedido de Teste</DialogTitle>
          <DialogDescription>
            Preencha os dados para criar um pedido de teste no sistema
          </DialogDescription>
        </DialogHeader>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          {/* Dados do Cliente */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Dados do Cliente</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="customerName">Nome *</Label>
                  <Input
                    id="customerName"
                    value={customerName}
                    onChange={(e) => setCustomerName(e.target.value)}
                    placeholder="Nome do cliente"
                  />
                </div>
                <div className="space-y-2">
                  <Label htmlFor="customerPhone">Telefone *</Label>
                  <Input
                    id="customerPhone"
                    value={customerPhone}
                    onChange={(e) => setCustomerPhone(e.target.value)}
                    placeholder="(11) 99999-9999"
                  />
                </div>
              </div>
              
              <div className="space-y-2">
                <Label htmlFor="customerEmail">Email</Label>
                <Input
                  id="customerEmail"
                  type="email"
                  value={customerEmail}
                  onChange={(e) => setCustomerEmail(e.target.value)}
                  placeholder="cliente@email.com"
                />
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="orderType">Tipo de Pedido *</Label>
                  <Select value={orderType} onValueChange={(value: any) => setOrderType(value)}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="DELIVERY">Delivery</SelectItem>
                      <SelectItem value="TAKEAWAY">Retirada</SelectItem>
                      <SelectItem value="DINE_IN">Local</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
                <div className="space-y-2">
                  <Label htmlFor="paymentMethod">Pagamento</Label>
                  <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="PIX">PIX</SelectItem>
                      <SelectItem value="Dinheiro">Dinheiro</SelectItem>
                      <SelectItem value="Cartão de Crédito">Cartão de Crédito</SelectItem>
                      <SelectItem value="Cartão de Débito">Cartão de Débito</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              </div>

              {orderType === 'DELIVERY' && (
                <>
                  <Separator />
                  <div className="space-y-2">
                    <Label className="text-base font-medium">Endereço de Entrega</Label>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="street">Rua *</Label>
                      <Input
                        id="street"
                        value={street}
                        onChange={(e) => setStreet(e.target.value)}
                        placeholder="Rua das Flores"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="number">Número *</Label>
                      <Input
                        id="number"
                        value={number}
                        onChange={(e) => setNumber(e.target.value)}
                        placeholder="123"
                      />
                    </div>
                  </div>
                  <div className="grid grid-cols-2 gap-4">
                    <div className="space-y-2">
                      <Label htmlFor="neighborhood">Bairro *</Label>
                      <Input
                        id="neighborhood"
                        value={neighborhood}
                        onChange={(e) => setNeighborhood(e.target.value)}
                        placeholder="Centro"
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="zipCode">CEP</Label>
                      <Input
                        id="zipCode"
                        value={zipCode}
                        onChange={(e) => setZipCode(e.target.value)}
                        placeholder="01234-567"
                      />
                    </div>
                  </div>
                </>
              )}

              <div className="space-y-2">
                <Label htmlFor="notes">Observações</Label>
                <Textarea
                  id="notes"
                  value={notes}
                  onChange={(e) => setNotes(e.target.value)}
                  placeholder="Observações do pedido..."
                  rows={3}
                />
              </div>
            </CardContent>
          </Card>

          {/* Produtos e Resumo */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Produtos</CardTitle>
              <CardDescription>Adicione produtos ao pedido</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              {/* Lista de Produtos Disponíveis */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Produtos Disponíveis</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {availableProducts.map((product) => (
                    <div key={product.id} className="flex items-center justify-between p-2 border rounded">
                      <div className="flex-1">
                        <div className="font-medium text-sm">{product.name}</div>
                        <div className="text-xs text-muted-foreground">
                          {product.category} • R$ {product.price.toFixed(2)}
                        </div>
                      </div>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => addItemToOrder(product)}
                        disabled={product.stock === 0}
                      >
                        <Plus className="h-4 w-4" />
                      </Button>
                    </div>
                  ))}
                </div>
              </div>

              <Separator />

              {/* Itens Selecionados */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Itens do Pedido</Label>
                {selectedItems.length === 0 ? (
                  <div className="text-center py-4 text-muted-foreground text-sm">
                    <ShoppingCart className="h-8 w-8 mx-auto mb-2 opacity-50" />
                    Nenhum item adicionado
                  </div>
                ) : (
                  <div className="space-y-2 max-h-40 overflow-y-auto">
                    {selectedItems.map((item) => (
                      <div key={item.productId} className="flex items-center justify-between p-2 border rounded">
                        <div className="flex-1">
                          <div className="font-medium text-sm">{item.productName}</div>
                          <div className="text-xs text-muted-foreground">
                            R$ {item.price.toFixed(2)} cada
                          </div>
                        </div>
                        <div className="flex items-center space-x-2">
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.productId, item.quantity - 1)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                          <span className="text-sm font-medium w-8 text-center">{item.quantity}</span>
                          <Button
                            size="sm"
                            variant="outline"
                            onClick={() => updateItemQuantity(item.productId, item.quantity + 1)}
                          >
                            <Plus className="h-4 w-4" />
                          </Button>
                          <Button
                            size="sm"
                            variant="destructive"
                            onClick={() => removeItemFromOrder(item.productId)}
                          >
                            <Minus className="h-4 w-4" />
                          </Button>
                        </div>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <Separator />

              {/* Resumo do Pedido */}
              <div className="space-y-2">
                <Label className="text-sm font-medium">Resumo do Pedido</Label>
                <div className="space-y-1 text-sm">
                  <div className="flex justify-between">
                    <span>Subtotal:</span>
                    <span>R$ {totals.subtotal.toFixed(2)}</span>
                  </div>
                  {orderType === 'DELIVERY' && (
                    <div className="flex justify-between">
                      <span>Taxa de entrega:</span>
                      <span>R$ {totals.deliveryFee.toFixed(2)}</span>
                    </div>
                  )}
                  <div className="flex justify-between font-medium border-t pt-1">
                    <span>Total:</span>
                    <span className="text-lg">R$ {totals.total.toFixed(2)}</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose}>
            Cancelar
          </Button>
          <Button 
            onClick={createTestOrder} 
            disabled={isCreating || !customerName || !customerPhone || selectedItems.length === 0}
          >
            {isCreating ? 'Criando...' : 'Criar Pedido de Teste'}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}