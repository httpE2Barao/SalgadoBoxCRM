import { db } from './db'
import MenuCache from './menu-cache'

interface MenuData {
  products: any[]
  categories: any[]
  combos: any[]
}

class MenuService {
  private cache: MenuCache

  constructor() {
    this.cache = MenuCache.getInstance()
  }

  async getMenu(options?: { 
    category?: string; 
    active?: boolean;
    includeInactive?: boolean;
    forceRefresh?: boolean;
  }): Promise<MenuData> {
    try {
      // If force refresh is requested, invalidate cache first
      if (options?.forceRefresh) {
        await this.cache.invalidate()
      }

      // Try to get from cache first
      if (!options?.forceRefresh) {
        const cachedData = await this.cache.load()
        if (cachedData && this.cache.isCacheValid()) {
          return this.filterMenuData(cachedData, options)
        }
      }

      // Fetch from database
      const data = await this.fetchFromDatabase(options)
      
      // Save to cache
      await this.cache.save(data.products, data.categories, data.combos)
      
      return this.filterMenuData(data, options)
    } catch (error) {
      console.error('Error getting menu:', error)
      
      // Fallback to cache if available
      const cachedData = await this.cache.load()
      if (cachedData) {
        return this.filterMenuData(cachedData, options)
      }
      
      throw error
    }
  }

