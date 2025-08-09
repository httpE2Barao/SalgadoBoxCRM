"use client"

import { useState } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Switch } from '@/components/ui/switch'
import { Label } from '@/components/ui/label'
import { Separator } from '@/components/ui/separator'
import { Badge } from '@/components/ui/badge'
import { X, Save } from 'lucide-react'

interface BulkEditModalProps {
  isOpen: boolean
  onClose: () => void
  selectedCount: number
  categories: { id: string; name: string }[]
  onUpdate: (data: any) => void
}

interface BulkUpdateData {
  categoryId?: string
  price?: number
  costPrice?: number
  stock?: number
  minimumStock?: number
  isActive?: boolean
  isAvailable?: boolean
  isFeatured?: boolean
}

export default function BulkEditModal({ 
  isOpen, 
  onClose, 
  selectedCount, 
  categories, 
  onUpdate 
}: BulkEditModalProps) {
  const [updateData, setUpdateData] = useState<BulkUpdateData>({})
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleUpdate = async () => {
    // Only include fields that have been set
    const dataToUpdate = Object.fromEntries(
      Object.entries(updateData).filter(([_, value]) => value !== undefined && value !== '')
    )
    
    if (Object.keys(dataToUpdate).length === 0) {
      return
    }

    setIsSubmitting(true)
    try {
      await onUpdate(dataToUpdate)
    } finally {
      setIsSubmitting(false)
    }
  }

  const updateField = (field: keyof BulkUpdateData, value: any) => {
    setUpdateData(prev => ({
      ...prev,
      [field]: value
    }))
  }

  const clearField = (field: keyof BulkUpdateData) => {
    setUpdateData(prev => {
      const newData = { ...prev }
      delete newData[field]
      return newData
    })
  }

  const isFieldSet = (field: keyof BulkUpdateData) => {
    return updateData[field] !== undefined && updateData[field] !== ''
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-2xl max-h-[90vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle className="flex items-center justify-between">
            <span>Edição em Massa</span>
            <Badge variant="secondary">{selectedCount} produtos selecionados</Badge>
          </DialogTitle>
          <DialogDescription>
            Altere apenas os campos que deseja atualizar para todos os produtos selecionados. 
            Campos em branco não serão modificados.
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Category */}
          <div className="space-y-2">
            <div className="flex items-center justify-between">
              <Label htmlFor="category">Categoria</Label>
              {isFieldSet('categoryId') && (
                <Button
                  variant="ghost"
                  size="sm"
                  onClick={() => clearField('categoryId')}
                  className="h-6 px-2 text-xs"
                >
                  <X className="h-3 w-3" />
                </Button>
              )}
            </div>
            <Select
              value={updateData.categoryId || 'keep-current'}
              onValueChange={(value) => updateField('categoryId', value === 'keep-current' ? undefined : value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="keep-current">Manter categoria atual</SelectItem>
                {categories.map((category) => (
                  <SelectItem key={category.id} value={category.id}>
                    {category.name}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <Separator />

          {/* Prices */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Preços</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="price">Preço de Venda (R$)</Label>
                {isFieldSet('price') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearField('price')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Input
                id="price"
                type="number"
                step="0.01"
                min="0"
                placeholder="Deixe em branco para não alterar"
                value={updateData.price || ''}
                onChange={(e) => updateField('price', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="costPrice">Preço de Custo (R$)</Label>
                {isFieldSet('costPrice') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearField('costPrice')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Input
                id="costPrice"
                type="number"
                step="0.01"
                min="0"
                placeholder="Deixe em branco para não alterar"
                value={updateData.costPrice || ''}
                onChange={(e) => updateField('costPrice', e.target.value ? parseFloat(e.target.value) : undefined)}
              />
            </div>
          </div>

          <Separator />

          {/* Stock */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Estoque</h3>
            
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="stock">Quantidade em Estoque</Label>
                {isFieldSet('stock') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearField('stock')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Input
                id="stock"
                type="number"
                min="0"
                placeholder="Deixe em branco para não alterar"
                value={updateData.stock || ''}
                onChange={(e) => updateField('stock', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>

            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label htmlFor="minimumStock">Estoque Mínimo</Label>
                {isFieldSet('minimumStock') && (
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => clearField('minimumStock')}
                    className="h-6 px-2 text-xs"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                )}
              </div>
              <Input
                id="minimumStock"
                type="number"
                min="0"
                placeholder="Deixe em branco para não alterar"
                value={updateData.minimumStock || ''}
                onChange={(e) => updateField('minimumStock', e.target.value ? parseInt(e.target.value) : undefined)}
              />
            </div>
          </div>

          <Separator />

          {/* Status Toggles */}
          <div className="space-y-4">
            <h3 className="text-sm font-medium">Status</h3>
            
            <div className="space-y-3">
              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Ativo</Label>
                  <p className="text-xs text-muted-foreground">
                    {isFieldSet('isActive') 
                      ? updateData.isActive ? 'Será marcado como ativo' : 'Será marcado como inativo'
                      : 'Mantém status atual'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {isFieldSet('isActive') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearField('isActive')}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <Switch
                    checked={updateData.isActive ?? false}
                    onCheckedChange={(checked) => updateField('isActive', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Disponível</Label>
                  <p className="text-xs text-muted-foreground">
                    {isFieldSet('isAvailable') 
                      ? updateData.isAvailable ? 'Será marcado como disponível' : 'Será marcado como indisponível'
                      : 'Mantém status atual'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {isFieldSet('isAvailable') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearField('isAvailable')}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <Switch
                    checked={updateData.isAvailable ?? false}
                    onCheckedChange={(checked) => updateField('isAvailable', checked)}
                  />
                </div>
              </div>

              <div className="flex items-center justify-between">
                <div className="space-y-0.5">
                  <Label>Destaque</Label>
                  <p className="text-xs text-muted-foreground">
                    {isFieldSet('isFeatured') 
                      ? updateData.isFeatured ? 'Será marcado como destaque' : 'Será removido dos destaques'
                      : 'Mantém status atual'
                    }
                  </p>
                </div>
                <div className="flex items-center space-x-2">
                  {isFieldSet('isFeatured') && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => clearField('isFeatured')}
                      className="h-6 px-2 text-xs"
                    >
                      <X className="h-3 w-3" />
                    </Button>
                  )}
                  <Switch
                    checked={updateData.isFeatured ?? false}
                    onCheckedChange={(checked) => updateField('isFeatured', checked)}
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Actions */}
          <div className="flex justify-between pt-4">
            <Button variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button 
              onClick={handleUpdate}
              disabled={isSubmitting || Object.keys(updateData).length === 0}
              className="bg-blue-600 hover:bg-blue-700"
            >
              <Save className="h-4 w-4 mr-2" />
              {isSubmitting ? 'Atualizando...' : `Atualizar ${selectedCount} produtos`}
            </Button>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  )
}