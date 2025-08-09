import ZAI from 'z-ai-web-dev-sdk'

export interface NotificationMessage {
  recipient?: string
  message: string
  priority: 'low' | 'medium' | 'high'
  type: 'new_order' | 'order_status_update' | 'driver_dispatched' | 'payment_confirmation' | 'delivery_completed'
  metadata?: Record<string, any>
}

export interface NotificationSettings {
  email: boolean
  sms: boolean
  push: boolean
  webhook?: string
}

class NotificationService {
  private zai: any = null

  async initialize() {
    if (!this.zai) {
      this.zai = await ZAI.create()
    }
    return this.zai
  }

  async sendNotification(notification: NotificationMessage): Promise<boolean> {
    try {
      const zai = await this.initialize()
      
      await zai.functions.invoke('send_notification', {
        message: notification.message,
        recipient: notification.recipient,
        priority: notification.priority,
        type: notification.type,
        metadata: notification.metadata
      })

      return true
    } catch (error) {
      console.error('Error sending notification:', error)
      return false
    }
  }

  async sendOrderNotification(order: any, type: string, additionalData?: any): Promise<boolean> {
    try {
      let message = ''
      let recipient = ''
      let priority: 'low' | 'medium' | 'high' = 'medium'

      switch (type) {
        case 'new_order':
          message = this.generateNewOrderMessage(order)
          recipient = '+5511999999999' // Restaurant owner phone
          priority = 'high'
          break

        case 'order_confirmed':
          message = this.generateOrderConfirmedMessage(order)
          recipient = order.customerPhone
          priority = 'medium'
          break

        case 'order_preparing':
          message = this.generateOrderPreparingMessage(order)
          recipient = order.customerPhone
          priority = 'medium'
          break

        case 'order_ready':
          message = this.generateOrderReadyMessage(order)
          recipient = order.customerPhone
          priority = 'medium'
          break

        case 'driver_dispatched':
          message = this.generateDriverDispatchedMessage(order, additionalData?.driver, additionalData?.trackingUrl)
          recipient = order.customerPhone
          priority = 'medium'
          break

        case 'delivery_completed':
          message = this.generateDeliveryCompletedMessage(order)
          recipient = order.customerPhone
          priority = 'low'
          break

        case 'payment_confirmed':
          message = this.generatePaymentConfirmedMessage(order)
          recipient = order.customerPhone
          priority = 'medium'
          break

        default:
          console.warn('Unknown notification type:', type)
          return false
      }

      return await this.sendNotification({
        recipient,
        message,
        priority,
        type: type as any,
        metadata: {
          orderId: order.id,
          orderNumber: order.orderNumber,
          ...additionalData
        }
      })
    } catch (error) {
      console.error('Error sending order notification:', error)
      return false
    }
  }

  private generateNewOrderMessage(order: any): string {
    return `
    NOVO PEDIDO RECEBIDO! 🚨
    
    📋 Pedido: ${order.orderNumber}
    👤 Cliente: ${order.customerName}
    📞 Telefone: ${order.customerPhone}
    💰 Total: R$ ${order.total.toFixed(2)}
    📍 Entrega: ${order.deliveryAddress}, ${order.deliveryNeighborhood}
    💳 Pagamento: ${order.paymentMethod}
    
    Itens do pedido:
    ${order.orderItems.map((item: any) => 
      `- ${item.name} (x${item.quantity}) - R$ ${item.totalPrice.toFixed(2)}`
    ).join('\n')}
    
    Por favor, confirmar o pedido e iniciar preparo!
    `
  }

  private generateOrderConfirmedMessage(order: any): string {
    return `
    Seu pedido foi confirmado! ✅
    
    📋 Pedido: ${order.orderNumber}
    💰 Total: R$ ${order.total.toFixed(2)}
    ⏱️ Tempo estimado de preparo: 20-30 minutos
    
    Estamos preparando seu pedido com todo cuidado! 🍽️
    
    SALGADO BOX
    `
  }

  private generateOrderPreparingMessage(order: any): string {
    return `
    Seu pedido está sendo preparado! 👨‍🍳
    
    📋 Pedido: ${order.orderNumber}
    🍳 Status: Em preparação
    ⏱️ Previsão: mais 15-20 minutos
    
    Seu pedido está sendo feito com ingredientes frescos! 🌟
    
    SALGADO BOX
    `
  }

  private generateOrderReadyMessage(order: any): string {
    return `
    Seu pedido está pronto para retirada! 🎉
    
    📋 Pedido: ${order.orderNumber}
    ✅ Status: Pronto para retirada
    📍 Aguardando motorista
    
    Seu pedido saiu em breve! 🛵
    
    SALGADO BOX
    `
  }

  private generateDriverDispatchedMessage(order: any, driver?: any, trackingUrl?: string): string {
    let message = `
    Seu pedido está a caminho! 🛵
    
    📋 Pedido: ${order.orderNumber}
    🚚 Motorista a caminho!
    ⏱️ Tempo estimado: 30-45 minutos
    `

    if (driver) {
      message += `
    👤 Motorista: ${driver.name}
    📱 Contato: ${driver.phone}
    🚗 Veículo: ${driver.vehicleModel} - ${driver.vehiclePlate}
    `
    }

    if (trackingUrl) {
      message += `
    📍 Acompanhe sua entrega: ${trackingUrl}
    `
    }

    message += `
    
    Obrigado por comprar na SALGADO BOX! 🎉
    `

    return message
  }

  private generateDeliveryCompletedMessage(order: any): string {
    return `
    Seu pedido foi entregue! 🎉
    
    📋 Pedido: ${order.orderNumber}
    ✅ Status: Entregue
    💰 Total: R$ ${order.total.toFixed(2)}
    
    Esperamos que tenha gostado! Volte sempre! 🌟
    
    SALGADO BOX
    `
  }

  private generatePaymentConfirmedMessage(order: any): string {
    return `
    Pagamento confirmado! 💳
    
    📋 Pedido: ${order.orderNumber}
    ✅ Pagamento: ${order.paymentMethod}
    💰 Valor: R$ ${order.total.toFixed(2)}
    
    Seu pedido está sendo processado! 🍽️
    
    SALGADO BOX
    `
  }

  // Send bulk notifications (for promotions, updates, etc.)
  async sendBulkNotification(message: string, recipients: string[], type: string = 'general'): Promise<boolean[]> {
    try {
      const results = await Promise.allSettled(
        recipients.map(recipient => 
          this.sendNotification({
            recipient,
            message,
            priority: 'medium',
            type: type as any
          })
        )
      )

      return results.map(result => 
        result.status === 'fulfilled' && result.value
      )
    } catch (error) {
      console.error('Error sending bulk notifications:', error)
      return []
    }
  }

  // Send webhook notification for system events
  async sendWebhookNotification(webhookUrl: string, data: any): Promise<boolean> {
    try {
      const response = await fetch(webhookUrl, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify(data),
      })

      return response.ok
    } catch (error) {
      console.error('Error sending webhook notification:', error)
      return false
    }
  }
}

export const notificationService = new NotificationService()