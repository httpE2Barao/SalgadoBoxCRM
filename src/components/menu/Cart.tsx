"use client"

import { useState } from 'react'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { 
  ShoppingCart, 
  Plus, 
  Minus, 
  Trash2, 
  ChevronDown,
  ChevronUp,
  CreditCard,
  Clock
} from 'lucide-react'
import { toast } from 'sonner'

interface CartItem {
  id: string
  name: string
  price: number
  quantity: number
  image?: string
  preparationTime?: number
  type: 'product' | 'combo'
  selectedItems?: any[]
}

interface CartProps {
  items: CartItem[]
  onUpdateQuantity: (id: string, quantity: number, type: 'product' | 'combo') => void
  onRemoveItem: (id: string, type: 'product' | 'combo') => void
  onCheckout: () => void
  isOpen: boolean
  onToggle: () => void
}

export default function Cart({ 
  items, 
  onUpdateQuantity, 
  onRemoveItem, 
  onCheckout, 
  isOpen, 
  onToggle 
}: CartProps) {
  const totalItems = items.reduce((sum, item) => sum + item.quantity, 0)
  const totalPrice = items.reduce((sum, item) => sum + (item.price * item.quantity), 0)
  const estimatedPreparationTime = Math.max(...items.map(item => item.preparationTime || 15), 15)

  const handleQuantityChange = (id: string, newQuantity: number, type: 'product' | 'combo') => {
    if (newQuantity < 1) {
      onRemoveItem(id, type)
      toast.success('Item removido do carrinho')
    } else {
      onUpdateQuantity(id, newQuantity, type)
    }
  }

  return (
    <div className="fixed top-4 right-4 z-50">
      {/* Cart Toggle Button */}
      <Button
        onClick={onToggle}
        className="bg-amber-600 hover:bg-amber-700 text-white rounded-full p-3 shadow-lg"
        size="lg"
      >
        <ShoppingCart className="h-6 w-6" />
        {totalItems > 0 && (
          <Badge 
            variant="destructive" 
            className="absolute -top-2 -right-2 bg-red-500 text-white rounded-full w-6 h-6 flex items-center justify-center text-xs p-0"
          >
            {totalItems}
          </Badge>
        )}
      </Button>

      {/* Cart Dropdown */}
      {isOpen && (
        <Card className="absolute right-0 top-16 w-96 max-h-96 overflow-hidden shadow-2xl border border-gray-200">
          <CardHeader className="bg-amber-600 text-white p-4">
            <div className="flex items-center justify-between">
              <CardTitle className="text-lg flex items-center gap-2">
                <ShoppingCart className="h-5 w-5" />
                Seu Carrinho
              </CardTitle>
              <Button
                variant="ghost"
                size="sm"
                onClick={onToggle}
                className="text-white hover:bg-amber-700"
              >
                <ChevronDown className="h-4 w-4" />
              </Button>
            </div>
          </CardHeader>

          <CardContent className="p-0">
            {items.length === 0 ? (
              <div className="p-6 text-center text-gray-500">
                <ShoppingCart className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                <p>Seu carrinho está vazio</p>
              </div>
            ) : (
              <>
                {/* Cart Items */}
                <div className="max-h-48 overflow-y-auto">
                  {items.map((item) => (
                    <div key={`${item.type}-${item.id}`} className="p-4 border-b border-gray-100">
                      <div className="flex items-start gap-3">
                        {item.image && (
                          <img 
                            src={item.image} 
                            alt={item.name} 
                            className="w-12 h-12 object-cover rounded-lg"
                          />
                        )}
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <h4 className="font-medium text-sm">{item.name}</h4>
                            {item.type === 'combo' && (
                              <Badge variant="outline" className="text-xs">
                                Combo
                              </Badge>
                            )}
                          </div>
                          <p className="text-amber-600 font-semibold">
                            R$ {item.price.toFixed(2)}
                          </p>
                          {item.type === 'combo' && item.selectedItems && (
                            <div className="mt-1 text-xs text-gray-500">
                              {item.selectedItems.map((selectedItem: any) => (
                                <div key={selectedItem.comboItemId}>
                                  {selectedItem.selectedQuantity}x {selectedItem.productName}
                                </div>
                              ))}
                            </div>
                          )}
                        </div>
                        <div className="flex items-center gap-2">
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity - 1, item.type)}
                            className="h-8 w-8 p-0"
                          >
                            <Minus className="h-3 w-3" />
                          </Button>
                          <span className="w-8 text-center text-sm font-medium">
                            {item.quantity}
                          </span>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() => handleQuantityChange(item.id, item.quantity + 1, item.type)}
                            className="h-8 w-8 p-0"
                          >
                            <Plus className="h-3 w-3" />
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() => onRemoveItem(item.id, item.type)}
                            className="h-8 w-8 p-0 text-red-500 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    </div>
                  ))}
                </div>

                {/* Cart Summary */}
                <div className="p-4 bg-gray-50 border-t border-gray-200">
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Total de itens:</span>
                      <span className="font-medium">{totalItems}</span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-sm text-gray-600">Tempo estimado:</span>
                      <span className="font-medium flex items-center gap-1">
                        <Clock className="h-4 w-4" />
                        {estimatedPreparationTime} min
                      </span>
                    </div>
                    <div className="flex justify-between items-center text-lg font-bold">
                      <span>Total:</span>
                      <span className="text-amber-600">R$ {totalPrice.toFixed(2)}</span>
                    </div>
                    
                    <Button
                      onClick={onCheckout}
                      className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                      size="lg"
                    >
                      <CreditCard className="h-4 w-4 mr-2" />
                      Finalizar Pedido
                    </Button>
                  </div>
                </div>
              </>
            )}
          </CardContent>
        </Card>
      )}
    </div>
  )
}