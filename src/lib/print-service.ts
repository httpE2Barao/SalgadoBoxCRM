import html2canvas from 'html2canvas'

interface OrderItem {
  id: string
  productId: string
  productName: string
  quantity: number
  price: number
  notes?: string
  options: OrderItemOption[]
}

interface OrderItemOption {
  id: string
  name: string
  price: number
}

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
  items: OrderItem[]
}

class PrintService {
  private formatDateTime(dateString: string): string {
    const date = new Date(dateString)
    return date.toLocaleString('pt-BR', {
      day: '2-digit',
      month: '2-digit',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit'
    })
  }

  private formatAddress(address?: Order['deliveryAddress']): string {
    if (!address) return ''
    return `${address.street}, ${address.number}${address.complement ? `, ${address.complement}` : ''}\n${address.neighborhood}, ${address.city} - ${address.state}\nCEP: ${address.zipCode}`
  }

  private getStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pendente',
      'CONFIRMED': 'Confirmado',
      'PREPARING': 'Preparando',
      'READY': 'Pronto',
      'OUT_FOR_DELIVERY': 'Saiu para Entrega',
      'DELIVERED': 'Entregue',
      'CANCELLED': 'Cancelado',
      'REFUNDED': 'Reembolsado'
    }
    return statusMap[status] || status
  }

  private getTypeText(type: string): string {
    const typeMap: Record<string, string> = {
      'DELIVERY': 'Delivery',
      'TAKEAWAY': 'Retirada',
      'DINE_IN': 'Local'
    }
    return typeMap[type] || type
  }

  private getPaymentStatusText(status: string): string {
    const statusMap: Record<string, string> = {
      'PENDING': 'Pendente',
      'PAID': 'Pago',
      'FAILED': 'Falhou',
      'REFUNDED': 'Reembolsado',
      'PARTIALLY_REFUNDED': 'Reembolsado Parcial'
    }
    return statusMap[status] || status
  }

  generatePrintContent(order: Order): string {
    const itemsHtml = order.items.map(item => {
      const optionsHtml = item.options.length > 0 
        ? item.options.map(option => `  + ${option.name} (R$ ${option.price.toFixed(2)})`).join('\n')
        : ''
      
      const notesHtml = item.notes ? `  Obs: ${item.notes}` : ''
      
      return `
${item.quantity}x ${item.productName} - R$ ${(item.quantity * item.price).toFixed(2)}
${optionsHtml}
${notesHtml}
      `.trim()
    }).join('\n')

    const addressHtml = order.type === 'DELIVERY' && order.deliveryAddress 
      ? `\nENDEREÇO DE ENTREGA:\n${this.formatAddress(order.deliveryAddress)}`
      : ''

    const discountHtml = order.discount > 0 
      ? `\nDESCONTO: -R$ ${order.discount.toFixed(2)}`
      : ''

    const deliveryFeeHtml = order.deliveryFee > 0 
      ? `\nTAXA DE ENTREGA: R$ ${order.deliveryFee.toFixed(2)}`
      : ''

    const notesHtml = order.notes 
      ? `\nOBSERVAÇÕES:\n${order.notes}`
      : ''

    return `
**************************************************
*               SALGADO BOX                    *
*               COMPROVANTE                   *
**************************************************

PEDIDO: ${order.orderNumber}
DATA: ${this.formatDateTime(order.createdAt)}
STATUS: ${this.getStatusText(order.status)}
TIPO: ${this.getTypeText(order.type)}

CLIENTE: ${order.customerName}
TELEFONE: ${order.customerPhone}
${order.customerEmail ? `EMAIL: ${order.customerEmail}` : ''}

**************************************************
*                   ITENS                      *
**************************************************
${itemsHtml}

**************************************************
*                RESUMO DO VALOR               *
**************************************************
SUBTOTAL: R$ ${order.subtotal.toFixed(2)}${deliveryFeeHtml}${discountHtml}

TOTAL: R$ ${order.total.toFixed(2)}

PAGAMENTO: ${order.paymentMethod || 'Não informado'}
STATUS PGTO: ${this.getPaymentStatusText(order.paymentStatus)}
${order.couponCode ? `CUPOM: ${order.couponCode}` : ''}${addressHtml}${notesHtml}

**************************************************
*               OBRIGADO PELA                 *
*               PREFERÊNCIA!                  *
**************************************************
    `.trim()
  }

  generateThermalPrintContent(order: Order): string {
    const itemsText = order.items.map(item => {
      const optionsText = item.options.length > 0 
        ? '\n' + item.options.map(option => `  +${option.name}`).join('\n')
        : ''
      
      const notesText = item.notes ? `\n  Obs:${item.notes}` : ''
      
      const itemLine = `${item.quantity}x ${item.productName}`
      const priceLine = `${(item.quantity * item.price).toFixed(2)}`
      
      return `${itemLine.padEnd(24)} ${priceLine}${optionsText}${notesText}`
    }).join('\n')

    const addressText = order.type === 'DELIVERY' && order.deliveryAddress 
      ? `\nENDERECO ENTREGA:\n${this.formatAddress(order.deliveryAddress)}`
      : ''

    const notesText = order.notes 
      ? `\nOBS:\n${order.notes}`
      : ''

    return `
SALGADO BOX
==========
PED: ${order.orderNumber}
${this.formatDateTime(order.createdAt)}
${this.getStatusText(order.status)} - ${this.getTypeText(order.type)}

CLI: ${order.customerName}
TEL: ${order.customerPhone}
${order.customerEmail ? `EML: ${order.customerEmail}` : ''}
----------
ITENS
----------
${itemsText}

----------
RESUMO
----------
SUB: ${order.subtotal.toFixed(2)}
${order.deliveryFee > 0 ? `ENT: ${order.deliveryFee.toFixed(2)}` : ''}
${order.discount > 0 ? `DSC: ${order.discount.toFixed(2)}` : ''}
----------
TTL: ${order.total.toFixed(2)}

PG: ${order.paymentMethod || 'N/I'}
${order.couponCode ? `CUP: ${order.couponCode}` : ''}${addressText}${notesText}

==========
OBRIGADO!
==========
    `.trim()
  }

  async printOrder(order: Order, type: 'thermal' | 'full' = 'thermal'): Promise<void> {
    try {
      const content = type === 'thermal' 
        ? this.generateThermalPrintContent(order)
        : this.generatePrintContent(order)

      // Create a hidden iframe for printing
      const printFrame = document.createElement('iframe')
      printFrame.style.position = 'absolute'
      printFrame.style.left = '-9999px'
      printFrame.style.top = '-9999px'
      document.body.appendChild(printFrame)

      const printDocument = printFrame.contentDocument || printFrame.contentWindow?.document
      if (!printDocument) {
        throw new Error('Não foi possível acessar o documento de impressão')
      }

      printDocument.open()
      printDocument.write(`
        <!DOCTYPE html>
        <html>
        <head>
          <title>Comprovante - ${order.orderNumber}</title>
          <style>
            body {
              font-family: 'Courier New', monospace;
              font-size: ${type === 'thermal' ? '16px' : '12px'};
              line-height: 1.0;
              margin: 0;
              padding: 2px;
              white-space: pre-wrap;
              font-weight: bold;
              width: 58mm;
            }
            @media print {
              body {
                margin: 0;
                padding: 0;
                size: 58mm 210mm;
              }
              @page {
                margin: 0mm;
                size: 58mm 210mm;
              }
            }
          </style>
        </head>
        <body>
          ${content.replace(/\n/g, '<br>')}
        </body>
        </html>
      `)
      printDocument.close()

      // Wait for content to load
      printFrame.onload = () => {
        try {
          printFrame.contentWindow?.print()
          
          // Remove iframe after printing
          setTimeout(() => {
            document.body.removeChild(printFrame)
          }, 1000)
        } catch (error) {
          console.error('Erro ao imprimir:', error)
          document.body.removeChild(printFrame)
          throw error
        }
      }
    } catch (error) {
      console.error('Erro ao gerar comprovante:', error)
      throw error
    }
  }

  async printOrderAsImage(order: Order): Promise<void> {
    try {
      // Create a temporary div with the content
      const tempDiv = document.createElement('div')
      tempDiv.style.position = 'absolute'
      tempDiv.style.left = '-9999px'
      tempDiv.style.top = '-9999px'
      tempDiv.style.fontFamily = "'Courier New', monospace"
      tempDiv.style.fontSize = '16px'
      tempDiv.style.lineHeight = '1.0'
      tempDiv.style.whiteSpace = 'pre'
      tempDiv.style.padding = '2px'
      tempDiv.style.backgroundColor = 'white'
      tempDiv.style.width = '224px' // 58mm converted to pixels (approximately)
      tempDiv.style.fontWeight = 'bold'
      
      tempDiv.textContent = this.generateThermalPrintContent(order)
      document.body.appendChild(tempDiv)

      // Convert to canvas
      const canvas = await html2canvas(tempDiv, {
        backgroundColor: 'white',
        scale: 2,
        width: 224 // 58mm width
      })

      // Remove temporary div
      document.body.removeChild(tempDiv)

      // Create image and print
      const imgData = canvas.toDataURL('image/png')
      const printWindow = window.open('', '_blank')
      
      if (printWindow) {
        printWindow.document.write(`
          <!DOCTYPE html>
          <html>
          <head>
            <title>Comprovante - ${order.orderNumber}</title>
            <style>
              body { 
                margin: 0; 
                padding: 0; 
                text-align: center; 
                background: white;
              }
              img { 
                max-width: 100%; 
                height: auto; 
                width: 224px;
              }
              @media print {
                body {
                  margin: 0;
                  padding: 0;
                }
                @page {
                  margin: 0mm;
                  size: 58mm 210mm;
                }
              }
            </style>
          </head>
          <body>
            <img src="${imgData}" alt="Comprovante" />
            <script>
              window.onload = function() {
                window.print();
                window.close();
              }
            </script>
          </body>
          </html>
        `)
        printWindow.document.close()
      }
    } catch (error) {
      console.error('Erro ao imprimir como imagem:', error)
      throw error
    }
  }

  // Check if Web Bluetooth API is available
  isBluetoothAvailable(): boolean {
    return 'bluetooth' in navigator
  }

  // Check if WebUSB API is available
  isUSBAvailable(): boolean {
    return 'usb' in navigator
  }

  // Get available printers (basic implementation)
  async getAvailablePrinters(): Promise<string[]> {
    const printers: string[] = []
    
    if (this.isBluetoothAvailable()) {
      printers.push('Bluetooth Printer (simulado)')
    }
    
    if (this.isUSBAvailable()) {
      printers.push('USB Printer (simulado)')
    }
    
    // Always include default printer
    printers.push('Impressora Padrão')
    
    return printers
  }
}

export default PrintService
export { PrintService, type Order, type OrderItem, type OrderItemOption }