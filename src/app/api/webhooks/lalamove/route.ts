import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notificationService } from '@/lib/services/notifications'

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { event, data } = body

    // Verify webhook signature (in production, you should verify the signature)
    // const signature = request.headers.get('x-lalamove-signature')
    // if (!verifyWebhookSignature(signature, body)) {
    //   return NextResponse.json({ error: 'Invalid signature' }, { status: 401 })
    // }

    console.log('Received Lalamove webhook:', event, data)

    switch (event) {
      case 'order.status_changed':
        await handleOrderStatusChange(data)
        break

      case 'driver.assigned':
        await handleDriverAssigned(data)
        break

      case 'order.picked_up':
        await handleOrderPickedUp(data)
        break

      case 'order.completed':
        await handleOrderCompleted(data)
        break

      case 'order.cancelled':
        await handleOrderCancelled(data)
        break

      default:
        console.log('Unhandled webhook event:', event)
    }

    return NextResponse.json({ success: true })

  } catch (error) {
    console.error('Error processing Lalamove webhook:', error)
    return NextResponse.json(
      { error: 'Failed to process webhook' },
      { status: 500 }
    )
  }
}

async function handleOrderStatusChange(data: any) {
  try {
    const { orderId, status, driver } = data

    // Find the order by Lalamove order ID
    const order = await db.order.findFirst({
      where: { lalamoveOrderId: orderId },
      include: { orderItems: true }
    })

    if (!order) {
      console.error('Order not found for Lalamove order ID:', orderId)
      return
    }

    // Map Lalamove status to our system status
    let systemStatus = ''
    switch (status) {
      case 'PENDING':
        systemStatus = 'driver_dispatched'
        break
      case 'ASSIGNING_DRIVER':
        systemStatus = 'driver_dispatched'
        break
      case 'ON_GOING':
        systemStatus = 'out_for_delivery'
        break
      case 'COMPLETED':
        systemStatus = 'delivered'
        break
      case 'CANCELLED':
        systemStatus = 'delivery_failed'
        break
      default:
        console.log('Unknown Lalamove status:', status)
        return
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        status: systemStatus,
        lalamoveDriverInfo: driver || order.lalamoveDriverInfo
      },
      include: { orderItems: true }
    })

    // Send notification based on status
    if (systemStatus === 'delivered') {
      await notificationService.sendOrderNotification(updatedOrder, 'delivery_completed')
    }

    console.log('Order status updated via webhook:', order.id, systemStatus)

  } catch (error) {
    console.error('Error handling order status change:', error)
  }
}

async function handleDriverAssigned(data: any) {
  try {
    const { orderId, driver } = data

    const order = await db.order.findFirst({
      where: { lalamoveOrderId: orderId },
      include: { orderItems: true }
    })

    if (!order) {
      console.error('Order not found for Lalamove order ID:', orderId)
      return
    }

    // Update driver information
    await db.order.update({
      where: { id: order.id },
      data: {
        lalamoveDriverInfo: driver,
        status: 'driver_assigned'
      }
    })

    // Send notification with driver info
    await notificationService.sendOrderNotification(order, 'driver_dispatched', {
      driver,
      trackingUrl: order.lalamoveTrackingUrl
    })

    console.log('Driver assigned to order:', order.id)

  } catch (error) {
    console.error('Error handling driver assigned:', error)
  }
}

async function handleOrderPickedUp(data: any) {
  try {
    const { orderId } = data

    const order = await db.order.findFirst({
      where: { lalamoveOrderId: orderId },
      include: { orderItems: true }
    })

    if (!order) {
      console.error('Order not found for Lalamove order ID:', orderId)
      return
    }

    // Update order status
    await db.order.update({
      where: { id: order.id },
      data: {
        status: 'out_for_delivery'
      }
    })

    // Send notification that order is on the way
    await notificationService.sendNotification({
      recipient: order.customerPhone,
      message: `
      Seu pedido saiu para entrega! 🛵
      
      📋 Pedido: ${order.orderNumber}
      🚚 Motorista a caminho do seu endereço!
      ⏱️ Tempo estimado: 15-25 minutos
      
      Acompanhe sua entrega: ${order.lalamoveTrackingUrl}
      
      SALGADO BOX
      `,
      priority: 'medium',
      type: 'order_picked_up'
    })

    console.log('Order picked up by driver:', order.id)

  } catch (error) {
    console.error('Error handling order picked up:', error)
  }
}

async function handleOrderCompleted(data: any) {
  try {
    const { orderId } = data

    const order = await db.order.findFirst({
      where: { lalamoveOrderId: orderId },
      include: { orderItems: true }
    })

    if (!order) {
      console.error('Order not found for Lalamove order ID:', orderId)
      return
    }

    // Update order status and mark as delivered
    const updatedOrder = await db.order.update({
      where: { id: order.id },
      data: {
        status: 'delivered',
        deliveredAt: new Date()
      },
      include: { orderItems: true }
    })

    // Send delivery completion notification
    await notificationService.sendOrderNotification(updatedOrder, 'delivery_completed')

    // Send thank you message
    await notificationService.sendNotification({
      recipient: order.customerPhone,
      message: `
      Obrigado por comprar na SALGADO BOX! 🎉
      
      Esperamos que tenha gostado do seu pedido!
      
      📋 Pedido: ${order.orderNumber}
      ✅ Entregue em: ${new Date().toLocaleString('pt-BR')}
      
      Volte sempre! 🌟
      
      SALGADO BOX
      `,
      priority: 'low',
      type: 'thank_you'
    })

    console.log('Order completed:', order.id)

  } catch (error) {
    console.error('Error handling order completed:', error)
  }
}

async function handleOrderCancelled(data: any) {
  try {
    const { orderId, reason } = data

    const order = await db.order.findFirst({
      where: { lalamoveOrderId: orderId },
      include: { orderItems: true }
    })

    if (!order) {
      console.error('Order not found for Lalamove order ID:', orderId)
      return
    }

    // Update order status
    await db.order.update({
      where: { id: order.id },
      data: {
        status: 'delivery_failed',
        cancellationReason: reason
      }
    })

    // Send cancellation notification to customer
    await notificationService.sendNotification({
      recipient: order.customerPhone,
      message: `
      Houve um problema com sua entrega 😔
      
      📋 Pedido: ${order.orderNumber}
      ❌ Status: Entrega cancelada
      📝 Motivo: ${reason || 'Não informado'}
      
      Entre em contato conosco para resolvermos o problema!
      
      📞 SAC: (11) 9999-9999
      
      SALGADO BOX
      `,
      priority: 'high',
      type: 'delivery_failed'
    })

    // Send alert to restaurant owner
    await notificationService.sendNotification({
      recipient: '+5511999999999', // Restaurant owner phone
      message: `
      ALERTA: Entrega cancelada! 🚨
      
      📋 Pedido: ${order.orderNumber}
      ❌ Motorista cancelou a entrega
      📝 Motivo: ${reason || 'Não informado'}
      
      Por favor, contatar o cliente e remarcar a entrega!
      
      SALGADO BOX
      `,
      priority: 'high',
      type: 'delivery_failed'
    })

    console.log('Order cancelled:', order.id, reason)

  } catch (error) {
    console.error('Error handling order cancelled:', error)
  }
}

// Helper function to verify webhook signature (implement in production)
function verifyWebhookSignature(signature: string, body: any): boolean {
  // In production, implement proper signature verification
  // This is a placeholder implementation
  return true
}