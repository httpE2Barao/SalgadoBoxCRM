"use client"

import { useState, useEffect } from 'react'
import { Dialog, DialogContent, DialogDescription, DialogFooter, DialogHeader, DialogTitle } from '@/components/ui/dialog'
import { Button } from '@/components/ui/button'
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select'
import { Badge } from '@/components/ui/badge'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { 
  Printer, 
  Bluetooth, 
  Usb, 
  Monitor, 
  CheckCircle, 
  AlertCircle,
  Loader2
} from 'lucide-react'
import PrintService from '@/lib/print-service'
import { toast } from 'sonner'

interface Order {
  id: string
  orderNumber: string
  status: 'PENDING' | 'CONFIRMED' | 'PREPARING' | 'READY' | 'OUT_FOR_DELIVERY' | 'DELIVERED' | 'CANCELLED' | 'REFUNDED'
  type: 'DELIVERY' | 'TAKEAWAY' | 'DINE_IN'
  customerName: string
  customerPhone: string
  customerEmail?: string
  deliveryAddress?: {
    street: string
    number: string
    neighborhood: string
    city: string
    state: string
    zipCode: string
    complement?: string
  }
  subtotal: number
  deliveryFee: number
  discount: number
  tax: number
  total: number
  paymentMethod?: string
  paymentStatus: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED' | 'PARTIALLY_REFUNDED'
  notes?: string
  estimatedTime?: number
  preparationTime?: number
  deliveryTime?: number
  source?: string
  couponCode?: string
  createdAt: string
  updatedAt: string
  completedAt?: string
  items: any[]
}

interface PrintDialogProps {
  order: Order | null
  isOpen: boolean
  onClose: () => void
}

interface PrinterOption {
  id: string
  name: string
  type: 'bluetooth' | 'usb' | 'default'
  icon: React.ReactNode
  status: 'available' | 'unavailable' | 'connecting'
}

