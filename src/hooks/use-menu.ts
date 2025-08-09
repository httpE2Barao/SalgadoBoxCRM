import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  costPrice?: number
  category: string
  categoryId?: string
  image?: string
  isFeatured: boolean
  tags?: string[]
  nutritionalInfo?: any
  ingredients?: string[]
  allergens?: string[]
  preparationTime?: number
  spicyLevel?: number
  isVegetarian?: boolean
  isVegan?: boolean
  isGlutenFree?: boolean
  isActive: boolean
  isAvailable: boolean
  stock?: number
  minimumStock?: number
}

interface Category {
  id: string
  name: string
  description?: string
  icon?: string
  color?: string
  isActive: boolean
}

interface MenuData {
  products: Product[]
  categories: Category[]
  combos: any[]
  cachedAt?: string
}

export function useMenu() {
  const [menuData, setMenuData] = useState<MenuData>({ products: [], categories: [], combos: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [lastUpdated, setLastUpdated] = useState<Date | null>(null)

  const fetchMenu = async (forceRefresh = false) => {
    try {
      setLoading(true)
      setError(null)

      const url = new URL('/api/menu', window.location.origin)
      if (forceRefresh) {
        url.searchParams.set('refresh', 'true')
      }
      // For admin interface, include all products (active and inactive)
      url.searchParams.set('active', 'all')

      console.log('Fetching menu from:', url.toString())
      const response = await fetch(url.toString())
      
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      const data = await response.json()
      console.log('Menu data received:', data)
      setMenuData(data)
      setLastUpdated(new Date())
      
    } catch (err) {
      console.error('Error fetching menu:', err)
      setError(err instanceof Error ? err.message : 'Failed to fetch menu')
    } finally {
      setLoading(false)
    }
  }

  const updateProduct = async (productId: string, updates: Partial<Product>) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_product',
          data: { id: productId, ...updates }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh menu data to get latest updates
      await fetchMenu()
      
    } catch (err) {
      console.error('Error updating product:', err)
      throw err
    }
  }

  const createProduct = async (productData: Omit<Product, 'id'>) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_product',
          data: productData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh menu data to get latest updates
      await fetchMenu()
      
    } catch (err) {
      console.error('Error creating product:', err)
      throw err
    }
  }

  const deleteProduct = async (productId: string) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_product',
          data: { id: productId }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh menu data to get latest updates
      await fetchMenu()
      
    } catch (err) {
      console.error('Error deleting product:', err)
      throw err
    }
  }

  const toggleProductStatus = async (productId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_product_status',
          data: { id: productId, isActive }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh menu data to get latest updates
      await fetchMenu()
      
    } catch (err) {
      console.error('Error toggling product status:', err)
      throw err
    }
  }

  const toggleProductStatusByStock = async (productId: string) => {
    try {
      // Get current product data to check stock
      const currentProduct = menuData.products.find(p => p.id === productId)
      if (!currentProduct) {
        throw new Error('Product not found')
      }

      // Auto-toggle based on stock (if stock > 0, set active; if stock === 0, set inactive)
      const newStatus = (currentProduct.stock || 0) > 0
      
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_product_status',
          data: { id: productId, isActive: newStatus }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh menu data to get latest updates
      await fetchMenu()
      
    } catch (err) {
      console.error('Error toggling product status by stock:', err)
      throw err
    }
  }

  const updateCategory = async (categoryId: string, updates: Partial<Category>) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'update_category',
          data: { id: categoryId, ...updates }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh menu data to get latest updates
      await fetchMenu()
      
    } catch (err) {
      console.error('Error updating category:', err)
      throw err
    }
  }

  const createCategory = async (categoryData: Omit<Category, 'id'>) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'create_category',
          data: categoryData
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh menu data to get latest updates
      await fetchMenu()
      
    } catch (err) {
      console.error('Error creating category:', err)
      throw err
    }
  }

  const deleteCategory = async (categoryId: string) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'delete_category',
          data: { id: categoryId }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh menu data to get latest updates
      await fetchMenu()
      
    } catch (err) {
      console.error('Error deleting category:', err)
      throw err
    }
  }

  const toggleCategoryStatus = async (categoryId: string, isActive: boolean) => {
    try {
      const response = await fetch('/api/menu', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          action: 'toggle_category_status',
          data: { id: categoryId, isActive }
        })
      })

      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`)
      }

      // Refresh menu data to get latest updates
      await fetchMenu()
      
    } catch (err) {
      console.error('Error toggling category status:', err)
      throw err
    }
  }

  const getProductsByCategory = (categoryName: string) => {
    return menuData.products.filter(product => product.category === categoryName)
  }

  const getFeaturedProducts = () => {
    return menuData.products.filter(product => product.isFeatured)
  }

  const getActiveProducts = () => {
    return menuData.products.filter(product => product.isActive)
  }

  const getActiveCategories = () => {
    return menuData.categories.filter(category => category.isActive)
  }

  const searchProducts = (query: string) => {
    const lowercaseQuery = query.toLowerCase()
    return menuData.products.filter(product => 
      product.name.toLowerCase().includes(lowercaseQuery) ||
      product.description?.toLowerCase().includes(lowercaseQuery) ||
      product.category.toLowerCase().includes(lowercaseQuery) ||
      product.tags?.some(tag => tag.toLowerCase().includes(lowercaseQuery))
    )
  }

  // Auto-refresh menu data every 5 minutes
  useEffect(() => {
    // Only run on client side
    if (typeof window !== 'undefined') {
      fetchMenu()

      const interval = setInterval(() => {
        fetchMenu()
      }, 5 * 60 * 1000) // 5 minutes

      return () => clearInterval(interval)
    }
  }, [])

  return {
    menuData,
    loading,
    error,
    lastUpdated,
    fetchMenu,
    updateProduct,
    createProduct,
    deleteProduct,
    toggleProductStatus,
    toggleProductStatusByStock,
    updateCategory,
    createCategory,
    deleteCategory,
    toggleCategoryStatus,
    getProductsByCategory,
    getFeaturedProducts,
    getActiveProducts,
    getActiveCategories,
    searchProducts
  }
}