import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { notificationService } from '@/lib/services/notifications'

export async function PATCH(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    const { status, notes } = body

    // Validate status
    const validStatuses = [
      'PENDING', 'CONFIRMED', 'PREPARING', 'READY', 
      'OUT_FOR_DELIVERY', 'DELIVERED', 'CANCELLED', 'REFUNDED',
      'driver_dispatched', 'driver_dispatch_failed'
    ]

    if (!validStatuses.includes(status)) {
      return NextResponse.json(
        { error: 'Status inválido' },
        { status: 400 }
      )
    }

    // Get current order
    const currentOrder = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!currentOrder) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    // Update order status
    const updatedOrder = await db.order.update({
      where: { id: orderId },
      data: {
        status,
        ...(status === 'DELIVERED' && { deliveredAt: new Date() }),
        ...(status === 'CANCELLED' && { 
          cancellationReason: notes || 'Cancelado pelo sistema'
        })
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    // Send notifications based on status change
    switch (status) {
      case 'CONFIRMED':
        await notificationService.sendOrderNotification(updatedOrder, 'order_confirmed')
        break
      case 'PREPARING':
        await notificationService.sendOrderNotification(updatedOrder, 'preparing')
        break
      case 'READY':
        await notificationService.sendOrderNotification(updatedOrder, 'ready_for_pickup')
        break
      case 'OUT_FOR_DELIVERY':
        await notificationService.sendOrderNotification(updatedOrder, 'out_for_delivery')
        break
      case 'DELIVERED':
        await notificationService.sendOrderNotification(updatedOrder, 'delivery_completed')
        break
      case 'CANCELLED':
        await notificationService.sendOrderNotification(updatedOrder, 'order_cancelled')
        break
    }

    // Log status change
    console.log(`Order ${orderId} status changed from ${currentOrder.status} to ${status}`)

    return NextResponse.json({
      success: true,
      order: updatedOrder,
      message: `Status do pedido atualizado para ${status}`
    })

  } catch (error) {
    console.error('Error updating order status:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar status do pedido' },
      { status: 500 }
    )
  }
}

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id

    // Get order status history
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
        orderStatusHistory: {
          include: {
            staff: {
              select: {
                id: true,
                name: true,
                email: true
              }
            }
          }
        },
        orderItems: {
          include: {
            product: true
          }
        }
      }
    })

    if (!order) {
      return NextResponse.json(
        { error: 'Pedido não encontrado' },
        { status: 404 }
      )
    }

    return NextResponse.json({
      order,
      statusHistory: order.orderStatusHistory
    })

  } catch (error) {
    console.error('Error getting order status:', error)
    return NextResponse.json(
      { error: 'Erro ao obter status do pedido' },
      { status: 500 }
    )
  }
}