  private async fetchFromDatabase(options?: { category?: string; active?: boolean }): Promise<MenuData> {
    // Build where clause for products
    const productWhere: any = {}
    if (options?.active !== undefined) {
      productWhere.isActive = options.active
    }

    // Build where clause for categories
    const categoryWhere: any = { isActive: true }

    // Build where clause for combos
    const comboWhere: any = {}
    if (options?.active !== undefined) {
      comboWhere.isActive = options.active
    }

    // Fetch products with their categories
    const products = await db.product.findMany({
      where: productWhere,
      include: {
        category: true
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })

    // Fetch categories
    const categories = await db.category.findMany({
      where: categoryWhere,
      orderBy: {
        displayOrder: 'asc'
      }
    })

    // Fetch combos with their items
    const combos = await db.combo.findMany({
      where: comboWhere,
      include: {
        comboItems: {
          include: {
            product: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        }
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })

    // Transform products and check stock availability
    const transformedProducts = products.map(product => ({
      id: product.id,
      name: product.name,
      description: product.description,
      price: product.price,
      costPrice: product.costPrice,
      category: product.category?.name,
      categoryId: product.category?.id,
      image: product.image,
      isFeatured: product.isFeatured,
      tags: product.tags,
      nutritionalInfo: product.nutritionalInfo,
      ingredients: product.ingredients,
      allergens: product.allergens,
      preparationTime: product.preparationTime,
      spicyLevel: product.spicyLevel,
      isVegetarian: product.isVegetarian,
      isVegan: product.isVegan,
      isGlutenFree: product.isGlutenFree,
      isActive: product.isActive,
      isAvailable: product.isAvailable && product.stock > 0, // Integrate stock with availability
      displayOrder: product.displayOrder,
      stock: product.stock,
      minimumStock: product.minimumStock
    }))

    const transformedCategories = categories.map(category => ({
      id: category.id,
      name: category.name,
      description: category.description,
      icon: category.icon,
      color: category.color,
      isActive: category.isActive,
      displayOrder: category.displayOrder,
      image: category.image
    }))

    // Transform combos and check availability of component items
    const transformedCombos = combos.map(combo => {
      const isAvailable = combo.comboItems.every(item => 
        item.product.isActive && 
        item.product.isAvailable && 
        item.product.stock >= item.quantity
      )

      return {
        id: combo.id,
        name: combo.name,
        description: combo.description,
        price: combo.price,
        originalPrice: combo.originalPrice,
        image: combo.image,
        isActive: combo.isActive,
        isFeatured: combo.isFeatured,
        preparationTime: combo.preparationTime,
        displayOrder: combo.displayOrder,
        isAvailable,
        comboItems: combo.comboItems.map(item => ({
          id: item.id,
          productId: item.productId,
          productName: item.product.name,
          quantity: item.quantity,
          isOptional: item.isOptional,
          displayOrder: item.displayOrder,
          productStock: item.product.stock,
          isItemAvailable: item.product.isActive && item.product.isAvailable && item.product.stock >= item.quantity
        }))
      }
    })

    return {
      products: transformedProducts,
      categories: transformedCategories,
      combos: transformedCombos
    }
  }

  private filterMenuData(data: MenuData, options?: { category?: string; active?: boolean }): MenuData {
    let filteredProducts = data.products
    let filteredCombos = data.combos

    // Filter by category
    if (options?.category && options.category !== 'Todos') {
      filteredProducts = filteredProducts.filter(p => p.category === options.category)
    }

    // Filter by active status (only if active is explicitly set)
    if (options?.active !== undefined) {
      filteredProducts = filteredProducts.filter(p => p.isActive === options.active)
      filteredCombos = filteredCombos.filter(c => c.isActive === options.active)
    }

    return {
      products: filteredProducts,
      categories: data.categories,
      combos: filteredCombos
    }
  }

  async updateProduct(productId: string, updates: any): Promise<any> {
    try {
      // Remove fields that shouldn't be updated
      const { id, category, categoryName, ...safeUpdates } = updates
      
      // If updating stock, check if it affects availability
      if (updates.stock !== undefined) {
        const currentProduct = await db.product.findUnique({
          where: { id: productId }
        })
        
        if (currentProduct) {
          const newStock = updates.stock
          const isAvailable = newStock > 0 && (updates.isAvailable !== false)
          
          // Automatically update availability based on stock
          safeUpdates.isAvailable = isAvailable
        }
      }
      
      const product = await db.product.update({
        where: { id: productId },
        data: safeUpdates,
        include: {
          category: true
        }
      })

      // Invalidate cache
      await this.cache.invalidate()

      return product
    } catch (error) {
      console.error('Error updating product:', error)
      throw error
    }
  }

  async updateCategory(categoryId: string, updates: any): Promise<boolean> {
    try {
      const category = await db.category.update({
        where: { id: categoryId },
        data: updates
      })

      // Invalidate cache
      await this.cache.invalidate()

      return true
    } catch (error) {
      console.error('Error updating category:', error)
      return false
    }
  }

  async deleteProduct(productId: string): Promise<boolean> {
    try {
      await db.product.delete({
        where: { id: productId }
      })

      // Invalidate cache
      await this.cache.invalidate()

      return true
    } catch (error) {
      console.error('Error deleting product:', error)
      return false
    }
  }

  async deleteCategory(categoryId: string): Promise<boolean> {
    try {
      // Check if category has products
      const productsCount = await db.product.count({
        where: { categoryId }
      })

      if (productsCount > 0) {
        throw new Error('Cannot delete category with products')
      }

      await db.category.delete({
        where: { id: categoryId }
      })

      // Invalidate cache
      await this.cache.invalidate()

      return true
    } catch (error) {
      console.error('Error deleting category:', error)
      return false
    }
  }

  async createProduct(data: any): Promise<any> {
    try {
      const product = await db.product.create({
        data: {
          name: data.name,
          description: data.description,
          price: data.price,
          costPrice: data.costPrice,
          categoryId: data.categoryId,
          image: data.image,
          isFeatured: data.isFeatured || false,
          tags: data.tags || [],
          nutritionalInfo: data.nutritionalInfo,
          ingredients: data.ingredients,
          allergens: data.allergens,
          preparationTime: data.preparationTime,
          spicyLevel: data.spicyLevel,
          isVegetarian: data.isVegetarian || false,
          isVegan: data.isVegan || false,
          isGlutenFree: data.isGlutenFree || false,
          isActive: data.isActive !== false,
          displayOrder: data.displayOrder || 0,
          restaurantId: data.restaurantId || 'default'
        },
        include: {
          category: true
        }
      })

      // Invalidate cache
      await this.cache.invalidate()

      return product
    } catch (error) {
      console.error('Error creating product:', error)
      throw error
    }
  }

  async createCategory(data: any): Promise<any> {
    try {
      const category = await db.category.create({
        data: {
          name: data.name,
          description: data.description,
          icon: data.icon,
          color: data.color,
          isActive: data.isActive !== false,
          displayOrder: data.displayOrder || 0,
          restaurantId: data.restaurantId || 'default'
        }
      })

      // Invalidate cache
      await this.cache.invalidate()

      return category
    } catch (error) {
      console.error('Error creating category:', error)
      throw error
    }
  }
}

export default MenuService