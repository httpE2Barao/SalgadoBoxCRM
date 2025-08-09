"use client"

import { useState, useEffect } from 'react'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import { Label } from '@/components/ui/label'
import { Textarea } from '@/components/ui/textarea'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from '@/components/ui/table'
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle, DialogTrigger } from '@/components/ui/dialog'
import { Calendar } from '@/components/ui/calendar'
import { Popover, PopoverContent, PopoverTrigger } from '@/components/ui/popover'
import { CalendarIcon, Package, Plus, Minus, Settings, Factory, TrendingUp, AlertTriangle, Box, Truck } from 'lucide-react'
import { toast } from 'sonner'
import { cn } from '@/lib/utils'

// Função de formatação de data simples
function formatDate(date: Date | string, formatStr: string = 'dd/MM/yyyy'): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleDateString('pt-BR')
}

function formatDateTime(date: Date | string): string {
  const dateObj = typeof date === 'string' ? new Date(date) : date
  return dateObj.toLocaleString('pt-BR')
}

interface Product {
  id: string
  name: string
  stock: number
  minimumStock: number
  price: number
  costPrice?: number
  isActive: boolean
}

interface StockMovement {
  id: string
  type: 'ENTRY' | 'EXIT' | 'ADJUSTMENT'
  quantity: number
  notes?: string
  reference?: string
  createdAt: string
  product: Product
  staff?: {
    id: string
    name: string
  }
}

interface StockBatch {
  id: string
  batchNumber: string
  quantity: number
  unitCost?: number
  expirationDate?: string
  notes?: string
  createdAt: string
  product: Product
}

interface ProductionRecord {
  id: string
  quantity: number
  unitCost?: number
  notes?: string
  createdAt: string
  product: Product
  staff?: {
    id: string
    name: string
  }
}

interface StockManagementProps {
  restaurantId: string
  products: Product[]
  onStockUpdate?: () => void
}

