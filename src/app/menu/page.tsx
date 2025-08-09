"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import ProductCard from '@/components/menu/ProductCard'
import CategoryCard from '@/components/menu/CategoryCard'
import ProductForm from '@/components/menu/ProductForm'
import CategoryForm from '@/components/menu/CategoryForm'
import ComboCard from '@/components/menu/ComboCard'
import ComboForm from '@/components/menu/ComboForm'
import RealTimeSync from '@/components/ui/real-time-sync'
import StockNotifications from '@/components/menu/StockNotifications'
import BulkEditModal from '@/components/menu/BulkEditModal'
import { BulkSelectionControls } from '@/components/ui/bulk-selection-controls'
import { useMenu } from '@/hooks/use-menu'
import { useSelectableItems } from '@/hooks/use-selectable-items'
import { useDebounce } from '@/hooks/use-debounce'
import { useLocalStorage } from '@/hooks/use-local-storage'
import { 
  Plus, 
  Search, 
  Filter, 
  Grid, 
  List,
  Star,
  Package,
  TrendingUp,
  AlertTriangle,
  CheckCircle,
  XCircle,
  ExternalLink,
  RefreshCw,
  Settings,
  BarChart3,
  Square,
  CheckSquare,
  Edit3,
  X
} from 'lucide-react'
import { toast } from 'sonner'

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

interface ProductOption {
  id: string
  name: string
  description?: string
  price: number
  isActive: boolean
  displayOrder: number
}

interface Category {
  id: string
  name: string
  description?: string
  displayOrder: number
  isActive: boolean
  image?: string
  productCount: number
  color?: string
  icon?: string
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
  displayOrder: number
  comboItems: any[]
}

