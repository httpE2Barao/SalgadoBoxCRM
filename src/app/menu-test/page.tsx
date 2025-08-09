"use client"

import { useState, useEffect } from 'react'

interface Product {
  id: string
  name: string
  description?: string
  price: number
  category: string
  image?: string
  featured: boolean
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
}

export default function MenuTest() {
  const [menuData, setMenuData] = useState<MenuData>({ products: [], categories: [] })
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  useEffect(() => {
    const fetchMenu = async () => {
      try {
        setLoading(true)
        setError(null)
        
        console.log('Fetching menu data...')
        const response = await fetch('/api/menu')
        
        if (!response.ok) {
          throw new Error(`HTTP error! status: ${response.status}`)
        }
        
        const data = await response.json()
        console.log('Received menu data:', data)
        setMenuData(data)
      } catch (err) {
        console.error('Error fetching menu:', err)
        setError(err instanceof Error ? err.message : 'Failed to fetch menu')
      } finally {
        setLoading(false)
      }
    }

    fetchMenu()
  }, [])

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

  if (error) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center">
          <p className="text-red-600">Erro: {error}</p>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
        <div>
          <h1 className="text-3xl font-bold tracking-tight">Teste de Cardápio</h1>
          <p className="text-muted-foreground">
            Teste simples para verificar se os dados estão carregando
          </p>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Produtos ({menuData.products.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuData.products.map((product) => (
              <div key={product.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{product.name}</h3>
                <p className="text-sm text-gray-600">{product.description}</p>
                <p className="text-lg font-bold">R$ {product.price.toFixed(2)}</p>
                <p className="text-sm">Categoria: {product.category}</p>
                <div className="flex gap-2 mt-2">
                  <span className={`px-2 py-1 text-xs rounded ${
                    product.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    product.isAvailable ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {product.isAvailable ? 'Disponível' : 'Indisponível'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>

        <div>
          <h2 className="text-xl font-semibold mb-4">Categorias ({menuData.categories.length})</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
            {menuData.categories.map((category) => (
              <div key={category.id} className="border rounded-lg p-4">
                <h3 className="font-semibold">{category.name}</h3>
                <p className="text-sm text-gray-600">{category.description}</p>
                <div className="flex items-center gap-2 mt-2">
                  <span className="text-lg">{category.icon}</span>
                  <span className={`px-2 py-1 text-xs rounded ${
                    category.isActive ? 'bg-green-100 text-green-800' : 'bg-red-100 text-red-800'
                  }`}>
                    {category.isActive ? 'Ativo' : 'Inativo'}
                  </span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </div>
  )
}