"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { 
  Plus, 
  Minus,
  Package,
  AlertCircle,
  CheckCircle
} from 'lucide-react'
import { toast } from 'sonner'

interface ComboItem {
  id: string
  productId: string
  productName: string
  quantity: number
  isOptional: boolean
  displayOrder: number
  productStock: number
  isItemAvailable: boolean
}

interface Combo {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  isActive: boolean
  isFeatured: boolean
  preparationTime?: number
  displayOrder: number
  isAvailable: boolean
  comboItems: ComboItem[]
}

interface SelectedComboItem {
  comboItemId: string
  productId: string
  productName: string
  selectedQuantity: number
  minQuantity: number
  maxQuantity: number
  isOptional: boolean
  productStock: number
  isItemAvailable: boolean
}

interface ComboSelectorProps {
  combo: Combo
  onAddToCart: (selectedItems: SelectedComboItem[]) => void
  onCancel: () => void
}

export default function ComboSelector({ combo, onAddToCart, onCancel }: ComboSelectorProps) {
  const [selectedItems, setSelectedItems] = useState<SelectedComboItem[]>(
    combo.comboItems.map(item => ({
      comboItemId: item.id,
      productId: item.productId,
      productName: item.productName,
      selectedQuantity: item.isOptional ? 0 : item.quantity,
      minQuantity: item.isOptional ? 0 : item.quantity,
      maxQuantity: Math.min(item.productStock, item.quantity * 3), // Limitar a 3x a quantidade original
      isOptional: item.isOptional,
      productStock: item.productStock,
      isItemAvailable: item.isItemAvailable
    }))
  )

  const updateItemQuantity = (comboItemId: string, newQuantity: number) => {
    setSelectedItems(prev => 
      prev.map(item => 
        item.comboItemId === comboItemId 
          ? { ...item, selectedQuantity: Math.max(0, Math.min(newQuantity, item.maxQuantity)) }
          : item
      )
    )
  }

  const getTotalSelectedItems = () => {
    return selectedItems.reduce((total, item) => total + item.selectedQuantity, 0)
  }

  const getMinRequiredItems = () => {
    return selectedItems
      .filter(item => !item.isOptional)
      .reduce((total, item) => total + item.minQuantity, 0)
  }

  const canAddToCart = () => {
    const totalSelected = getTotalSelectedItems()
    const minRequired = getMinRequiredItems()
    return totalSelected >= minRequired && totalSelected > 0
  }

  const getComboPrice = () => {
    return combo.price
  }

  const handleAddToCart = () => {
    if (!canAddToCart()) {
      const minRequired = getMinRequiredItems()
      toast.error(`Selecione pelo menos ${minRequired} itens para continuar`)
      return
    }

    const validItems = selectedItems.filter(item => item.selectedQuantity > 0)
    if (validItems.length === 0) {
      toast.error('Selecione pelo menos um item')
      return
    }

    onAddToCart(validItems)
  }

  const totalSelected = getTotalSelectedItems()
  const minRequired = getMinRequiredItems()
  const isValid = canAddToCart()

  return (
    <div className="space-y-6">
      {/* Combo Header */}
      <Card>
        <CardHeader>
          <div className="flex items-start justify-between">
            <div className="flex-1">
              <CardTitle className="text-xl">{combo.name}</CardTitle>
              {combo.description && (
                <CardDescription className="mt-2">{combo.description}</CardDescription>
              )}
              <div className="flex items-center gap-4 mt-4">
                <span className="text-2xl font-bold text-green-600">
                  R$ {getComboPrice().toFixed(2)}
                </span>
                {combo.originalPrice && (
                  <span className="text-lg text-muted-foreground line-through">
                    R$ {combo.originalPrice.toFixed(2)}
                  </span>
                )}
              </div>
            </div>
            {combo.image && (
              <img 
                src={combo.image} 
                alt={combo.name} 
                className="w-20 h-20 object-cover rounded-lg"
              />
            )}
          </div>
        </CardHeader>
      </Card>

      {/* Item Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Selecione os itens do combo
          </CardTitle>
          <CardDescription>
            {minRequired > 0 ? (
              <span className="flex items-center gap-2">
                <AlertCircle className="h-4 w-4 text-orange-500" />
                Mínimo de {minRequired} itens obrigatórios
              </span>
            ) : (
              <span>Selecione os itens que deseja incluir no combo</span>
            )}
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedItems.map((item) => (
            <div key={item.comboItemId} className="flex items-center justify-between p-4 border rounded-lg">
              <div className="flex-1">
                <div className="flex items-center gap-2">
                  <span className="font-medium">{item.productName}</span>
                  {!item.isOptional && (
                    <Badge variant="outline" className="border-orange-500 text-orange-700">
                      Obrigatório
                    </Badge>
                  )}
                  {!item.isItemAvailable && (
                    <Badge variant="destructive" className="text-xs">
                      Indisponível
                    </Badge>
                  )}
                </div>
                <div className="text-sm text-muted-foreground mt-1">
                  Estoque disponível: {item.productStock}
                </div>
              </div>
              
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateItemQuantity(item.comboItemId, item.selectedQuantity - 1)}
                    disabled={item.selectedQuantity <= 0 || !item.isItemAvailable}
                  >
                    <Minus className="h-4 w-4" />
                  </Button>
                  
                  <span className="w-8 text-center font-medium">
                    {item.selectedQuantity}
                  </span>
                  
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => updateItemQuantity(item.comboItemId, item.selectedQuantity + 1)}
                    disabled={item.selectedQuantity >= item.maxQuantity || !item.isItemAvailable}
                  >
                    <Plus className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>
          ))}

          {/* Selection Summary */}
          <div className="mt-6 p-4 bg-muted rounded-lg">
            <div className="flex items-center justify-between">
              <span className="font-medium">
                Total de itens selecionados:
              </span>
              <span className="text-lg font-bold">
                {totalSelected}
              </span>
            </div>
            
            {minRequired > 0 && (
              <div className="flex items-center gap-2 mt-2">
                {isValid ? (
                  <>
                    <CheckCircle className="h-4 w-4 text-green-500" />
                    <span className="text-sm text-green-600">
                      Mínimo de {minRequired} itens atingido
                    </span>
                  </>
                ) : (
                  <>
                    <AlertCircle className="h-4 w-4 text-orange-500" />
                    <span className="text-sm text-orange-600">
                      Faltam {Math.max(0, minRequired - totalSelected)} itens para atingir o mínimo
                    </span>
                  </>
                )}
              </div>
            )}
          </div>
        </CardContent>
      </Card>

      {/* Action Buttons */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onCancel}
          className="flex-1"
        >
          Cancelar
        </Button>
        
        <Button
          onClick={handleAddToCart}
          disabled={!isValid}
          className="flex-1"
        >
          Adicionar ao Carrinho - R$ {getComboPrice().toFixed(2)}
        </Button>
      </div>
    </div>
  )
}