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
  Package,
  Eye,
  EyeOff,
  Hash
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
  image?: string
  productCount: number
}

interface CategoryCardProps {
  category: Category
  onEdit: (category: Category) => void
  onDelete: (id: string) => void
  onToggleStatus: (id: string, isActive: boolean) => void
  isSelected?: boolean
  onSelectionChange?: (isSelected: boolean) => void
  showSelection?: boolean
}

export default function CategoryCard({ 
  category, 
  onEdit, 
  onDelete, 
  onToggleStatus,
  isSelected = false,
  onSelectionChange,
  showSelection = false
}: CategoryCardProps) {
  const [isLoading, setIsLoading] = useState(false)

  const handleToggleStatus = async (checked: boolean) => {
    setIsLoading(true)
    try {
      await onToggleStatus(category.id, checked)
    } finally {
      setIsLoading(false)
    }
  }

  const handleSelectionToggle = () => {
    if (onSelectionChange) {
      onSelectionChange(!isSelected)
    }
  }

  const cardContent = (
    <Card className="w-full transition-all">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-start space-x-3 flex-1">
            <div className="flex-1">
              <div className="flex items-center space-x-2 mb-2">
                <CardTitle className="text-lg">{category.name}</CardTitle>
                <Badge variant="outline" className="text-xs">
                  <Hash className="h-3 w-3 mr-1" />
                  {category.displayOrder}
                </Badge>
              </div>
              {category.description && (
                <CardDescription className="text-sm">{category.description}</CardDescription>
              )}
            </div>
          </div>
          {category.image && (
            <img 
              src={category.image} 
              alt={category.name} 
              className="w-16 h-16 object-cover rounded-lg"
            />
          )}
        </div>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Product Count */}
        <div className="flex items-center space-x-2 text-sm text-muted-foreground">
          <Package className="h-4 w-4" />
          <span>{category.productCount} produtos</span>
        </div>

        {/* Status Toggle */}
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-2">
            {category.isActive ? (
              <Eye className="h-4 w-4 text-green-600" />
            ) : (
              <EyeOff className="h-4 w-4 text-gray-400" />
            )}
            <span className="text-sm">Ativo</span>
          </div>
          <Switch
            checked={category.isActive}
            onCheckedChange={handleToggleStatus}
            disabled={isLoading}
          />
        </div>

        {/* Status Badge */}
        <div className="flex flex-wrap gap-2">
          <Badge variant={category.isActive ? "default" : "secondary"}>
            {category.isActive ? "Ativo" : "Inativo"}
          </Badge>
          <Badge variant="outline">
            {category.productCount} produtos
          </Badge>
        </div>

        {/* Action Buttons */}
        <div className="flex space-x-2">
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onEdit(category)}
            disabled={isLoading}
          >
            <Edit className="h-4 w-4 mr-1" />
            Editar
          </Button>
          <Button 
            variant="outline" 
            size="sm" 
            onClick={() => onDelete(category.id)}
            disabled={isLoading}
            className="text-red-600 hover:text-red-700 hover:bg-red-50"
          >
            <Trash2 className="h-4 w-4 mr-1" />
            Excluir
          </Button>
        </div>
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