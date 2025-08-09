"use client"

import { useState, useEffect } from 'react'
import ProductCard from './ProductCard'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Input } from '@/components/ui/input'
import { Search, Plus } from 'lucide-react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  image?: string
  isActive: boolean
  isAvailable: boolean
  isFeatured: boolean
  preparationTime?: number
  categoryName?: string
  displayOrder: number
}

interface Category {
  id: string
  name: string
  isActive: boolean
}

interface ProductGridProps {
  products: Product[]
  categories: Category[]
  showAdminControls?: boolean
  showInactive?: boolean
  onEditProduct?: (product: Product) => void
  onDeleteProduct?: (id: string) => void
  onToggleProductActive?: (id: string) => void
  onToggleProductAvailable?: (id: string) => void
  onAddProduct?: () => void
  onAddToCart?: (product: Product) => void
}

export default function ProductGrid({
  products,
  categories,
  showAdminControls = false,
  showInactive = false,
  onEditProduct,
  onDeleteProduct,
  onToggleProductActive,
  onToggleProductAvailable,
  onAddProduct,
  onAddToCart
}: ProductGridProps) {
  const [filteredProducts, setFilteredProducts] = useState<Product[]>(products)
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [showOnlyActive, setShowOnlyActive] = useState(!showInactive)

  useEffect(() => {
    let filtered = products

    // Filter by search term
    if (searchTerm) {
      filtered = filtered.filter(product =>
        product.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
        product.description?.toLowerCase().includes(searchTerm.toLowerCase())
      )
    }

    // Filter by category
    if (selectedCategory !== 'all') {
      filtered = filtered.filter(product => product.categoryName === selectedCategory)
    }

    // Filter by active status
    if (showOnlyActive) {
      filtered = filtered.filter(product => product.isActive)
    }

    setFilteredProducts(filtered)
  }, [products, searchTerm, selectedCategory, showOnlyActive])

  const activeCategories = categories.filter(cat => cat.isActive)

  return (
    <div className="space-y-6">
      {/* Header with controls */}
      <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
        <div className="flex-1">
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
            <Input
              placeholder="Buscar produtos..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-10"
            />
          </div>
        </div>
        
        <div className="flex items-center gap-2">
          <Select value={selectedCategory} onValueChange={setSelectedCategory}>
            <SelectTrigger className="w-[200px]">
              <SelectValue placeholder="Filtrar por categoria" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todas as categorias</SelectItem>
              {activeCategories.map((category) => (
                <SelectItem key={category.id} value={category.name}>
                  {category.name}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
          
          {showAdminControls && onAddProduct && (
            <Button onClick={onAddProduct}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
          )}
        </div>
      </div>

      {/* Active/Inactive filter */}
      {showAdminControls && (
        <div className="flex items-center gap-2">
          <label className="text-sm font-medium">
            Mostrar inativos:
          </label>
          <input
            type="checkbox"
            checked={!showOnlyActive}
            onChange={(e) => setShowOnlyActive(!e.target.checked)}
            className="rounded"
          />
        </div>
      )}

      {/* Products grid */}
      {filteredProducts.length === 0 ? (
        <div className="text-center py-12">
          <p className="text-muted-foreground">
            {searchTerm || selectedCategory !== 'all' 
              ? 'Nenhum produto encontrado com os filtros selecionados.'
              : 'Nenhum produto cadastrado.'
            }
          </p>
          {showAdminControls && onAddProduct && (
            <Button onClick={onAddProduct} className="mt-4">
              <Plus className="mr-2 h-4 w-4" />
              Adicionar primeiro produto
            </Button>
          )}
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {filteredProducts.map((product) => (
            <ProductCard
              key={product.id}
              product={product}
              showAdminControls={showAdminControls}
              onEdit={onEditProduct}
              onDelete={onDeleteProduct}
              onToggleStatus={onToggleProductActive}
              onToggleAvailability={onToggleProductAvailable}
              onAddToCart={onAddToCart}
            />
          ))}
        </div>
      )}
    </div>
  )
}