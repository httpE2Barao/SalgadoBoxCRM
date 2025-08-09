'use client'

import { useState, useEffect } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { AlertTriangle, Package, TrendingDown, TrendingUp, Settings } from 'lucide-react'
import { toast } from 'sonner'
import StockManagement from '@/components/stock/StockManagementSimple'

interface Product {
  id: string
  name: string
  price: number
  costPrice: number | null
  stock: number
  minimumStock: number
  category?: {
    name: string
  }
  isActive: boolean
}

export default function EstoquePage() {
  const [products, setProducts] = useState<Product[]>([])
  const [loading, setLoading] = useState(true)
  const [editingStock, setEditingStock] = useState<{ [key: string]: number }>({})
  const [editingMinimum, setEditingMinimum] = useState<{ [key: string]: number }>({})
  const [restaurantId, setRestaurantId] = useState('default')

  useEffect(() => {
    fetchProducts()
  }, [])

  const fetchProducts = async () => {
    try {
      const response = await fetch('/api/products')
      if (response.ok) {
        const data = await response.json()
        setProducts(data)
        
        // Initialize editing states
        const stockState: { [key: string]: number } = {}
        const minimumState: { [key: string]: number } = {}
        data.forEach((product: Product) => {
          stockState[product.id] = product.stock
          minimumState[product.id] = product.minimumStock
        })
        setEditingStock(stockState)
        setEditingMinimum(minimumState)
      }
    } catch (error) {
      toast.error('Erro ao carregar produtos')
    } finally {
      setLoading(false)
    }
  }

  const updateStock = async (productId: string, newStock: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ stock: newStock }),
      })

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, stock: newStock } : p
        ))
        toast.success('Estoque atualizado com sucesso!')
      } else {
        toast.error('Erro ao atualizar estoque')
      }
    } catch (error) {
      toast.error('Erro ao atualizar estoque')
    }
  }

  const updateMinimumStock = async (productId: string, newMinimum: number) => {
    try {
      const response = await fetch(`/api/products/${productId}/minimum-stock`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ minimumStock: newMinimum }),
      })

      if (response.ok) {
        setProducts(prev => prev.map(p => 
          p.id === productId ? { ...p, minimumStock: newMinimum } : p
        ))
        toast.success('Estoque mínimo atualizado com sucesso!')
      } else {
        toast.error('Erro ao atualizar estoque mínimo')
      }
    } catch (error) {
      toast.error('Erro ao atualizar estoque mínimo')
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.stock === 0) return { status: 'out', color: 'destructive', text: 'Esgotado' }
    if (product.stock <= product.minimumStock) return { status: 'low', color: 'warning', text: 'Estoque Baixo' }
    return { status: 'normal', color: 'default', text: 'Normal' }
  }

  const getLowStockProducts = () => {
    return products.filter(p => p.stock <= p.minimumStock && p.stock > 0)
  }

  const getOutOfStockProducts = () => {
    return products.filter(p => p.stock === 0)
  }

  const getTotalStock = () => {
    return products.reduce((sum, p) => sum + p.stock, 0)
  }

  const getLowStockCount = () => {
    return products.filter(p => p.stock <= p.minimumStock && p.stock > 0).length
  }

  const getOutOfStockCount = () => {
    return products.filter(p => p.stock === 0).length
  }

  const calculateProfit = (product: Product) => {
    if (product.costPrice === null || product.costPrice === 0) {
      return {
        amount: product.price,
        percentage: 100,
        hasCost: false
      }
    }
    const profitAmount = product.price - product.costPrice
    const profitPercentage = (profitAmount / product.costPrice) * 100
    return {
      amount: profitAmount,
      percentage: profitPercentage,
      hasCost: true
    }
  }

  const getTotalInventoryValue = () => {
    return products.reduce((sum, p) => sum + (p.price * p.stock), 0)
  }

  const getTotalCostValue = () => {
    return products.reduce((sum, p) => sum + ((p.costPrice || 0) * p.stock), 0)
  }

  const getTotalProfitValue = () => {
    return getTotalInventoryValue() - getTotalCostValue()
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-primary"></div>
      </div>
    )
  }

  return (
    <div className="max-w-7xl mx-auto space-y-6 p-4 md:p-8">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold">Gerenciamento de Estoque</h1>
          <p className="text-muted-foreground">
            Controle o estoque dos seus produtos em tempo real
          </p>
        </div>
        <Button onClick={fetchProducts} variant="outline">
          Atualizar
        </Button>
      </div>

      <Tabs defaultValue="overview" className="space-y-4">
        <TabsList>
          <TabsTrigger value="overview">Visão Geral</TabsTrigger>
          <TabsTrigger value="management">Entrada & Fabricação</TabsTrigger>
          <TabsTrigger value="products">Produtos</TabsTrigger>
        </TabsList>

        <TabsContent value="overview">
          <div className="space-y-6">
            {/* Cards de Resumo */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-5 gap-6">
              <Card className="p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Total de Produtos</CardTitle>
                  <Package className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">{products.length}</div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Estoque Total</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold">{getTotalStock()}</div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Valor Total Estoque</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-green-600">
                    R$ {getTotalInventoryValue().toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Custo Total Estoque</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-red-600">
                    R$ {getTotalCostValue().toFixed(2)}
                  </div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Lucro Potencial</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-blue-600">
                    R$ {getTotalProfitValue().toFixed(2)}
                  </div>
                </CardContent>
              </Card>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
              <Card className="p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Estoque Baixo</CardTitle>
                  <TrendingDown className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-orange-600">{getLowStockCount()}</div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Esgotados</CardTitle>
                  <AlertTriangle className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-red-600">{getOutOfStockCount()}</div>
                </CardContent>
              </Card>

              <Card className="p-6">
                <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-4">
                  <CardTitle className="text-sm font-medium">Margem Média</CardTitle>
                  <TrendingUp className="h-4 w-4 text-muted-foreground" />
                </CardHeader>
                <CardContent className="pt-0">
                  <div className="text-2xl font-bold text-blue-600">
                    {products.length > 0 ? 
                      ((products.reduce((sum, p) => {
                        const profit = calculateProfit(p)
                        return sum + (profit.hasCost ? profit.percentage : 0)
                      }, 0) / products.filter(p => p.costPrice !== null && p.costPrice > 0).length) || 0).toFixed(1) + '%'
                      : '0%'
                    }
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Alertas */}
            <div className="space-y-4">
              {getOutOfStockCount() > 0 && (
                <Alert className="border-red-200 bg-red-50">
                  <AlertTriangle className="h-4 w-4 text-red-600" />
                  <AlertDescription className="text-red-800">
                    Você tem {getOutOfStockCount()} produto(s) esgotado(s). É necessário reabastecer o estoque.
                  </AlertDescription>
                </Alert>
              )}

              {getLowStockCount() > 0 && (
                <Alert className="border-orange-200 bg-orange-50">
                  <AlertTriangle className="h-4 w-4 text-orange-600" />
                  <AlertDescription className="text-orange-800">
                    Você tem {getLowStockCount()} produto(s) com estoque baixo. Considere reabastecer.
                  </AlertDescription>
                </Alert>
              )}
            </div>
          </div>
        </TabsContent>

        <TabsContent value="management">
          <StockManagement 
            restaurantId={restaurantId} 
            products={products} 
            onStockUpdate={fetchProducts}
          />
        </TabsContent>

        <TabsContent value="products">
          <Card>
            <CardHeader>
              <CardTitle>Todos os Produtos</CardTitle>
              <CardDescription>
                Gerencie o estoque de todos os produtos
              </CardDescription>
            </CardHeader>
            <CardContent>
              <div className="rounded-md border">
                <Table>
                  <TableHeader>
                    <TableRow>
                      <TableHead>Produto</TableHead>
                      <TableHead>Categoria</TableHead>
                      <TableHead>Preço Venda</TableHead>
                      <TableHead>Custo Unitário</TableHead>
                      <TableHead>Lucro Unitário</TableHead>
                      <TableHead>Margem</TableHead>
                      <TableHead>Estoque Atual</TableHead>
                      <TableHead>Estoque Mínimo</TableHead>
                      <TableHead>Status</TableHead>
                      <TableHead>Ações</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {products.map((product) => {
                      const stockStatus = getStockStatus(product)
                      const profit = calculateProfit(product)
                      return (
                        <TableRow key={product.id}>
                          <TableCell className="font-medium">{product.name}</TableCell>
                          <TableCell>{product.category?.name}</TableCell>
                          <TableCell className="font-medium">R$ {product.price.toFixed(2)}</TableCell>
                          <TableCell>
                            {product.costPrice !== null && product.costPrice > 0 ? (
                              <span className="text-red-600">R$ {product.costPrice.toFixed(2)}</span>
                            ) : (
                              <span className="text-gray-400">-</span>
                            )}
                          </TableCell>
                          <TableCell>
                            <span className={profit.hasCost ? "text-green-600" : "text-gray-400"}>
                              R$ {profit.amount.toFixed(2)}
                            </span>
                          </TableCell>
                          <TableCell>
                            <span className={profit.hasCost ? "text-blue-600" : "text-gray-400"}>
                              {profit.hasCost ? profit.percentage.toFixed(1) + '%' : '-'}
                            </span>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={editingStock[product.id] || product.stock}
                                onChange={(e) => setEditingStock(prev => ({
                                  ...prev,
                                  [product.id]: parseInt(e.target.value) || 0
                                }))}
                                className="w-20"
                                min="0"
                              />
                              <Button
                                size="sm"
                                onClick={() => updateStock(product.id, editingStock[product.id])}
                                disabled={editingStock[product.id] === product.stock}
                              >
                                Salvar
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <div className="flex items-center space-x-2">
                              <Input
                                type="number"
                                value={editingMinimum[product.id] || product.minimumStock}
                                onChange={(e) => setEditingMinimum(prev => ({
                                  ...prev,
                                  [product.id]: parseInt(e.target.value) || 0
                                }))}
                                className="w-20"
                                min="0"
                              />
                              <Button
                                size="sm"
                                onClick={() => updateMinimumStock(product.id, editingMinimum[product.id])}
                                disabled={editingMinimum[product.id] === product.minimumStock}
                              >
                                Salvar
                              </Button>
                            </div>
                          </TableCell>
                          <TableCell>
                            <Badge variant={stockStatus.color as any}>
                              {stockStatus.text}
                            </Badge>
                          </TableCell>
                          <TableCell>
                            <div className="flex space-x-2">
                              <Button
                                size="sm"
                                variant="outline"
                                onClick={() => {
                                  // Abrir modal de movimentação rápida
                                  const newStock = prompt('Nova quantidade de estoque:', product.stock.toString())
                                  if (newStock !== null && !isNaN(parseInt(newStock))) {
                                    updateStock(product.id, parseInt(newStock))
                                  }
                                }}
                              >
                                <Settings className="h-4 w-4" />
                              </Button>
                            </div>
                          </TableCell>
                        </TableRow>
                      )
                    })}
                  </TableBody>
                </Table>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>
    </div>
  )
}