"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Switch } from '@/components/ui/switch'
import { SelectableCardWrapper } from '@/components/ui/selectable-card-wrapper'
import { 
  Edit, 
  Trash2, 
  Star,
  Clock,
  DollarSign,
  Package,
  Eye,
  EyeOff,
  Plus,
  Minus
} from 'lucide-react'

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

interface ComboCardProps {
  combo: Combo
  onEdit?: (combo: Combo) => void
  onDelete?: (id: string) => void
  onToggleStatus?: (id: string, isActive: boolean) => void
  onToggleFeatured?: (id: string, isFeatured: boolean) => void
  showAdminControls?: boolean
  isSelected?: boolean
  onSelectionChange?: (isSelected: boolean) => void
  showSelection?: boolean
  onAddToCart?: (combo: Combo) => void
}

export default function ComboCard({ 
  combo, 
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleFeatured,
  showAdminControls = false,
  isSelected = false,
  onSelectionChange,
  showSelection = false,
  onAddToCart
}: ComboCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async (checked: boolean) => {
    if (!onToggleStatus) return
    setIsLoading(true)
    try {
      await onToggleStatus(combo.id, checked)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFeatured = async (checked: boolean) => {
    if (!onToggleFeatured) return
    setIsLoading(true)
    try {
      await onToggleFeatured(combo.id, checked)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectionToggle = () => {
    if (onSelectionChange) {
      onSelectionChange(!isSelected)
    }
  }

  const savings = combo.originalPrice ? combo.originalPrice - combo.price : 0

  const cardContent = (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <CardTitle className="text-lg">{combo.name}</CardTitle>
                {combo.isFeatured && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              {combo.description && (
                <CardDescription className="text-sm">{combo.description}</CardDescription>
              )}
            </div>
          </div>
          {combo.image && (
            <img 
              src={combo.image} 
              alt={combo.name} 
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price and Savings */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            <span className="flex items-center font-semibold text-green-600">
              <DollarSign className="h-3 w-3 mr-1" />
              R$ {combo.price.toFixed(2)}
            </span>
            {combo.originalPrice && (
              <span className="text-sm text-muted-foreground line-through">
                R$ {combo.originalPrice.toFixed(2)}
              </span>
            )}
            {savings > 0 && (
              <Badge variant="outline" className="border-green-500 text-green-700">
                Economize R$ {savings.toFixed(2)}
              </Badge>
            )}
          </div>
          {combo.preparationTime && (
            <span className="flex items-center text-sm text-muted-foreground">
              <Clock className="h-3 w-3 mr-1" />
              {combo.preparationTime}min
            </span>
          )}
        </div>

        {/* Combo Items */}
        <div className="space-y-2">
          <h4 className="text-sm font-medium">Itens do Combo:</h4>
          <div className="space-y-1">
            {combo.comboItems.map((item) => (
              <div 
                key={item.id} 
                className="flex items-center justify-between text-sm p-2 bg-muted rounded"
              >
                <div className="flex items-center space-x-2">
                  <span className="flex items-center">
                    {item.quantity > 1 && (
                      <span className="text-xs bg-primary text-primary-foreground rounded px-1 mr-1">
                        {item.quantity}x
                      </span>
                    )}
                    {item.productName}
                  </span>
                  {!item.isItemAvailable && (
                    <Badge variant="destructive" className="text-xs">
                      Indisponível
                    </Badge>
                  )}
                  {item.productStock <= 2 && item.isItemAvailable && (
                    <Badge variant="outline" className="border-orange-500 text-orange-700 text-xs">
                      Estoque Baixo: {item.productStock}
                    </Badge>
                  )}
                  {item.productStock === 0 && (
                    <Badge variant="destructive" className="text-xs">
                      Esgotado
                    </Badge>
                  )}
                </div>
                <span className="text-xs text-muted-foreground">
                  Estoque: {item.productStock}
                </span>
              </div>
            ))}
          </div>
        </div>

        {/* Admin Controls */}
        {showAdminControls ? (
          <>
            {/* Status Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {combo.isActive ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">Ativo</span>
                </div>
                <Switch
                  checked={combo.isActive}
                  onCheckedChange={handleToggleStatus}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Destaque</span>
                </div>
                <Switch
                  checked={combo.isFeatured}
                  onCheckedChange={handleToggleFeatured}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={combo.isActive ? "default" : "secondary"}>
                {combo.isActive ? "Ativo" : "Inativo"}
              </Badge>
              <Badge variant={combo.isAvailable ? "default" : "destructive"}>
                {combo.isAvailable ? "Disponível" : "Indisponível"}
              </Badge>
              {combo.isFeatured && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  Destaque
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex space-x-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit?.(combo)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete?.(combo.id)}
                disabled={isLoading}
                className="text-red-600 hover:text-red-700 hover:bg-red-50"
              >
                <Trash2 className="h-4 w-4 mr-1" />
                Excluir
              </Button>
            </div>
          </>
        ) : (
          <>
            {/* Public View */}
            <div className="flex flex-wrap gap-2 mb-4">
              <Badge variant={combo.isAvailable ? "default" : "destructive"}>
                {combo.isAvailable ? "Disponível" : "Indisponível"}
              </Badge>
              {combo.isFeatured && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  <Star className="h-3 w-3 mr-1" />
                  Destaque
                </Badge>
              )}
              {savings > 0 && (
                <Badge variant="outline" className="border-green-500 text-green-700">
                  Economize R$ {savings.toFixed(2)}
                </Badge>
              )}
            </div>
            
            {/* Add to Cart Button */}
            {onAddToCart && combo.isAvailable && (
              <Button 
                onClick={() => onAddToCart(combo)}
                className="w-full"
                size="lg"
              >
                <Plus className="mr-2 h-4 w-4" />
                Selecionar Itens
              </Button>
            )}
          </>
        )}
      </CardContent>
    </Card>
  )

  if (showSelection) {
    return (
      <SelectableCardWrapper
        isSelected={isSelected}
        onToggle={handleSelectionToggle}
        showSelection={showSelection}
      >
        {cardContent}
      </SelectableCardWrapper>
    )
  }

  return cardContent
}