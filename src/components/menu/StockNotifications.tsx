"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { Alert, AlertDescription } from '@/components/ui/alert'
import { 
  AlertTriangle, 
  Package, 
  RefreshCw, 
  ExternalLink,
  TrendingDown,
  XCircle
} from 'lucide-react'
import { useMenu } from '@/hooks/use-menu'
import { toast } from 'sonner'

interface Product {
  id: string
  name: string
  stock: number
  minimumStock: number
  categoryName?: string
  isActive: boolean
}

interface StockNotificationsProps {
  onRefresh?: () => void
}

export default function StockNotifications({ onRefresh }: StockNotificationsProps) {
  const { menuData } = useMenu()
  const [lastChecked, setLastChecked] = useState<Date | null>(null)
  const [dismissedProducts, setDismissedProducts] = useState<Set<string>>(new Set())

  // Transform products to include stock information
  const products = menuData.products.map(product => ({
    id: product.id,
    name: product.name,
    stock: product.stock || 0,
    minimumStock: product.minimumStock || 0,
    categoryName: product.category,
    isActive: product.isActive
  }))

  const lowStockProducts = products.filter(p => 
    p.isActive && 
    p.stock > 0 && 
    p.stock <= p.minimumStock && 
    p.minimumStock > 0 &&
    !dismissedProducts.has(p.id)
  )

  const outOfStockProducts = products.filter(p => 
    p.isActive && 
    p.stock === 0 &&
    !dismissedProducts.has(p.id)
  )

  const totalIssues = lowStockProducts.length + outOfStockProducts.length

  const checkStock = () => {
    setLastChecked(new Date())
    onRefresh?.()
    
    if (totalIssues > 0) {
      toast.info(`Verificação concluída: ${totalIssues} produto(s) precisam de atenção.`)
    } else {
      toast.success('Todos os produtos com estoque normal!')
    }
  }

  const dismissProduct = (productId: string) => {
    setDismissedProducts(prev => new Set([...prev, productId]))
    toast.success('Notificação descartada')
  }

  const restoreAllNotifications = () => {
    setDismissedProducts(new Set())
    toast.success('Todas as notificações restauradas')
  }

  useEffect(() => {
    // Auto-check stock every 5 minutes
    const interval = setInterval(() => {
      checkStock()
    }, 5 * 60 * 1000)

    return () => clearInterval(interval)
  }, [products])

  useEffect(() => {
    // Initial check
    checkStock()
  }, [])

  if (totalIssues === 0) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5 text-green-600" />
            Status do Estoque
          </CardTitle>
          <CardDescription>
            Todos os produtos estão com estoque normal
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between">
            <div className="text-sm text-green-600">
              ✓ Nenhum produto precisa de atenção no momento
            </div>
            <Button variant="outline" size="sm" onClick={checkStock}>
              <RefreshCw className="h-4 w-4 mr-2" />
              Verificar
            </Button>
          </div>
          {lastChecked && (
            <div className="text-xs text-muted-foreground mt-2">
              Última verificação: {lastChecked.toLocaleTimeString('pt-BR')}
            </div>
          )}
        </CardContent>
      </Card>
    )
  }

  return (
    <div className="space-y-4">
      {/* Summary Card */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <AlertTriangle className="h-5 w-5 text-orange-600" />
            Alertas de Estoque
            <Badge variant="destructive" className="ml-auto">
              {totalIssues}
            </Badge>
          </CardTitle>
          <CardDescription>
            Produtos que precisam de atenção
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 gap-4 mb-4">
            <div className="text-center">
              <div className="text-2xl font-bold text-orange-600">{lowStockProducts.length}</div>
              <div className="text-sm text-muted-foreground">Estoque Baixo</div>
            </div>
            <div className="text-center">
              <div className="text-2xl font-bold text-red-600">{outOfStockProducts.length}</div>
              <div className="text-sm text-muted-foreground">Esgotados</div>
            </div>
          </div>
          
          <div className="flex items-center justify-between">
            <div className="text-sm text-muted-foreground">
              {lastChecked && `Última verificação: ${lastChecked.toLocaleTimeString('pt-BR')}`}
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={restoreAllNotifications}>
                Restaurar Notificações
              </Button>
              <Button variant="outline" size="sm" onClick={checkStock}>
                <RefreshCw className="h-4 w-4 mr-2" />
                Verificar Agora
              </Button>
              <Button size="sm" asChild>
                <a href="/estoque">
                  <ExternalLink className="h-4 w-4 mr-2" />
                  Gerenciar Estoque
                </a>
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Out of Stock Alerts */}
      {outOfStockProducts.length > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <XCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            <div className="space-y-2">
              <div className="font-medium">Produtos Esgotados ({outOfStockProducts.length})</div>
              <div className="grid gap-2">
                {outOfStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between bg-red-100 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="destructive" className="text-xs">
                        0 unidades
                      </Badge>
                      {product.categoryName && (
                        <Badge variant="outline" className="text-xs">
                          {product.categoryName}
                        </Badge>
                      )}
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissProduct(product.id)}
                      className="text-red-600 hover:text-red-700"
                    >
                      Descartar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}

      {/* Low Stock Alerts */}
      {lowStockProducts.length > 0 && (
        <Alert className="border-orange-200 bg-orange-50">
          <TrendingDown className="h-4 w-4 text-orange-600" />
          <AlertDescription className="text-orange-800">
            <div className="space-y-2">
              <div className="font-medium">Estoque Baixo ({lowStockProducts.length})</div>
              <div className="grid gap-2">
                {lowStockProducts.map((product) => (
                  <div key={product.id} className="flex items-center justify-between bg-orange-100 p-2 rounded">
                    <div className="flex items-center gap-2">
                      <span className="font-medium">{product.name}</span>
                      <Badge variant="outline" className="border-orange-500 text-orange-700 text-xs">
                        {product.stock} / {product.minimumStock}
                      </Badge>
                      {product.categoryName && (
                        <Badge variant="outline" className="text-xs">
                          {product.categoryName}
                        </Badge>
                      )}
                      <span className="text-xs text-orange-700">
                        Faltam {product.minimumStock - product.stock} unidades
                      </span>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => dismissProduct(product.id)}
                      className="text-orange-600 hover:text-orange-700"
                    >
                      Descartar
                    </Button>
                  </div>
                ))}
              </div>
            </div>
          </AlertDescription>
        </Alert>
      )}
    </div>
  )
}