"use client"

import { useState } from 'react'
import ProductGrid from '@/components/menu/ProductGrid'
import ComboGrid from '@/components/menu/ComboGrid'
import ComboSelector from '@/components/menu/ComboSelector'
import Cart from '@/components/menu/Cart'
import { useMenu } from '@/hooks/use-menu'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Dialog, DialogContent, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { ChefHat, Star, Clock, ShoppingCart, Package } from 'lucide-react'
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
  comboItems: any[]
}

export default function PublicMenu() {
  const { menuData, loading, error, fetchMenu } = useMenu()
  const [selectedCategory, setSelectedCategory] = useState<string>('all')
  const [cartItems, setCartItems] = useState<CartItem[]>([])
  const [isCartOpen, setIsCartOpen] = useState(false)
  const [selectedCombo, setSelectedCombo] = useState<Combo | null>(null)
  const [isComboSelectorOpen, setIsComboSelectorOpen] = useState(false)

  // Transform categories for the select component
  const categories = menuData.categories.map(cat => ({
    id: cat.id,
    name: cat.name,
    isActive: cat.isActive
  }))

  // Transform products for the grid
  const products = menuData.products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    image: product.image,
    isActive: product.isActive,
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured || false,
    preparationTime: product.preparationTime,
    categoryName: product.category,
    displayOrder: product.displayOrder || 0,
    stock: product.stock || 0
  }))

  // Transform combos for the grid
  const combos = menuData.combos.map(combo => ({
    id: combo.id,
    name: combo.name,
    description: combo.description,
    price: combo.price,
    originalPrice: combo.originalPrice,
    image: combo.image,
    isActive: combo.isActive,
    isAvailable: combo.isAvailable,
    isFeatured: combo.isFeatured || false,
    preparationTime: combo.preparationTime,
    displayOrder: combo.displayOrder || 0,
    comboItems: combo.comboItems
  }))

  const handleCategoryChange = (category: string) => {
    setSelectedCategory(category)
    fetchMenu({ category: category === 'all' ? undefined : category, active: true })
  }

  const handleAddToCart = (product: any) => {
    if (!product.isAvailable || product.stock === 0) {
      toast.error('Produto indisponível')
      return
    }

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === product.id && item.type === 'product')
      if (existingItem) {
        if (existingItem.quantity >= (product.stock || 10)) {
          toast.error('Quantidade máxima atingida')
          return prev
        }
        return prev.map(item =>
          item.id === product.id && item.type === 'product'
            ? { ...item, quantity: item.quantity + 1 }
            : item
        )
      }
      return [...prev, {
        id: product.id,
        name: product.name,
        price: product.price,
        quantity: 1,
        image: product.image,
        preparationTime: product.preparationTime,
        type: 'product'
      }]
    })
    
    toast.success(`${product.name} adicionado ao carrinho`)
    setIsCartOpen(true)
  }

  const handleComboAddToCart = (combo: Combo) => {
    setSelectedCombo(combo)
    setIsComboSelectorOpen(true)
  }

  const handleComboItemsSelected = (selectedItems: any[]) => {
    if (!selectedCombo) return

    setCartItems(prev => {
      const existingItem = prev.find(item => item.id === selectedCombo.id && item.type === 'combo')
      if (existingItem) {
        return prev.map(item =>
          item.id === selectedCombo.id && item.type === 'combo'
            ? { ...item, quantity: item.quantity + 1, selectedItems }
            : item
        )
      }
      return [...prev, {
        id: selectedCombo.id,
        name: selectedCombo.name,
        price: selectedCombo.price,
        quantity: 1,
        image: selectedCombo.image,
        preparationTime: selectedCombo.preparationTime,
        type: 'combo',
        selectedItems
      }]
    })
    
    toast.success(`${selectedCombo.name} adicionado ao carrinho`)
    setIsComboSelectorOpen(false)
    setSelectedCombo(null)
    setIsCartOpen(true)
  }

  const handleUpdateQuantity = (id: string, quantity: number, type: 'product' | 'combo') => {
    setCartItems(prev =>
      prev.map(item =>
        item.id === id && item.type === type
          ? { ...item, quantity }
          : item
      )
    )
  }

  const handleRemoveItem = (id: string, type: 'product' | 'combo') => {
    setCartItems(prev => prev.filter(item => !(item.id === id && item.type === type)))
  }

  const handleCheckout = () => {
    if (cartItems.length === 0) {
      toast.error('Carrinho vazio')
      return
    }
    
    // Redirecionar para checkout ou abrir modal de checkout
    window.location.href = '/checkout'
  }

  const handleToggleCart = () => {
    setIsCartOpen(!isCartOpen)
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-primary">Carregando cardápio...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <Card className="max-w-md">
          <CardContent className="pt-6">
            <div className="text-center">
              <p className="text-destructive mb-4">Erro ao carregar o cardápio</p>
              <Button onClick={() => fetchMenu()}>Tentar novamente</Button>
            </div>
          </CardContent>
        </Card>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Cart Component */}
      <Cart
        items={cartItems}
        onUpdateQuantity={handleUpdateQuantity}
        onRemoveItem={handleRemoveItem}
        onCheckout={handleCheckout}
        isOpen={isCartOpen}
        onToggle={handleToggleCart}
      />

      {/* Combo Selector Dialog */}
      <Dialog open={isComboSelectorOpen} onOpenChange={setIsComboSelectorOpen}>
        <DialogContent className="max-w-2xl max-h-[80vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Personalizar Combo</DialogTitle>
          </DialogHeader>
          {selectedCombo && (
            <ComboSelector
              combo={selectedCombo}
              onAddToCart={handleComboItemsSelected}
              onCancel={() => setIsComboSelectorOpen(false)}
            />
          )}
        </DialogContent>
      </Dialog>

      <div className="max-w-7xl mx-auto px-4 py-8">
        {/* Header */}
        <div className="text-center mb-12">
          <div className="flex items-center justify-center gap-3 mb-4">
            <ChefHat className="h-10 w-10 text-primary" />
            <h1 className="text-4xl font-bold text-primary">SALGADO BOX</h1>
          </div>
          <p className="text-xl text-foreground mb-6">Cardápio Digital</p>
          
          {/* Category Filter */}
          <div className="flex justify-center mb-8">
            <Select value={selectedCategory} onValueChange={handleCategoryChange}>
              <SelectTrigger className="w-[250px]">
                <SelectValue placeholder="Selecione uma categoria" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os produtos</SelectItem>
                {categories
                  .filter(cat => cat.isActive)
                  .map((category) => (
                    <SelectItem key={category.id} value={category.name}>
                      {category.name}
                    </SelectItem>
                  ))}
              </SelectContent>
            </Select>
          </div>
          
          {/* Featured Products Banner */}
          {products.some(p => p.isFeatured) && (
            <div className="flex items-center justify-center gap-2 mb-6">
              <Star className="h-5 w-5 text-yellow-500" />
              <span className="text-sm font-medium text-muted-foreground">Produtos em destaque</span>
            </div>
          )}
        </div>

        {/* Combos Section */}
        {combos.length > 0 && (
          <div className="mb-12">
            <div className="flex items-center justify-center gap-2 mb-6">
              <Package className="h-5 w-5 text-primary" />
              <h2 className="text-2xl font-bold">Combos</h2>
              {combos.some(c => c.isFeatured) && (
                <Badge variant="outline" className="border-yellow-500 text-yellow-700">
                  <Star className="h-3 w-3 mr-1" />
                  Destaques
                </Badge>
              )}
            </div>
            <ComboGrid
              combos={combos}
              showAdminControls={false}
              onAddToCart={handleComboAddToCart}
            />
          </div>
        )}

        {/* Products Section */}
        <div className="mb-12">
          <div className="flex items-center justify-center gap-2 mb-6">
            <Star className="h-5 w-5 text-yellow-500" />
            <h2 className="text-2xl font-bold">Produtos</h2>
          </div>
          <ProductGrid
            products={products}
            categories={categories}
            showAdminControls={false}
            showInactive={false}
            onAddToCart={handleAddToCart}
          />
        </div>

        {/* Footer */}
        <div className="mt-16 text-center">
          <div className="bg-card rounded-lg shadow-sm p-6 max-w-2xl mx-auto border">
            <h3 className="text-lg font-semibold mb-4">Informações</h3>
            <div className="grid grid-cols-1 md:grid-cols-3 gap-4 text-sm">
              <div className="flex items-center justify-center gap-2">
                <Clock className="h-4 w-4 text-primary" />
                <span className="text-muted-foreground">Tempo de preparo: 15-30 min</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline">Delivery</Badge>
                <span className="text-muted-foreground">Retirada no local</span>
              </div>
              <div className="flex items-center justify-center gap-2">
                <Badge variant="outline">Pagamento</Badge>
                <span className="text-muted-foreground">Dinheiro, Cartão, PIX</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  )
}