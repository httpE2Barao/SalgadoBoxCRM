"use client"

import { useState } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Textarea } from '@/components/ui/textarea'
import { Label } from '@/components/ui/label'
import { Switch } from '@/components/ui/switch'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { 
  Plus, 
  Hash,
  Package,
  Image as ImageIcon
} from 'lucide-react'

interface Category {
  id: string
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
  image?: string
  color?: string
  icon?: string
}

interface CategoryFormProps {
  category?: Category
  isOpen: boolean
  onClose: () => void
  onSave: (category: Partial<Category>) => void
}

export default function CategoryForm({ category, isOpen, onClose, onSave }: CategoryFormProps) {
  const [formData, setFormData] = useState<Partial<Category>>({
    name: category?.name || '',
    description: category?.description || '',
    displayOrder: category?.displayOrder || 0,
    isActive: category?.isActive ?? true,
    image: category?.image || '',
    color: category?.color || '',
    icon: category?.icon || ''
  })

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault()
    onSave(formData)
    onClose()
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="sm:max-w-[425px]">
        <DialogHeader>
          <DialogTitle>
            {category ? 'Editar Categoria' : 'Nova Categoria'}
          </DialogTitle>
          <DialogDescription>
            {category ? 'Edite as informações da categoria' : 'Crie uma nova categoria para seu cardápio'}
          </DialogDescription>
        </DialogHeader>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <Label htmlFor="name">Nome da Categoria</Label>
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
              <Label htmlFor="displayOrder">Ordem de Exibição</Label>
              <div className="relative">
                <Hash className="absolute left-3 top-3 h-4 w-4 text-muted-foreground" />
                <Input
                  id="displayOrder"
                  type="number"
                  value={formData.displayOrder}
                  onChange={(e) => setFormData(prev => ({ ...prev, displayOrder: parseInt(e.target.value) || 0 }))}
                  className="pl-9"
                />
              </div>
            </div>

            <div className="flex items-center space-x-2">
              <Switch
                id="isActive"
                checked={formData.isActive}
                onCheckedChange={(checked) => setFormData(prev => ({ ...prev, isActive: checked }))}
              />
              <Label htmlFor="isActive">Ativo</Label>
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

          <div>
            <Label htmlFor="color">Cor (opcional)</Label>
            <Input
              id="color"
              value={formData.color}
              onChange={(e) => setFormData(prev => ({ ...prev, color: e.target.value }))}
              placeholder="#FF6B6B"
            />
          </div>

          <div>
            <Label htmlFor="icon">Ícone (opcional)</Label>
            <Input
              id="icon"
              value={formData.icon}
              onChange={(e) => setFormData(prev => ({ ...prev, icon: e.target.value }))}
              placeholder="Nome do ícone"
            />
          </div>

          <DialogFooter>
            <Button type="button" variant="outline" onClick={onClose}>
              Cancelar
            </Button>
            <Button type="submit">
              {category ? 'Atualizar' : 'Criar'} Categoria
            </Button>
          </DialogFooter>
        </form>
      </DialogContent>
    </Dialog>
  )
}