export default function MenuManagement() {
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  const { 
    menuData, 
    updateProduct, 
    updateCategory, 
    deleteProduct, 
    deleteCategory, 
    toggleProductStatus, 
    toggleProductStatusByStock,
    toggleCategoryStatus,
    fetchMenu 
  } = useMenu()
  
  // Initialize data
  useEffect(() => {
    const initializeData = async () => {
      try {
        setLoading(true)
        setError(null)
        await fetchMenu()
      } catch (err) {
        console.error('Error initializing menu:', err)
        setError(err instanceof Error ? err.message : 'Failed to initialize menu')
      } finally {
        setLoading(false)
      }
    }

    initializeData()
  }, [])
  
  const [searchTerm, setSearchTerm] = useState('')
  const [selectedCategory, setSelectedCategory] = useState('all')
  const [statusFilter, setStatusFilter] = useState('all')
  const [stockFilter, setStockFilter] = useState('all')
  const [viewMode, setViewMode] = useState<'grid' | 'list'>('grid')
  const [isProductDialogOpen, setIsProductDialogOpen] = useState(false)
  const [isCategoryDialogOpen, setIsCategoryDialogOpen] = useState(false)
  const [isComboDialogOpen, setIsComboDialogOpen] = useState(false)
  const [editingProduct, setEditingProduct] = useState<any>(null)
  const [editingCategory, setEditingCategory] = useState<any>(null)
  const [editingCombo, setEditingCombo] = useState<any>(null)
  const [lastSyncTime, setLastSyncTime] = useState<Date | null>(null)
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false)
  const [isBulkEditModalOpen, setIsBulkEditModalOpen] = useState(false)

  // Use debounced search term
  const debouncedSearchTerm = useDebounce(searchTerm, 300)

  // Use local storage for view mode preference
  const [savedViewMode, setSavedViewMode] = useLocalStorage<'grid' | 'list'>('menu-view-mode', 'grid')
  
  // Update view mode when saved preference changes
  useEffect(() => {
    setViewMode(savedViewMode)
  }, [savedViewMode])

  // Open product dialog when editingProduct is set
  useEffect(() => {
    if (editingProduct) {
      setIsProductDialogOpen(true)
    }
  }, [editingProduct])

  // Open category dialog when editingCategory is set
  useEffect(() => {
    if (editingCategory) {
      setIsCategoryDialogOpen(true)
    }
  }, [editingCategory])

  // Open combo dialog when editingCombo is set
  useEffect(() => {
    if (editingCombo) {
      setIsComboDialogOpen(true)
    }
  }, [editingCombo])

  // Transform data for components when menuData changes
  const [transformedProducts, setTransformedProducts] = useState<any[]>([])
  const [transformedCategories, setTransformedCategories] = useState<any[]>([])
  const [transformedCombos, setTransformedCombos] = useState<any[]>([])

  useEffect(() => {
    const products = menuData.products ? menuData.products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice || 0,
      image: product.image,
      isActive: product.isActive,
      isAvailable: product.isAvailable,
      isFeatured: product.isFeatured || false,
      categoryName: product.category,
      displayOrder: product.displayOrder || 0,
      categoryId: product.categoryId || '',
      options: [],
      spicyLevel: product.spicyLevel,
      isVegetarian: product.isVegetarian,
      isVegan: product.isVegan,
      isGlutenFree: product.isGlutenFree,
      tags: product.tags,
      ingredients: product.ingredients,
      allergens: product.allergens,
      nutritionalInfo: product.nutritionalInfo,
      stock: product.stock || 0,
      minimumStock: product.minimumStock || 0
    })) : []

    const categories = menuData.categories ? menuData.categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      displayOrder: 0,
      isActive: category.isActive,
      image: '',
      productCount: products.filter(p => p.categoryName === category.name).length,
      color: category.color,
      icon: category.icon
    })) : []

    const combos = menuData.combos?.map(combo => ({
      id: combo.id,
      name: combo.name,
      description: combo.description,
      price: combo.price,
      originalPrice: combo.originalPrice,
      image: combo.image,
      isActive: combo.isActive,
      isAvailable: combo.isAvailable,
      isFeatured: combo.isFeatured,
      displayOrder: combo.displayOrder,
      comboItems: combo.comboItems
    })) || []

    setTransformedProducts(products)
    setTransformedCategories(categories)
    setTransformedCombos(combos)
  }, [menuData])

  // Transform data for components
  const products = menuData.products ? menuData.products.map(product => ({
    id: product.id,
    name: product.name,
    description: product.description,
    price: product.price,
    costPrice: product.costPrice || 0,
    image: product.image,
    isActive: product.isActive,
    isAvailable: product.isAvailable,
    isFeatured: product.isFeatured || false,
    categoryName: product.category,
    displayOrder: product.displayOrder || 0,
    categoryId: product.categoryId || '',
    options: [],
    spicyLevel: product.spicyLevel,
    isVegetarian: product.isVegetarian,
    isVegan: product.isVegan,
    isGlutenFree: product.isGlutenFree,
    tags: product.tags,
    ingredients: product.ingredients,
    allergens: product.allergens,
    nutritionalInfo: product.nutritionalInfo,
    stock: product.stock || 0,
    minimumStock: product.minimumStock || 0
  })) : []

  const categories = menuData.categories ? menuData.categories.map(category => ({
    id: category.id,
    name: category.name,
    description: category.description,
    displayOrder: 0,
    isActive: category.isActive,
    image: '',
    productCount: products.filter(p => p.categoryName === category.name).length,
    color: category.color,
    icon: category.icon
  })) : []

  const combos = menuData.combos?.map(combo => ({
    id: combo.id,
    name: combo.name,
    description: combo.description,
    price: combo.price,
    originalPrice: combo.originalPrice,
    image: combo.image,
    isActive: combo.isActive,
    isAvailable: combo.isAvailable,
    isFeatured: combo.isFeatured,
    displayOrder: combo.displayOrder,
    comboItems: combo.comboItems
  })) || []

  const filteredProducts = transformedProducts.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(debouncedSearchTerm.toLowerCase()) ||
                         product.description?.toLowerCase().includes(debouncedSearchTerm.toLowerCase())
    const matchesCategory = selectedCategory === 'all' || product.categoryName === selectedCategory
    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && product.isActive) ||
                          (statusFilter === 'inactive' && !product.isActive) ||
                          (statusFilter === 'available' && product.isAvailable) ||
                          (statusFilter === 'unavailable' && !product.isAvailable) ||
                          (statusFilter === 'featured' && product.isFeatured)
    
    const matchesStock = stockFilter === 'all' ||
                         (stockFilter === 'in-stock' && (product.stock || 0) > 0) ||
                         (stockFilter === 'low-stock' && (product.stock || 0) <= (product.minimumStock || 0) && (product.stock || 0) > 0) ||
                         (stockFilter === 'out-of-stock' && (product.stock || 0) === 0)

    return matchesSearch && matchesCategory && matchesStatus && matchesStock
  })

  // Use bulk selection hooks
  const productSelection = useSelectableItems({
    items: filteredProducts,
    getId: (product) => product.id
  })

  const categorySelection = useSelectableItems({
    items: transformedCategories,
    getId: (category) => category.id
  })

  const comboSelection = useSelectableItems({
    items: transformedCombos,
    getId: (combo) => combo.id
  })

  const handleBulkEdit = () => {
    if (productSelection.selectionCount > 0) {
      setIsBulkEditModalOpen(true)
    }
  }

  const handleBulkUpdate = async (updateData: any) => {
    try {
      const promises = productSelection.getSelectedItems().map(product => 
        fetch(`/api/products/${product.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(updateData)
        })
      )
      
      await Promise.all(promises)
      await fetchMenu()
      setLastSyncTime(new Date())
      productSelection.clearSelection()
      setIsBulkEditModalOpen(false)
      toast.success(`${productSelection.selectionCount} produtos atualizados com sucesso!`)
    } catch (error) {
      console.error('Error in bulk update:', error)
      toast.error('Erro ao atualizar produtos em massa')
    }
  }

  const stats = {
    totalProducts: transformedProducts.length,
    activeProducts: transformedProducts.filter(p => p.isActive).length,
    featuredProducts: transformedProducts.filter(p => p.isFeatured).length,
    unavailableProducts: transformedProducts.filter(p => !p.isAvailable).length,
    lowStockProducts: transformedProducts.filter(p => (p.stock || 0) <= (p.minimumStock || 0) && (p.minimumStock || 0) > 0).length,
    outOfStockProducts: transformedProducts.filter(p => (p.stock || 0) === 0).length,
    totalCategories: transformedCategories.length,
    activeCategories: transformedCategories.filter(c => c.isActive).length,
    totalCombos: transformedCombos.length,
    activeCombos: transformedCombos.filter(c => c.isActive).length,
    availableCombos: transformedCombos.filter(c => c.isAvailable).length
  }

  const handleToggleProductStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleProductStatus(id, isActive)
      setLastSyncTime(new Date())
      // Force immediate refresh
      await fetchMenu()
      toast.success('Status do produto atualizado com sucesso!')
    } catch (error) {
      console.error('Error toggling product status:', error)
      toast.error('Erro ao atualizar status do produto')
    }
  }

  const handleToggleProductStatusByStock = async (id: string) => {
    try {
      await toggleProductStatusByStock(id)
      setLastSyncTime(new Date())
      // Force immediate refresh
      await fetchMenu()
      toast.success('Status do produto atualizado automaticamente com base no estoque!')
    } catch (error) {
      console.error('Error toggling product status by stock:', error)
      toast.error('Erro ao atualizar status do produto')
    }
  }

  const handleToggleProductAvailability = async (id: string, isAvailable: boolean) => {
    try {
      await updateProduct(id, { isAvailable })
      setLastSyncTime(new Date())
      // Force immediate refresh
      await fetchMenu()
      toast.success('Disponibilidade do produto atualizada com sucesso!')
    } catch (error) {
      console.error('Error toggling product availability:', error)
      toast.error('Erro ao atualizar disponibilidade do produto')
    }
  }

  const handleToggleProductFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await updateProduct(id, { isFeatured })
      setLastSyncTime(new Date())
      // Force immediate refresh
      await fetchMenu()
      toast.success('Destaque do produto atualizado com sucesso!')
    } catch (error) {
      console.error('Error toggling product featured:', error)
      toast.error('Erro ao atualizar destaque do produto')
    }
  }

  const handleToggleCategoryStatus = async (id: string, isActive: boolean) => {
    try {
      await toggleCategoryStatus(id, isActive)
      setLastSyncTime(new Date())
      // Force immediate refresh
      await fetchMenu()
      toast.success('Status da categoria atualizado com sucesso!')
    } catch (error) {
      console.error('Error toggling category status:', error)
      toast.error('Erro ao atualizar status da categoria')
    }
  }

  const handleDeleteProduct = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este produto?')) {
      try {
        await deleteProduct(id)
        setLastSyncTime(new Date())
        // Force immediate refresh
        await fetchMenu()
        toast.success('Produto excluído com sucesso!')
      } catch (error) {
        console.error('Error deleting product:', error)
        toast.error('Erro ao excluir produto')
      }
    }
  }

  const handleDeleteCategory = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir esta categoria?')) {
      try {
        await deleteCategory(id)
        setLastSyncTime(new Date())
        // Force immediate refresh
        await fetchMenu()
        toast.success('Categoria excluída com sucesso!')
      } catch (error) {
        console.error('Error deleting category:', error)
        toast.error('Erro ao excluir categoria')
      }
    }
  }

  const handleSaveProduct = async (productData: Partial<Product>) => {
    try {
      if (editingProduct) {
        // Use direct API call instead of hook for more reliable updates
        const response = await fetch(`/api/products/${editingProduct.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
        
        if (response.ok) {
          await fetchMenu()
          setLastSyncTime(new Date())
          toast.success('Produto atualizado com sucesso!')
        } else {
          throw new Error('Failed to update product')
        }
      } else {
        const response = await fetch('/api/products', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(productData)
        })
        if (response.ok) {
          await fetchMenu()
          setLastSyncTime(new Date())
          toast.success('Produto criado com sucesso!')
        } else {
          throw new Error('Failed to create product')
        }
      }
      setIsProductDialogOpen(false)
      setEditingProduct(null)
    } catch (error) {
      console.error('Error saving product:', error)
      toast.error('Erro ao salvar produto')
    }
  }

  const handleSaveCategory = async (categoryData: Partial<Category>) => {
    try {
      if (editingCategory) {
        await updateCategory(editingCategory.id, categoryData)
        toast.success('Categoria atualizada com sucesso!')
      } else {
        const response = await fetch('/api/categories', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(categoryData)
        })
        if (response.ok) {
          await fetchMenu()
          setLastSyncTime(new Date())
          toast.success('Categoria criada com sucesso!')
        }
      }
      setIsCategoryDialogOpen(false)
      setEditingCategory(null)
    } catch (error) {
      console.error('Error saving category:', error)
      toast.error('Erro ao salvar categoria')
    }
  }

  const handleSaveCombo = async (comboData: Partial<Combo>) => {
    try {
      if (editingCombo) {
        const response = await fetch(`/api/combos/${editingCombo.id}`, {
          method: 'PUT',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comboData)
        })
        if (response.ok) {
          await fetchMenu()
          setLastSyncTime(new Date())
          toast.success('Combo atualizado com sucesso!')
        }
      } else {
        const response = await fetch('/api/combos', {
          method: 'POST',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(comboData)
        })
        if (response.ok) {
          await fetchMenu()
          setLastSyncTime(new Date())
          toast.success('Combo criado com sucesso!')
        }
      }
      setIsComboDialogOpen(false)
      setEditingCombo(null)
    } catch (error) {
      console.error('Error saving combo:', error)
      toast.error('Erro ao salvar combo')
    }
  }

  const handleDeleteCombo = async (id: string) => {
    if (confirm('Tem certeza que deseja excluir este combo?')) {
      try {
        await fetch(`/api/combos/${id}`, {
          method: 'DELETE'
        })
        await fetchMenu()
        setLastSyncTime(new Date())
        toast.success('Combo excluído com sucesso!')
      } catch (error) {
        console.error('Error deleting combo:', error)
        toast.error('Erro ao excluir combo')
      }
    }
  }

  const handleToggleComboStatus = async (id: string, isActive: boolean) => {
    try {
      await fetch(`/api/combos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isActive })
      })
      await fetchMenu()
      setLastSyncTime(new Date())
      toast.success('Status do combo atualizado com sucesso!')
    } catch (error) {
      console.error('Error toggling combo status:', error)
      toast.error('Erro ao atualizar status do combo')
    }
  }

  const handleToggleComboFeatured = async (id: string, isFeatured: boolean) => {
    try {
      await fetch(`/api/combos/${id}`, {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isFeatured })
      })
      await fetchMenu()
      setLastSyncTime(new Date())
      toast.success('Destaque do combo atualizado com sucesso!')
    } catch (error) {
      console.error('Error toggling combo featured:', error)
      toast.error('Erro ao atualizar destaque do combo')
    }
  }

  const refreshData = async () => {
    try {
      await fetchMenu()
      setLastSyncTime(new Date())
      toast.success('Dados atualizados com sucesso!')
    } catch (error) {
      console.error('Error refreshing data:', error)
      toast.error('Erro ao atualizar dados')
    }
  }

  const refreshAllData = async () => {
    try {
      // Force refresh with cache invalidation
      await fetchMenu(true)
      setLastSyncTime(new Date())
      toast.success('Todos os dados atualizados com sucesso!')
    } catch (error) {
      console.error('Error refreshing all data:', error)
      toast.error('Erro ao atualizar todos os dados')
    }
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-muted-foreground">Carregando cardápio...</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
        {/* Header */}
        <div className="flex flex-col md:flex-row md:items-center md:justify-between space-y-4 md:space-y-0">
          <div>
            <h1 className="text-3xl font-bold tracking-tight">Gerenciamento de Cardápio</h1>
            <p className="text-muted-foreground">
              Gerencie categorias, produtos e combos do seu cardápio digital
            </p>
          </div>
          <div className="flex items-center space-x-2">
            <Button onClick={refreshAllData} className="bg-blue-600 hover:bg-blue-700 text-white">
              <RefreshCw className="mr-2 h-4 w-4" />
              Atualizar Tudo
            </Button>
            <Button onClick={() => {
              setEditingCategory(null)
              setIsCategoryDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Nova Categoria
            </Button>
            <Button onClick={() => {
              setEditingProduct(null)
              setIsProductDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Produto
            </Button>
            <Button onClick={() => {
              setEditingCombo(null)
              setIsComboDialogOpen(true)
            }}>
              <Plus className="mr-2 h-4 w-4" />
              Novo Combo
            </Button>
            <Button variant="outline" asChild>
              <a href="/public-menu" target="_blank" rel="noopener noreferrer">
                <ExternalLink className="mr-2 h-4 w-4" />
                Ver Cardápio Público
              </a>
            </Button>
          </div>
        </div>

        {/* Alertas de Estoque */}
        {(stats.lowStockProducts > 0 || stats.outOfStockProducts > 0) && (
          <div className="grid gap-4 md:grid-cols-2">
            {stats.lowStockProducts > 0 && (
              <Alert className="border-orange-200 bg-orange-50">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <AlertDescription className="text-orange-800">
                  Você tem {stats.lowStockProducts} produto(s) com estoque baixo. Considere reabastecer.
                </AlertDescription>
              </Alert>
            )}
            {stats.outOfStockProducts > 0 && (
              <Alert className="border-red-200 bg-red-50">
                <AlertTriangle className="h-4 w-4 text-red-600" />
                <AlertDescription className="text-red-800">
                  Você tem {stats.outOfStockProducts} produto(s) esgotado(s). É necessário reabastecer o estoque.
                </AlertDescription>
              </Alert>
            )}
          </div>
        )}

        {/* Stats Cards */}
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-6">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Total Produtos</CardTitle>
              <Package className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Ativos</CardTitle>
              <CheckCircle className="h-4 w-4 text-green-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-green-600">{stats.activeProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Destaques</CardTitle>
              <Star className="h-4 w-4 text-yellow-500" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-yellow-600">{stats.featuredProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Indisponíveis</CardTitle>
              <XCircle className="h-4 w-4 text-red-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-red-600">{stats.unavailableProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
              <AlertTriangle className="h-4 w-4 text-orange-600" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold text-orange-600">{stats.lowStockProducts}</div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Categorias</CardTitle>
              <TrendingUp className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{stats.totalCategories}</div>
            </CardContent>
          </Card>
        </div>

        {/* Stock Notifications */}
        <StockNotifications onRefresh={refreshData} />

        {/* Search and Filters */}
        <Card>
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle className="flex items-center gap-2">
                <Filter className="h-5 w-5" />
                Filtros Avançados
              </CardTitle>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
              >
                <Settings className="h-4 w-4 mr-2" />
                {showAdvancedFilters ? 'Simplificar' : 'Avançado'}
              </Button>
            </div>
          </CardHeader>
          <CardContent>
            <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
              <div>
                <label className="text-sm font-medium mb-2 block">Buscar</label>
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

              <div>
                <label className="text-sm font-medium mb-2 block">Categoria</label>
                <Select value={selectedCategory} onValueChange={setSelectedCategory}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todas categorias" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todas categorias</SelectItem>
                    {transformedCategories.map((category) => (
                      <SelectItem key={category.id} value={category.name}>
                        {category.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <div>
                <label className="text-sm font-medium mb-2 block">Status</label>
                <Select value={statusFilter} onValueChange={setStatusFilter}>
                  <SelectTrigger>
                    <SelectValue placeholder="Todos status" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="all">Todos status</SelectItem>
                    <SelectItem value="active">Ativos</SelectItem>
                    <SelectItem value="inactive">Inativos</SelectItem>
                    <SelectItem value="available">Disponíveis</SelectItem>
                    <SelectItem value="unavailable">Indisponíveis</SelectItem>
                    <SelectItem value="featured">Destaques</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {showAdvancedFilters && (
                <div>
                  <label className="text-sm font-medium mb-2 block">Estoque</label>
                  <Select value={stockFilter} onValueChange={setStockFilter}>
                    <SelectTrigger>
                      <SelectValue placeholder="Todos estoques" />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos estoques</SelectItem>
                      <SelectItem value="in-stock">Em estoque</SelectItem>
                      <SelectItem value="low-stock">Estoque baixo</SelectItem>
                      <SelectItem value="out-of-stock">Esgotado</SelectItem>
                    </SelectContent>
                  </Select>
                </div>
              )}
            </div>

            <div className="flex items-center justify-between mt-4">
              <div className="text-sm text-muted-foreground">
                {filteredProducts.length} produto(s) encontrado(s)
                {productSelection.selectionCount > 0 && (
                  <span className="ml-2 text-primary">
                    ({productSelection.selectionCount} selecionado{productSelection.selectionCount !== 1 ? 's' : ''})
                  </span>
                )}
              </div>
              <div className="flex items-center space-x-2">
                {productSelection.selectionCount > 0 && (
                  <>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={productSelection.clearSelection}
                    >
                      <X className="h-4 w-4 mr-1" />
                      Limpar
                    </Button>
                    <Button
                      variant="default"
                      size="sm"
                      onClick={handleBulkEdit}
                    >
                      <Edit3 className="h-4 w-4 mr-1" />
                      Editar ({productSelection.selectionCount})
                    </Button>
                  </>
                )}
                <Button
                  variant={viewMode === 'grid' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSavedViewMode('grid')}
                >
                  <Grid className="h-4 w-4" />
                </Button>
                <Button
                  variant={viewMode === 'list' ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSavedViewMode('list')}
                >
                  <List className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Main Content */}
        <Tabs defaultValue="products" className="space-y-4">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="products">Produtos</TabsTrigger>
            <TabsTrigger value="categories">Categorias</TabsTrigger>
            <TabsTrigger value="combos">Combos</TabsTrigger>
          </TabsList>

          <TabsContent value="products">
            <BulkSelectionControls
              itemCount={filteredProducts.length}
              selectedCount={productSelection.selectionCount}
              isAllSelected={productSelection.isAllSelected}
              onSelectAll={productSelection.toggleAll}
              onClearSelection={productSelection.clearSelection}
              onBulkEdit={handleBulkEdit}
              entityName="produtos"
            />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4">
              {filteredProducts.map((product) => (
                <ProductCard
                  key={product.id}
                  product={product}
                  showAdminControls={true}
                  isSelected={productSelection.isSelected(product.id)}
                  onSelectionToggle={(isSelected) => productSelection.toggleItem(product.id)}
                  onEdit={setEditingProduct}
                  onDelete={handleDeleteProduct}
                  onToggleStatus={handleToggleProductStatus}
                  onToggleAvailability={handleToggleProductAvailability}
                  onToggleFeatured={handleToggleProductFeatured}
                  onToggleStatusByStock={handleToggleProductStatusByStock}
                  showSelection={true}
                />
              ))}
            </div>
            {filteredProducts.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhum produto encontrado com os filtros selecionados.
                </p>
                <Button onClick={() => setIsProductDialogOpen(true)}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Produto
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="categories">
            <BulkSelectionControls
              itemCount={transformedCategories.length}
              selectedCount={categorySelection.selectionCount}
              isAllSelected={categorySelection.isAllSelected}
              onSelectAll={categorySelection.toggleAll}
              onClearSelection={categorySelection.clearSelection}
              entityName="categorias"
              bulkEditDisabled={true}
            />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {transformedCategories.map((category) => (
                <CategoryCard
                  key={category.id}
                  category={category}
                  onEdit={setEditingCategory}
                  onDelete={handleDeleteCategory}
                  onToggleStatus={handleToggleCategoryStatus}
                  isSelected={categorySelection.isSelected(category.id)}
                  onSelectionChange={(isSelected) => categorySelection.toggleItem(category.id)}
                  showSelection={true}
                />
              ))}
            </div>
            {transformedCategories.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhuma categoria cadastrada.
                </p>
                <Button onClick={() => {
                  setEditingCategory(null)
                  setIsCategoryDialogOpen(true)
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Categoria
                </Button>
              </div>
            )}
          </TabsContent>

          <TabsContent value="combos">
            <BulkSelectionControls
              itemCount={transformedCombos.length}
              selectedCount={comboSelection.selectionCount}
              isAllSelected={comboSelection.isAllSelected}
              onSelectAll={comboSelection.toggleAll}
              onClearSelection={comboSelection.clearSelection}
              entityName="combos"
              bulkEditDisabled={true}
            />
            
            <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
              {transformedCombos.map((combo) => (
                <ComboCard
                  key={combo.id}
                  combo={combo}
                  showAdminControls={true}
                  isSelected={comboSelection.isSelected(combo.id)}
                  onSelectionChange={(isSelected) => comboSelection.toggleItem(combo.id)}
                  showSelection={true}
                  onEdit={setEditingCombo}
                  onDelete={handleDeleteCombo}
                  onToggleStatus={handleToggleComboStatus}
                  onToggleFeatured={handleToggleComboFeatured}
                />
              ))}
            </div>
            {transformedCombos.length === 0 && (
              <div className="text-center py-12">
                <p className="text-muted-foreground mb-4">
                  Nenhum combo cadastrado.
                </p>
                <Button onClick={() => {
                  setEditingCombo(null)
                  setIsComboDialogOpen(true)
                }}>
                  <Plus className="mr-2 h-4 w-4" />
                  Adicionar Combo
                </Button>
              </div>
            )}
          </TabsContent>
        </Tabs>

        {/* Real-time sync indicator */}
        <RealTimeSync lastSync={lastSyncTime} />

        {/* Dialogs */}
        {isProductDialogOpen && (
          <ProductForm
            product={editingProduct}
            categories={transformedCategories}
            isOpen={isProductDialogOpen}
            onClose={() => {
              setIsProductDialogOpen(false)
              setEditingProduct(null)
            }}
            onSave={handleSaveProduct}
          />
        )}

        {isCategoryDialogOpen && (
          <CategoryForm
            category={editingCategory}
            isOpen={isCategoryDialogOpen}
            onClose={() => {
              setIsCategoryDialogOpen(false)
              setEditingCategory(null)
            }}
            onSave={handleSaveCategory}
          />
        )}

        {isComboDialogOpen && (
          <ComboForm
            combo={editingCombo}
            products={products}
            isOpen={isComboDialogOpen}
            onClose={() => {
              setIsComboDialogOpen(false)
              setEditingCombo(null)
            }}
            onSave={handleSaveCombo}
          />
        )}

        {isBulkEditModalOpen && (
          <BulkEditModal
            isOpen={isBulkEditModalOpen}
            onClose={() => {
              setIsBulkEditModalOpen(false)
            }}
            selectedCount={productSelection.selectionCount}
            categories={transformedCategories.map(cat => ({ id: cat.id, name: cat.name }))}
            onUpdate={handleBulkUpdate}
          />
        )}
      </div>
    </div>
  )
}