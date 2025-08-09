"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Badge } from '@/components/ui/badge'
import { 
  Plus, 
  X,
  Image as ImageIcon,
  DollarSign,
  Clock,
  Star,
  Trash2,
  Package,
  Minus
} from 'lucide-react'

interface Product {
  id: string
  name: string
  price: number
  stock: number
  isActive: boolean
  isAvailable: boolean
}

interface ComboItem {
  id: string
  productId: string
  productName: string
  quantity: number
  isOptional: boolean
  displayOrder: number
}

interface Combo {
  id: string
  name: string
  description?: string
  price: number
  originalPrice?: number
  image?: string
  isActive: boolean
  isAvailable: boolean
  isFeatured: boolean
  preparationTime?: number
  displayOrder: number
  comboItems: ComboItem[]
}

interface ComboFormProps {
  combo?: Combo
  products: Product[]
  isOpen: boolean
  onClose: () => void
  onSave: (combo: Partial<Combo>) => void
}

export default function ComboForm({ combo, products, isOpen, onClose, onSave }: ComboFormProps) {
  const [formData, setFormData] = useState<Partial<Combo>>({
    name: combo?.name || '',
    description: combo?.description || '',
    price: combo?.price || 0,
    originalPrice: combo?.originalPrice || 0,
    image: combo?.image || '',
    isActive: combo?.isActive ?? true,
    isAvailable: combo?.isAvailable ?? true,
    isFeatured: combo?.isFeatured ?? false,
    preparationTime: combo?.preparationTime,
    displayOrder: combo?.displayOrder || 0,
    comboItems: combo?.comboItems || []
  })

  const [newItem, setNewItem] = useState({
    productId: '',
    quantity: 1,
    isOptional: false
  })

  const calculateOriginalPrice = () => {
    return formData.comboItems?.reduce((total, item) => {
      const product = products.find(p => p.id === item.productId)
      return total + (product?.price || 0) * item.quantity
    }, 0) || 0
  }

  const addItem = () => {
    if (!newItem.productId) return

    const product = products.find(p => p.id === newItem.productId)
    if (!product) return

    const comboItem: ComboItem = {
      id: Date.now().toString(),
      productId: newItem.productId,
      productName: product.name,
      quantity: newItem.quantity,
      isOptional: newItem.isOptional,
      displayOrder: (formData.comboItems?.length || 0) + 1
    }

    setFormData(prev => ({
      ...prev,
      comboItems: [...(prev.comboItems || []), comboItem]
    }))

    setNewItem({ productId: '', quantity: 1, isOptional: false })
  }

  const removeItem = (itemId: string) => {
    setFormData(prev => ({
      ...prev,
      comboItems: prev.comboItems?.filter(item => item.id !== itemId) || []
    }))
  }

  const updateItemQuantity = (itemId: string, quantity: number) => {
    if (quantity < 1) return
    setFormData(prev => ({
      ...prev,
      comboItems: prev.comboItems?.map(item => 
        item.id === itemId ? { ...item, quantity } : item
      ) || []
    }))
  }

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const availableProducts = products.filter(p => p.isActive && p.isAvailable)

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[700px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {combo ? 'Editar Combo' : 'Novo Combo'}
          </DialogTitle>
          <DialogDescription>
            {combo ? 'Edite as informações do combo' : 'Crie um novo combo para o cardápio'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Combo</Label>
              <Input
                id="name"
                value={formData.name}
                onChange={(e) => setFormData(prev => ({ ...prev, name: e.target.value }))}
                required
              />
            </div>

            <div>
              <Label htmlFor="description">Descrição</Label>
              <Textarea
                id="description"
                value={formData.description}
                onChange={(e) => setFormData(prev => ({ ...prev, description: e.target.value }))}
                rows={3}
              />
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="price">Preço do Combo</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="price"
                    type="number"
                    step="0.01"
                    value={formData.price}
                    onChange={(e) => setFormData(prev => ({ ...prev, price: parseFloat(e.target.value) || 0 }))}
                    className="pl-9"
                    required
                  />
                </div>
              </div>

              <div>
                <Label htmlFor="originalPrice">Preço Original (separado)</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="originalPrice"
                    type="number"
                    step="0.01"
                    value={formData.originalPrice || calculateOriginalPrice()}
                    onChange={(e) => setFormData(prev => ({ ...prev, originalPrice: parseFloat(e.target.value) || 0 }))}
                    className="pl-9"
                    placeholder="Calculado automaticamente"
                  />
                </div>
                <p className="text-xs text-muted-foreground mt-1">
                  Valor calculado: R$ {calculateOriginalPrice().toFixed(2)}
                </p>
              </div>
            </div>

            <div>
              <Label htmlFor="image">URL da Imagem</Label>
              <div className="relative">
                <ImageIcon className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="image"
                  value={formData.image}
                  onChange={(e) => setFormData(prev => ({ ...prev, image: e.target.value }))}
                  className="pl-9"
                  placeholder="https://exemplo.com/imagem.jpg"
                />
              </div>
            </div>
          </div>

          {/* Status Options */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Status e Opções</h3>
            
            <div className="grid grid-cols-2 gap-4">
              <div className="flex items-center space-x-2">
                <Switch
                  id="isActive"
                  checked={formData.isActive}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
                />
                <Label htmlFor="isActive">Ativo</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isAvailable"
                  checked={formData.isAvailable}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isAvailable: checked }))}
                />
                <Label htmlFor="isAvailable">Disponível</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isFeatured"
                  checked={formData.isFeatured}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isFeatured: checked }))}
                />
                <Label htmlFor="isFeatured" className="flex items-center">
                  <Star className="h-4 w-4 mr-1 text-yellow-500" />
                  Destaque
                </Label>
              </div>
            </div>

            <div>
              <Label htmlFor="preparationTime">Tempo de Preparo (minutos)</Label>
              <div className="relative">
                <Clock className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="preparationTime"
                  type="number"
                  value={formData.preparationTime}
                  onChange={(e) => setFormData(prev => ({ ...prev, preparationTime: parseInt(e.target.value) || undefined }))}
                  className="pl-9"
                />
              </div>
            </div>
          </div>

          {/* Combo Items */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Itens do Combo</h3>
            
            {/* Add New Item */}
            <Card>
              <CardContent className="pt-6">
                <div className="grid grid-cols-12 gap-2 items-end">
                  <div className="col-span-5">
                    <Label htmlFor="productSelect">Produto</Label>
                    <Select 
                      value={newItem.productId} 
                      onValueChange={(value) => setNewItem(prev => ({ ...prev, productId: value }))}
                    >
                      <SelectTrigger>
                        <SelectValue placeholder="Selecione um produto" />
                      </SelectTrigger>
                      <SelectContent>
                        {availableProducts.map((product) => (
                          <SelectItem key={product.id} value={product.id}>
                            {product.name} (R$ {product.price.toFixed(2)})
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>

                  <div className="col-span-2">
                    <Label htmlFor="quantity">Qtd</Label>
                    <Input
                      id="quantity"
                      type="number"
                      min="1"
                      value={newItem.quantity}
                      onChange={(e) => setNewItem(prev => ({ ...prev, quantity: parseInt(e.target.value) || 1 }))}
                    />
                  </div>

                  <div className="col-span-3 flex items-center space-x-2">
                    <Switch
                      id="isOptional"
                      checked={newItem.isOptional}
                      onCheckedChange={(checked) => setNewItem(prev => ({ ...prev, isOptional: checked }))}
                    />
                    <Label htmlFor="isOptional" className="text-sm">Opcional</Label>
                  </div>

                  <div className="col-span-2">
                    <Button type="button" onClick={addItem} className="w-full">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Current Items */}
            {formData.comboItems && formData.comboItems.length > 0 && (
              <div className="space-y-2">
                <Label>Itens Atuais:</Label>
                <div className="space-y-2 max-h-40 overflow-y-auto">
                  {formData.comboItems.map((item) => {
                    const product = products.find(p => p.id === item.productId)
                    return (
                      <div key={item.id} className="flex items-center justify-between p-3 border rounded-lg">
                        <div className="flex items-center space-x-3">
                          <span className="font-medium">{item.productName}</span>
                          <Badge variant="outline">
                            {item.quantity}x
                          </Badge>
                          {item.isOptional && (
                            <Badge variant="secondary">Opcional</Badge>
                          )}
                          {product && !product.isAvailable && (
                            <Badge variant="destructive">Indisponível</Badge>
                          )}
                        </div>
                        
                        <div className="flex items-center space-x-2">
                          <div className="flex items-center space-x-1">
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.id, item.quantity - 1)}
                              disabled={item.quantity <= 1}
                            >
                              <Minus className="h-3 w-3" />
                            </Button>
                            <span className="text-sm w-8 text-center">{item.quantity}</span>
                            <Button
                              type="button"
                              variant="outline"
                              size="sm"
                              onClick={() => updateItemQuantity(item.id, item.quantity + 1)}
                            >
                              <Plus className="h-3 w-3" />
                            </Button>
                          </div>
                          
                          <Button
                            type="button"
                            variant="outline"
                            size="sm"
                            onClick={() => removeItem(item.id)}
                            className="text-red-600 hover:text-red-700"
                          >
                            <Trash2 className="h-3 w-3" />
                          </Button>
                        </div>
                      </div>
                    )
                  })}
                </div>
              </div>
            )}
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {combo ? 'Atualizar' : 'Criar'} Combo
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}