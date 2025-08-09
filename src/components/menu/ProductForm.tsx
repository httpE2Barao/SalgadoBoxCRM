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
import { 
  Plus, 
  X,
  Image as ImageIcon,
  DollarSign,
  Star,
  Leaf,
  Heart,
  WheatOff,
  Flame
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
  image?: string
}

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
  spicyLevel?: number
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  tags?: string[]
  ingredients?: string[]
  allergens?: string[]
  nutritionalInfo?: any
  stock?: number
  minimumStock?: number
}

interface ProductFormProps {
  product?: Product
  categories: Category[]
  isOpen: boolean
  onClose: () => void
  onSave: (product: Partial<Product>) => void
}

export default function ProductForm({ product, categories, isOpen, onClose, onSave }: ProductFormProps) {
  const [formData, setFormData] = useState<Partial<Product>>({
    name: product?.name || '',
    description: product?.description || '',
    price: product?.price || 0,
    costPrice: product?.costPrice || 0,
    image: product?.image || '',
    isActive: product?.isActive ?? true,
    isAvailable: product?.isAvailable ?? true,
    isFeatured: product?.isFeatured ?? false,
    calories: product?.calories,
    displayOrder: product?.displayOrder || 0,
    categoryId: product?.categoryId,
    spicyLevel: product?.spicyLevel || 0,
    isVegetarian: product?.isVegetarian || false,
    isVegan: product?.isVegan || false,
    isGlutenFree: product?.isGlutenFree || false,
    stock: product?.stock || 0,
    minimumStock: product?.minimumStock || 0,
    tags: product?.tags || [],
    ingredients: product?.ingredients || [],
    allergens: product?.allergens || [],
    nutritionalInfo: product?.nutritionalInfo || {}
  })

  const [newTag, setNewTag] = useState('')
  const [newIngredient, setNewIngredient] = useState('')
  const [newAllergen, setNewAllergen] = useState('')

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  const addTag = () => {
    if (newTag.trim() && !formData.tags?.includes(newTag.trim())) {
      setFormData(prev => ({
        ...prev,
        tags: [...(prev.tags || []), newTag.trim()]
      }))
      setNewTag('')
    }
  }

  const removeTag = (tagToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      tags: prev.tags?.filter(tag => tag !== tagToRemove) || []
    }))
  }

  const addIngredient = () => {
    if (newIngredient.trim() && !formData.ingredients?.includes(newIngredient.trim())) {
      setFormData(prev => ({
        ...prev,
        ingredients: [...(prev.ingredients || []), newIngredient.trim()]
      }))
      setNewIngredient('')
    }
  }

  const removeIngredient = (ingredientToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      ingredients: prev.ingredients?.filter(ingredient => ingredient !== ingredientToRemove) || []
    }))
  }

  const addAllergen = () => {
    if (newAllergen.trim() && !formData.allergens?.includes(newAllergen.trim())) {
      setFormData(prev => ({
        ...prev,
        allergens: [...(prev.allergens || []), newAllergen.trim()]
      }))
      setNewAllergen('')
    }
  }

  const removeAllergen = (allergenToRemove: string) => {
    setFormData(prev => ({
      ...prev,
      allergens: prev.allergens?.filter(allergen => allergen !== allergenToRemove) || []
    }))
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[600px] max-h-[80vh] overflow-y-auto">
        <DialogHeader>
          <DialogTitle>
            {product ? 'Editar Produto' : 'Novo Produto'}
          </DialogTitle>
          <DialogDescription>
            {product ? 'Edite as informações do produto' : 'Crie um novo produto para o cardápio'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-6">
          {/* Basic Information */}
          <div className="space-y-4">
            <div>
              <Label htmlFor="name">Nome do Produto</Label>
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
                <Label htmlFor="price">Preço de Venda</Label>
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
                <Label htmlFor="costPrice">Preço de Custo</Label>
                <div className="relative">
                  <DollarSign className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="costPrice"
                    type="number"
                    step="0.01"
                    value={formData.costPrice}
                    onChange={(e) => setFormData(prev => ({ ...prev, costPrice: parseFloat(e.target.value) || 0 }))}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>

            {/* Stock Information */}
            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="stock">Estoque Atual</Label>
                <Input
                  id="stock"
                  type="number"
                  min="0"
                  value={formData.stock}
                  onChange={(e) => setFormData(prev => ({ ...prev, stock: parseInt(e.target.value) || 0 }))}
                />
              </div>

              <div>
                <Label htmlFor="minimumStock">Estoque Mínimo</Label>
                <Input
                  id="minimumStock"
                  type="number"
                  min="0"
                  value={formData.minimumStock}
                  onChange={(e) => setFormData(prev => ({ ...prev, minimumStock: parseInt(e.target.value) || 0 }))}
                />
              </div>
            </div>

            <div>
              <Label htmlFor="category">Categoria</Label>
              <Select 
                value={formData.categoryId} 
                onValueChange={(value) => setFormData(prev => ({ ...prev, categoryId: value }))}
              >
                <SelectTrigger>
                  <SelectValue placeholder="Selecione uma categoria" />
                </SelectTrigger>
                <SelectContent>
                  {categories.map((category) => (
                    <SelectItem key={category.id} value={category.id}>
                      {category.name}
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
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
                <Label htmlFor="isFeatured">Destaque</Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVegetarian"
                  checked={formData.isVegetarian}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVegetarian: checked }))}
                />
                <Label htmlFor="isVegetarian" className="flex items-center">
                  <Leaf className="h-4 w-4 mr-1 text-green-600" />
                  Vegetariano
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isVegan"
                  checked={formData.isVegan}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isVegan: checked }))}
                />
                <Label htmlFor="isVegan" className="flex items-center">
                  <Heart className="h-4 w-4 mr-1 text-green-500" />
                  Vegano
                </Label>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="isGlutenFree"
                  checked={formData.isGlutenFree}
                  onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isGlutenFree: checked }))}
                />
                <Label htmlFor="isGlutenFree" className="flex items-center">
                  <WheatOff className="h-4 w-4 mr-1 text-blue-600" />
                  Sem Glúten
                </Label>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div>
                <Label htmlFor="spicyLevel">Nível de Pimenta (0-3)</Label>
                <div className="relative">
                  <Flame className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                  <Input
                    id="spicyLevel"
                    type="number"
                    min="0"
                    max="3"
                    value={formData.spicyLevel}
                    onChange={(e) => setFormData(prev => ({ ...prev, spicyLevel: parseInt(e.target.value) || 0 }))}
                    className="pl-9"
                  />
                </div>
              </div>
            </div>
          </div>

          {/* Tags */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Tags</h3>
            <div className="flex space-x-2">
              <Input
                value={newTag}
                onChange={(e) => setNewTag(e.target.value)}
                placeholder="Adicionar tag"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addTag())}
              />
              <Button type="button" onClick={addTag}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.tags?.map((tag, index) => (
                <div key={index} className="flex items-center space-x-1 bg-secondary px-2 py-1 rounded">
                  <span className="text-sm">{tag}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeTag(tag)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Ingredients */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Ingredientes</h3>
            <div className="flex space-x-2">
              <Input
                value={newIngredient}
                onChange={(e) => setNewIngredient(e.target.value)}
                placeholder="Adicionar ingrediente"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addIngredient())}
              />
              <Button type="button" onClick={addIngredient}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.ingredients?.map((ingredient, index) => (
                <div key={index} className="flex items-center space-x-1 bg-secondary px-2 py-1 rounded">
                  <span className="text-sm">{ingredient}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeIngredient(ingredient)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          {/* Allergens */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Alérgenos</h3>
            <div className="flex space-x-2">
              <Input
                value={newAllergen}
                onChange={(e) => setNewAllergen(e.target.value)}
                placeholder="Adicionar alérgeno"
                onKeyPress={(e) => e.key === 'Enter' && (e.preventDefault(), addAllergen())}
              />
              <Button type="button" onClick={addAllergen}>
                <Plus className="h-4 w-4" />
              </Button>
            </div>
            <div className="flex flex-wrap gap-2">
              {formData.allergens?.map((allergen, index) => (
                <div key={index} className="flex items-center space-x-1 bg-destructive/10 px-2 py-1 rounded">
                  <span className="text-sm text-destructive">{allergen}</span>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    onClick={() => removeAllergen(allergen)}
                    className="h-4 w-4 p-0"
                  >
                    <X className="h-3 w-3" />
                  </Button>
                </div>
              ))}
            </div>
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {product ? 'Atualizar' : 'Criar'} Produto
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}