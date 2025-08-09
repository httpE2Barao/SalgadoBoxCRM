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
  ChefHat,
  Package,
  Eye,
  EyeOff,
  Square,
  CheckSquare
} from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  costPrice?: number
  image?: string
  isActive: boolean
  isAvailable: boolean
  isFeatured: boolean
  calories?: number
  displayOrder: number
  categoryId?: string
  categoryName?: string
  options: ProductOption[]
  stock?: number
  minimumStock?: number
}

interface ProductOption {
  id: string
  name: string
  description?: string
  price: number
  isActive: boolean
  displayOrder: number
}

interface ProductCardProps {
  product: Product
  showAdminControls?: boolean
  isSelected?: boolean
  onSelectionToggle?: (isSelected: boolean) => void
  onEdit?: (product: Product) => void
  onDelete?: (id: string) => void
  onToggleStatus?: (id: string, isActive: boolean) => void
  onToggleAvailability?: (id: string, isAvailable: boolean) => void
  onToggleFeatured?: (id: string, isFeatured: boolean) => void
  onToggleActive?: (id: string, isActive: boolean) => void
  onToggleStatusByStock?: (id: string) => void
  onAddToCart?: (product: Product) => void
  showSelection?: boolean
}

function ProductCard({ 
  product, 
  showAdminControls = false,
  isSelected = false,
  onSelectionToggle,
  onEdit,
  onDelete,
  onToggleStatus,
  onToggleAvailability,
  onToggleFeatured,
  onToggleActive,
  onToggleStatusByStock,
  onAddToCart,
  showSelection = false
}: ProductCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async (checked: boolean) => {
    if (!onToggleStatus) return
    setIsLoading(true)
    try {
      await onToggleStatus(product.id, checked)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleAvailability = async (checked: boolean) => {
    if (!onToggleAvailability) return
    setIsLoading(true)
    try {
      await onToggleAvailability(product.id, checked)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleFeatured = async (checked: boolean) => {
    if (!onToggleFeatured) return
    setIsLoading(true)
    try {
      await onToggleFeatured(product.id, checked)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleActive = async (checked: boolean) => {
    if (!onToggleActive) return
    setIsLoading(true)
    try {
      await onToggleActive(product.id, checked)
    } finally {
      setIsLoading(false)
    }
  }

  const handleToggleStatusByStock = async () => {
    if (!onToggleStatusByStock) return
    setIsLoading(true)
    try {
      await onToggleStatusByStock(product.id)
    } finally {
      setIsLoading(false)
    }
  }

  const handleAddToCart = () => {
    if (onAddToCart) {
      onAddToCart(product)
    }
  }

  const handleSelectionToggle = () => {
    if (onSelectionToggle) {
      onSelectionToggle(!isSelected)
    }
  }

  const cardContent = (
    <Card className="w-full hover:shadow-lg transition-shadow">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <CardTitle className="text-lg">{product.name}</CardTitle>
                {product.isFeatured && (
                  <Star className="h-4 w-4 text-yellow-500 fill-current" />
                )}
              </div>
              {product.description && (
                <CardDescription className="text-sm">{product.description}</CardDescription>
              )}
            </div>
          </div>
          {product.image && (
            <img 
              src={product.image} 
              alt={product.name} 
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Price and Info */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4 text-sm text-muted-foreground">
            <span className="flex items-center font-semibold text-green-600">
              <DollarSign className="h-3 w-3 mr-1" />
              R$ {product.price.toFixed(2)}
            </span>
            {showAdminControls && product.costPrice && (
              <span className="flex items-center text-red-600">
                <DollarSign className="h-3 w-3 mr-1" />
                Custo: R$ {product.costPrice.toFixed(2)}
              </span>
            )}
            {product.categoryName && (
              <span className="flex items-center">
                <Package className="h-3 w-3 mr-1" />
                {product.categoryName}
              </span>
            )}
          </div>
        </div>

        {/* Admin Controls */}
        {showAdminControls ? (
          <>
            {/* Stock Information */}
            <div className="flex items-center justify-between text-sm text-muted-foreground mb-3">
              <span className="flex items-center">
                <Package className="h-4 w-4 mr-1" />
                Estoque: {product.stock || 0} unidades
              </span>
              {product.minimumStock && product.minimumStock > 0 && (
                <span className="text-xs">
                  Mínimo: {product.minimumStock}
                </span>
              )}
            </div>

            {/* Status Toggles */}
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  {product.isActive ? (
                    <Eye className="h-4 w-4 text-green-600" />
                  ) : (
                    <EyeOff className="h-4 w-4 text-gray-400" />
                  )}
                  <span className="text-sm">Ativo</span>
                </div>
                <Switch
                  checked={product.isActive}
                  onCheckedChange={handleToggleStatus}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <ChefHat className="h-4 w-4 text-blue-600" />
                  <span className="text-sm">Disponível</span>
                </div>
                <Switch
                  checked={product.isAvailable}
                  onCheckedChange={handleToggleAvailability}
                  disabled={isLoading}
                />
              </div>

              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-2">
                  <Star className="h-4 w-4 text-yellow-500" />
                  <span className="text-sm">Destaque</span>
                </div>
                <Switch
                  checked={product.isFeatured}
                  onCheckedChange={handleToggleFeatured}
                  disabled={isLoading}
                />
              </div>
            </div>

            {/* Status Badges */}
            <div className="flex flex-wrap gap-2">
              <Badge variant={product.isActive ? "default" : "secondary"}>
                {product.isActive ? "Ativo" : "Inativo"}
              </Badge>
              <Badge variant={product.isAvailable ? "default" : "destructive"}>
                {product.isAvailable ? "Disponível" : "Indisponível"}
              </Badge>
              {(product.stock || 0) === 0 ? (
                <Badge variant="destructive">
                  Esgotado
                </Badge>
              ) : (product.stock || 0) <= (product.minimumStock || 0) && product.minimumStock && product.minimumStock > 0 ? (
                <Badge variant="outline" className="border-orange-500 text-orange-700">
                  Estoque Baixo
                </Badge>
              ) : null}
              {product.isFeatured && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  Destaque
                </Badge>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex flex-wrap gap-2">
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onEdit?.(product)}
                disabled={isLoading}
              >
                <Edit className="h-4 w-4 mr-1" />
                Editar
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={handleToggleStatusByStock}
                disabled={isLoading}
                className="text-blue-600 hover:text-blue-700 hover:bg-blue-50"
              >
                <Package className="h-4 w-4 mr-1" />
                Auto Status
              </Button>
              <Button 
                variant="outline" 
                size="sm" 
                onClick={() => onDelete?.(product.id)}
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
            {/* Public View - Simple Status */}
            <div className="flex flex-wrap gap-2 mb-4">
              {!product.isAvailable || (product.stock || 0) === 0 ? (
                <Badge variant="destructive">
                  Esgotado
                </Badge>
              ) : (
                <Badge variant="default">
                  Disponível
                </Badge>
              )}
              {product.isFeatured && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  <Star className="h-3 w-3 mr-1" />
                  Destaque
                </Badge>
              )}
            </div>

            {/* Add to Cart Button */}
            {onAddToCart && (
              <Button 
                onClick={handleAddToCart}
                className="w-full bg-amber-600 hover:bg-amber-700 text-white"
                disabled={!product.isAvailable || (product.stock || 0) === 0}
              >
                {!product.isAvailable || (product.stock || 0) === 0 ? (
                  'Indisponível'
                ) : (
                  'Adicionar ao Carrinho'
                )}
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

export default ProductCard