export default function StockManagement({ restaurantId, products, onStockUpdate }: StockManagementProps) {
  const [selectedProduct, setSelectedProduct] = useState<string>('')
  const [movements, setMovements] = useState<StockMovement[]>([])
  const [batches, setBatches] = useState<StockBatch[]>([])
  const [productionRecords, setProductionRecords] = useState<ProductionRecord[]>([])
  const [isLoading, setIsLoading] = useState(false)
  const [isMovementDialogOpen, setIsMovementDialogOpen] = useState(false)
  const [isProductionDialogOpen, setIsProductionDialogOpen] = useState(false)
  const [isBatchDialogOpen, setIsBatchDialogOpen] = useState(false)
  
  const [movementForm, setMovementForm] = useState({
    type: 'ENTRY' as 'ENTRY' | 'EXIT' | 'ADJUSTMENT',
    quantity: '',
    notes: '',
    reference: '',
    date: new Date(),
  })
  
  const [productionForm, setProductionForm] = useState({
    quantity: '',
    unitCost: '',
    notes: '',
    date: new Date(),
  })
  
  const [batchForm, setBatchForm] = useState({
    batchNumber: '',
    quantity: '',
    unitCost: '',
    expirationDate: '',
    notes: '',
  })

  useEffect(() => {
    if (selectedProduct) {
      fetchStockData()
    }
  }, [selectedProduct, restaurantId])

  const fetchStockData = async () => {
    if (!selectedProduct) return

    setIsLoading(true)
    try {
      // Buscar movimentações
      const movementsResponse = await fetch(`/api/stock/movements?restaurantId=${restaurantId}&productId=${selectedProduct}`)
      if (movementsResponse.ok) {
        const movementsData = await movementsResponse.json()
        setMovements(movementsData)
      }

      // Buscar lotes
      const batchesResponse = await fetch(`/api/stock/batches?restaurantId=${restaurantId}&productId=${selectedProduct}`)
      if (batchesResponse.ok) {
        const batchesData = await batchesResponse.json()
        setBatches(batchesData)
      }

      // Buscar registros de produção
      const productionResponse = await fetch(`/api/stock/production?restaurantId=${restaurantId}&productId=${selectedProduct}`)
      if (productionResponse.ok) {
        const productionData = await productionResponse.json()
        setProductionRecords(productionData)
      }
    } catch (error) {
      console.error('Erro ao buscar dados de estoque:', error)
      toast.error('Erro ao carregar dados de estoque')
    } finally {
      setIsLoading(false)
    }
  }

  const handleStockMovement = async () => {
    if (!selectedProduct || !movementForm.quantity) {
      toast.error('Selecione um produto e informe a quantidade')
      return
    }

    try {
      const response = await fetch('/api/stock/movements', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          productId: selectedProduct,
          type: movementForm.type,
          quantity: parseInt(movementForm.quantity),
          notes: movementForm.notes,
          reference: movementForm.reference,
        }),
      })

      if (response.ok) {
        toast.success('Movimentação de estoque registrada com sucesso')
        setIsMovementDialogOpen(false)
        setMovementForm({
          type: 'ENTRY',
          quantity: '',
          notes: '',
          reference: '',
          date: new Date(),
        })
        fetchStockData()
        onStockUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao registrar movimentação')
      }
    } catch (error) {
      console.error('Erro ao registrar movimentação:', error)
      toast.error('Erro ao registrar movimentação')
    }
  }

  const handleProduction = async () => {
    if (!selectedProduct || !productionForm.quantity) {
      toast.error('Selecione um produto e informe a quantidade')
      return
    }

    try {
      const response = await fetch('/api/stock/production', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          productId: selectedProduct,
          quantity: parseInt(productionForm.quantity),
          unitCost: productionForm.unitCost ? parseFloat(productionForm.unitCost) : undefined,
          notes: productionForm.notes,
        }),
      })

      if (response.ok) {
        toast.success('Produção registrada com sucesso')
        setIsProductionDialogOpen(false)
        setProductionForm({
          quantity: '',
          unitCost: '',
          notes: '',
          date: new Date(),
        })
        fetchStockData()
        onStockUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao registrar produção')
      }
    } catch (error) {
      console.error('Erro ao registrar produção:', error)
      toast.error('Erro ao registrar produção')
    }
  }

  const handleBatch = async () => {
    if (!selectedProduct || !batchForm.batchNumber || !batchForm.quantity) {
      toast.error('Selecione um produto e informe o número do lote e quantidade')
      return
    }

    try {
      const response = await fetch('/api/stock/batches', {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          restaurantId,
          productId: selectedProduct,
          batchNumber: batchForm.batchNumber,
          quantity: parseInt(batchForm.quantity),
          unitCost: batchForm.unitCost ? parseFloat(batchForm.unitCost) : undefined,
          expirationDate: batchForm.expirationDate || undefined,
          notes: batchForm.notes,
        }),
      })

      if (response.ok) {
        toast.success('Lote registrado com sucesso')
        setIsBatchDialogOpen(false)
        setBatchForm({
          batchNumber: '',
          quantity: '',
          unitCost: '',
          expirationDate: '',
          notes: '',
        })
        fetchStockData()
        onStockUpdate?.()
      } else {
        const error = await response.json()
        toast.error(error.error || 'Erro ao registrar lote')
      }
    } catch (error) {
      console.error('Erro ao registrar lote:', error)
      toast.error('Erro ao registrar lote')
    }
  }

  const getStockStatus = (product: Product) => {
    if (product.stock <= 0) return { color: 'destructive', text: 'Sem estoque' }
    if (product.stock <= product.minimumStock) return { color: 'secondary', text: 'Estoque baixo' }
    return { color: 'default', text: 'Em estoque' }
  }

  const getMovementTypeText = (type: string) => {
    switch (type) {
      case 'ENTRY': return 'Entrada'
      case 'EXIT': return 'Saída'
      case 'ADJUSTMENT': return 'Ajuste'
      default: return type
    }
  }

  const getMovementTypeColor = (type: string) => {
    switch (type) {
      case 'ENTRY': return 'bg-green-100 text-green-800'
      case 'EXIT': return 'bg-red-100 text-red-800'
      case 'ADJUSTMENT': return 'bg-blue-100 text-blue-800'
      default: return 'bg-gray-100 text-gray-800'
    }
  }

  const selectedProductData = products.find(p => p.id === selectedProduct)
  const stockStatus = selectedProductData ? getStockStatus(selectedProductData) : null

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Package className="h-5 w-5" />
            Gerenciamento de Estoque
          </CardTitle>
          <CardDescription>
            Controle de entradas, saídas, lotes e produção de estoque
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
            <div className="space-y-2">
              <Label htmlFor="product-select">Produto</Label>
              <Select value={selectedProduct} onValueChange={setSelectedProduct}>
                <SelectTrigger>
                  <SelectValue placeholder="Selecione um produto" />
                </SelectTrigger>
                <SelectContent>
                  {products.map((product) => (
                    <SelectItem key={product.id} value={product.id}>
                      <div className="flex items-center justify-between w-full">
                        <span>{product.name}</span>
                        <Badge variant={getStockStatus(product).color as any} className="ml-2">
                          {product.stock}
                        </Badge>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {selectedProductData && (
              <>
                <div className="space-y-2">
                  <Label>Estoque Atual</Label>
                  <div className="flex items-center gap-2">
                    <Badge variant={stockStatus?.color as any} className="text-lg px-3 py-1">
                      {selectedProductData.stock} unidades
                    </Badge>
                    {stockStatus?.text === 'Estoque baixo' && (
                      <AlertTriangle className="h-4 w-4 text-yellow-500" />
                    )}
                  </div>
                </div>

                <div className="space-y-2">
                  <Label>Estoque Mínimo</Label>
                  <div className="text-sm text-muted-foreground">
                    {selectedProductData.minimumStock} unidades
                  </div>
                </div>
              </>
            )}
          </div>

          {selectedProductData && (
            <div className="flex flex-wrap gap-2 mb-4">
              <Dialog open={isMovementDialogOpen} onOpenChange={setIsMovementDialogOpen}>
                <DialogTrigger asChild>
                  <Button>
                    <Plus className="h-4 w-4 mr-2" />
                    Movimentar Estoque
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Movimentar Estoque</DialogTitle>
                    <DialogDescription>
                      Registrar entrada, saída ou ajuste de estoque para {selectedProductData.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="movement-type">Tipo de Movimentação</Label>
                      <Select
                        value={movementForm.type}
                        onValueChange={(value: any) => setMovementForm(prev => ({ ...prev, type: value }))}
                      >
                        <SelectTrigger>
                          <SelectValue />
                        </SelectTrigger>
                        <SelectContent>
                          <SelectItem value="ENTRY">Entrada</SelectItem>
                          <SelectItem value="EXIT">Saída</SelectItem>
                          <SelectItem value="ADJUSTMENT">Ajuste</SelectItem>
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="quantity">Quantidade</Label>
                      <Input
                        id="quantity"
                        type="number"
                        value={movementForm.quantity}
                        onChange={(e) => setMovementForm(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="Quantidade"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="reference">Referência (opcional)</Label>
                      <Input
                        id="reference"
                        value={movementForm.reference}
                        onChange={(e) => setMovementForm(prev => ({ ...prev, reference: e.target.value }))}
                        placeholder="Nota fiscal, pedido, etc."
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="notes">Observações (opcional)</Label>
                      <Textarea
                        id="notes"
                        value={movementForm.notes}
                        onChange={(e) => setMovementForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Observações sobre a movimentação"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsMovementDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleStockMovement}>
                      Registrar Movimentação
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isProductionDialogOpen} onOpenChange={setIsProductionDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Factory className="h-4 w-4 mr-2" />
                    Registrar Produção
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Registrar Produção</DialogTitle>
                    <DialogDescription>
                      Registrar produção de {selectedProductData.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="production-quantity">Quantidade Produzida</Label>
                      <Input
                        id="production-quantity"
                        type="number"
                        value={productionForm.quantity}
                        onChange={(e) => setProductionForm(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="Quantidade produzida"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="unit-cost">Custo Unitário (opcional)</Label>
                      <Input
                        id="unit-cost"
                        type="number"
                        step="0.01"
                        value={productionForm.unitCost}
                        onChange={(e) => setProductionForm(prev => ({ ...prev, unitCost: e.target.value }))}
                        placeholder="Custo por unidade"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="production-notes">Observações (opcional)</Label>
                      <Textarea
                        id="production-notes"
                        value={productionForm.notes}
                        onChange={(e) => setProductionForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Observações sobre a produção"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsProductionDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleProduction}>
                      Registrar Produção
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>

              <Dialog open={isBatchDialogOpen} onOpenChange={setIsBatchDialogOpen}>
                <DialogTrigger asChild>
                  <Button variant="outline">
                    <Box className="h-4 w-4 mr-2" />
                    Adicionar Lote
                  </Button>
                </DialogTrigger>
                <DialogContent>
                  <DialogHeader>
                    <DialogTitle>Adicionar Lote</DialogTitle>
                    <DialogDescription>
                      Registrar novo lote para {selectedProductData.name}
                    </DialogDescription>
                  </DialogHeader>
                  <div className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="batch-number">Número do Lote</Label>
                      <Input
                        id="batch-number"
                        value={batchForm.batchNumber}
                        onChange={(e) => setBatchForm(prev => ({ ...prev, batchNumber: e.target.value }))}
                        placeholder="Número do lote"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batch-quantity">Quantidade</Label>
                      <Input
                        id="batch-quantity"
                        type="number"
                        value={batchForm.quantity}
                        onChange={(e) => setBatchForm(prev => ({ ...prev, quantity: e.target.value }))}
                        placeholder="Quantidade no lote"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batch-unit-cost">Custo Unitário (opcional)</Label>
                      <Input
                        id="batch-unit-cost"
                        type="number"
                        step="0.01"
                        value={batchForm.unitCost}
                        onChange={(e) => setBatchForm(prev => ({ ...prev, unitCost: e.target.value }))}
                        placeholder="Custo por unidade"
                      />
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="expiration-date">Data de Validade (opcional)</Label>
                      <Popover>
                        <PopoverTrigger asChild>
                          <Button
                            variant="outline"
                            className={cn(
                              "w-full justify-start text-left font-normal",
                              !batchForm.expirationDate && "text-muted-foreground"
                            )}
                          >
                            <CalendarIcon className="mr-2 h-4 w-4" />
                            {batchForm.expirationDate ? (
                              formatDate(new Date(batchForm.expirationDate))
                            ) : (
                              <span>Selecione uma data</span>
                            )}
                          </Button>
                        </PopoverTrigger>
                        <PopoverContent className="w-auto p-0">
                          <Calendar
                            mode="single"
                            selected={batchForm.expirationDate ? new Date(batchForm.expirationDate) : undefined}
                            onSelect={(date) => setBatchForm(prev => ({ ...prev, expirationDate: date?.toISOString() }))}
                            initialFocus
                          />
                        </PopoverContent>
                      </Popover>
                    </div>

                    <div className="space-y-2">
                      <Label htmlFor="batch-notes">Observações (opcional)</Label>
                      <Textarea
                        id="batch-notes"
                        value={batchForm.notes}
                        onChange={(e) => setBatchForm(prev => ({ ...prev, notes: e.target.value }))}
                        placeholder="Observações sobre o lote"
                      />
                    </div>
                  </div>
                  <DialogFooter>
                    <Button variant="outline" onClick={() => setIsBatchDialogOpen(false)}>
                      Cancelar
                    </Button>
                    <Button onClick={handleBatch}>
                      Registrar Lote
                    </Button>
                  </DialogFooter>
                </DialogContent>
              </Dialog>
            </div>
          )}
        </CardContent>
      </Card>

      {selectedProductData && (
        <Tabs defaultValue="movements" className="space-y-4">
          <TabsList>
            <TabsTrigger value="movements">Movimentações</TabsTrigger>
            <TabsTrigger value="batches">Lotes</TabsTrigger>
            <TabsTrigger value="production">Produção</TabsTrigger>
          </TabsList>

          <TabsContent value="movements" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <TrendingUp className="h-5 w-5" />
                  Histórico de Movimentações
                </CardTitle>
                <CardDescription>
                  Todas as movimentações de estoque para {selectedProductData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">Carregando...</div>
                ) : movements.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Tipo</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Referência</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead>Responsável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {movements.map((movement) => (
                        <TableRow key={movement.id}>
                          <TableCell>
                            {formatDateTime(new Date(movement.createdAt))}
                          </TableCell>
                          <TableCell>
                            <Badge className={getMovementTypeColor(movement.type)}>
                              {getMovementTypeText(movement.type)}
                            </Badge>
                          </TableCell>
                          <TableCell className={movement.type === 'ENTRY' ? 'text-green-600' : 'text-red-600'}>
                            {movement.type === 'ENTRY' ? '+' : movement.type === 'EXIT' ? '-' : ''}
                            {movement.quantity}
                          </TableCell>
                          <TableCell>{movement.reference || '-'}</TableCell>
                          <TableCell>{movement.notes || '-'}</TableCell>
                          <TableCell>{movement.staff?.name || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhuma movimentação registrada para este produto
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="batches" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Box className="h-5 w-5" />
                  Lotes do Produto
                </CardTitle>
                <CardDescription>
                  Todos os lotes registrados para {selectedProductData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">Carregando...</div>
                ) : batches.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Lote</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Custo Unitário</TableHead>
                        <TableHead>Data de Validade</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead>Data de Registro</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {batches.map((batch) => (
                        <TableRow key={batch.id}>
                          <TableCell className="font-medium">{batch.batchNumber}</TableCell>
                          <TableCell>{batch.quantity}</TableCell>
                          <TableCell>
                            {batch.unitCost ? `R$ ${batch.unitCost.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>
                            {batch.expirationDate 
                              ? formatDate(new Date(batch.expirationDate))
                              : '-'}
                          </TableCell>
                          <TableCell>{batch.notes || '-'}</TableCell>
                          <TableCell>
                            {formatDate(new Date(batch.createdAt))}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum lote registrado para este produto
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>

          <TabsContent value="production" className="space-y-4">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Factory className="h-5 w-5" />
                  Registros de Produção
                </CardTitle>
                <CardDescription>
                  Todos os registros de produção para {selectedProductData.name}
                </CardDescription>
              </CardHeader>
              <CardContent>
                {isLoading ? (
                  <div className="flex justify-center py-8">Carregando...</div>
                ) : productionRecords.length > 0 ? (
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead>Data</TableHead>
                        <TableHead>Quantidade</TableHead>
                        <TableHead>Custo Unitário</TableHead>
                        <TableHead>Observações</TableHead>
                        <TableHead>Responsável</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {productionRecords.map((record) => (
                        <TableRow key={record.id}>
                          <TableCell>
                            {formatDateTime(new Date(record.createdAt))}
                          </TableCell>
                          <TableCell className="text-green-600">+{record.quantity}</TableCell>
                          <TableCell>
                            {record.unitCost ? `R$ ${record.unitCost.toFixed(2)}` : '-'}
                          </TableCell>
                          <TableCell>{record.notes || '-'}</TableCell>
                          <TableCell>{record.staff?.name || '-'}</TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                ) : (
                  <div className="text-center py-8 text-muted-foreground">
                    Nenhum registro de produção para este produto
                  </div>
                )}
              </CardContent>
            </Card>
          </TabsContent>
        </Tabs>
      )}
    </div>
  )
}