export default function PrintDialog({ order, isOpen, onClose }: PrintDialogProps) {
  const [selectedPrinter, setSelectedPrinter] = useState<string>('default')
  const [printType, setPrintType] = useState<'thermal' | 'full'>('thermal')
  const [availablePrinters, setAvailablePrinters] = useState<PrinterOption[]>([])
  const [isPrinting, setIsPrinting] = useState(false)
  const [isDetectingPrinters, setIsDetectingPrinters] = useState(false)
  
  const printService = new PrintService()

  useEffect(() => {
    if (isOpen) {
      detectPrinters()
    }
  }, [isOpen])

  const detectPrinters = async () => {
    setIsDetectingPrinters(true)
    try {
      const printers = await printService.getAvailablePrinters()
      
      const printerOptions: PrinterOption[] = [
        {
          id: 'default',
          name: 'Impressora Padrão',
          type: 'default',
          icon: <Monitor className="h-4 w-4" />,
          status: 'available'
        }
      ]

      if (printService.isBluetoothAvailable()) {
        printerOptions.push({
          id: 'bluetooth',
          name: 'Impressora Bluetooth',
          type: 'bluetooth',
          icon: <Bluetooth className="h-4 w-4" />,
          status: 'available'
        })
      }

      if (printService.isUSBAvailable()) {
        printerOptions.push({
          id: 'usb',
          name: 'Impressora USB',
          type: 'usb',
          icon: <Usb className="h-4 w-4" />,
          status: 'available'
        })
      }

      setAvailablePrinters(printerOptions)
    } catch (error) {
      console.error('Erro ao detectar impressoras:', error)
      toast.error('Erro ao detectar impressoras disponíveis')
    } finally {
      setIsDetectingPrinters(false)
    }
  }

  const handlePrint = async () => {
    if (!order) return

    setIsPrinting(true)
    try {
      if (selectedPrinter === 'default') {
        await printService.printOrder(order, printType)
        toast.success('Comprovante enviado para impressão!')
      } else if (selectedPrinter === 'bluetooth') {
        // Simulação de impressão Bluetooth
        await new Promise(resolve => setTimeout(resolve, 1000))
        await printService.printOrderAsImage(order)
        toast.success('Comprovante enviado para impressora Bluetooth!')
      } else if (selectedPrinter === 'usb') {
        // Simulação de impressão USB
        await new Promise(resolve => setTimeout(resolve, 1000))
        await printService.printOrderAsImage(order)
        toast.success('Comprovante enviado para impressora USB!')
      }
      
      onClose()
    } catch (error) {
      console.error('Erro ao imprimir:', error)
      toast.error('Erro ao imprimir comprovante. Tente novamente.')
    } finally {
      setIsPrinting(false)
    }
  }

  const getPrinterStatusIcon = (status: PrinterOption['status']) => {
    switch (status) {
      case 'available':
        return <CheckCircle className="h-4 w-4 text-green-500" />
      case 'unavailable':
        return <AlertCircle className="h-4 w-4 text-red-500" />
      case 'connecting':
        return <Loader2 className="h-4 w-4 text-yellow-500 animate-spin" />
      default:
        return <AlertCircle className="h-4 w-4 text-gray-500" />
    }
  }

  const getPrinterStatusText = (status: PrinterOption['status']) => {
    switch (status) {
      case 'available':
        return 'Disponível'
      case 'unavailable':
        return 'Indisponível'
      case 'connecting':
        return 'Conectando...'
      default:
        return 'Desconhecido'
    }
  }

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center gap-2">
            <Printer className="h-5 w-5" />
            Imprimir Comprovante
          </DialogTitle>
          <DialogDescription>
            Selecione a impressora e o formato para imprimir o comprovante do pedido {order?.orderNumber}
          </DialogDescription>
        </DialogHeader>

        <div className="space-y-6">
          {/* Order Info */}
          {order && (
            <Card>
              <CardHeader className="pb-3">
                <CardTitle className="text-sm">Pedido {order.orderNumber}</CardTitle>
              </CardHeader>
              <CardContent className="pt-0">
                <div className="space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span>Cliente:</span>
                    <span className="font-medium">{order.customerName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Total:</span>
                    <span className="font-medium">R$ {order.total.toFixed(2)}</span>
                  </div>
                  <div className="flex justify-between">
                    <span>Status:</span>
                    <Badge variant="outline">{order.status}</Badge>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Printer Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Impressora</label>
            <div className="space-y-2">
              {isDetectingPrinters ? (
                <div className="flex items-center justify-center p-4 border rounded-lg">
                  <Loader2 className="h-4 w-4 animate-spin mr-2" />
                  <span className="text-sm">Detectando impressoras...</span>
                </div>
              ) : (
                availablePrinters.map((printer) => (
                  <div
                    key={printer.id}
                    className={`flex items-center justify-between p-3 border rounded-lg cursor-pointer transition-colors ${
                      selectedPrinter === printer.id
                        ? 'border-primary bg-primary/5'
                        : 'border-border hover:border-primary/50'
                    }`}
                    onClick={() => setSelectedPrinter(printer.id)}
                  >
                    <div className="flex items-center gap-3">
                      {printer.icon}
                      <div>
                        <p className="font-medium text-sm">{printer.name}</p>
                        <p className="text-xs text-muted-foreground">
                          {getPrinterStatusText(printer.status)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-2">
                      {getPrinterStatusIcon(printer.status)}
                      <input
                        type="radio"
                        name="printer"
                        checked={selectedPrinter === printer.id}
                        onChange={() => setSelectedPrinter(printer.id)}
                        className="text-primary"
                      />
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>

          {/* Print Type Selection */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Formato de Impressão</label>
            <Select value={printType} onValueChange={(value: 'thermal' | 'full') => setPrintType(value)}>
              <SelectTrigger>
                <SelectValue placeholder="Selecione o formato" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="thermal">
                  <div className="flex items-center gap-2">
                    <Printer className="h-4 w-4" />
                    <span>Térmica (Compacto)</span>
                  </div>
                </SelectItem>
                <SelectItem value="full">
                  <div className="flex items-center gap-2">
                    <Monitor className="h-4 w-4" />
                    <span>Completo (A4)</span>
                  </div>
                </SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Print Preview */}
          <div className="space-y-3">
            <label className="text-sm font-medium">Visualização</label>
            <div className="p-4 border rounded-lg bg-muted/50">
              <div className="text-xs font-mono text-center">
                {order && printService.generateThermalPrintContent(order).substring(0, 200)}...
              </div>
            </div>
          </div>
        </div>

        <DialogFooter>
          <Button variant="outline" onClick={onClose} disabled={isPrinting}>
            Cancelar
          </Button>
          <Button onClick={handlePrint} disabled={isPrinting || isDetectingPrinters}>
            {isPrinting ? (
              <>
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                Imprimindo...
              </>
            ) : (
              <>
                <Printer className="mr-2 h-4 w-4" />
                Imprimir
              </>
            )}
          </Button>
        </DialogFooter>
      </DialogContent>
    </Dialog>
  )
}