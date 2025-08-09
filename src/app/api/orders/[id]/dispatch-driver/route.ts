import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lalamoveService } from '@/lib/services/lalamove'
import { notificationService } from '@/lib/services/notifications'

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const orderId = params.id
    const body = await request.json()
    const { forceDispatch = false } = body

    // Get order with all details
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
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

    // Check if order is eligible for driver dispatch
    if (!forceDispatch && order.status !== 'CONFIRMED' && order.status !== 'PREPARING') {
      return NextResponse.json(
        { error: 'Pedido não está elegível para despacho de motorista' },
        { status: 400 }
      )
    }

    // Check if driver already dispatched
    if (order.lalamoveOrderId && !forceDispatch) {
      return NextResponse.json(
        { error: 'Motorista já despachado para este pedido' },
        { status: 400 }
      )
    }

    // Get restaurant details
    const restaurant = await db.restaurant.findUnique({
      where: { id: order.restaurantId }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      )
    }

    // Parse delivery address
    const deliveryAddress = JSON.parse(order.deliveryAddress as string)

    // Prepare order data for Lalamove
    const orderForLalamove = {
      ...order,
      deliveryAddress: deliveryAddress.address,
      deliveryNeighborhood: deliveryAddress.neighborhood,
      deliveryCity: deliveryAddress.city,
      deliveryState: deliveryAddress.state,
      deliveryInstructions: deliveryAddress.instructions
    }

    try {
      // Dispatch driver using Lalamove service
      const lalamoveResponse = await lalamoveService.dispatchDriverForOrder(orderForLalamove)

      // Update order with Lalamove information
      const updatedOrder = await db.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
          lalamoveOrderId: lalamoveResponse.orderId,
          lalamoveTrackingUrl: lalamoveResponse.trackingUrl,
          lalamoveDriverInfo: lalamoveResponse.driver
        },
        include: {
          orderItems: {
            include: {
              product: true
            }
          }
        }
      })

      // Send notifications
      await notificationService.sendOrderNotification(updatedOrder, 'driver_dispatched', {
        driver: lalamoveResponse.driver,
        trackingUrl: lalamoveResponse.trackingUrl
      })

      // Log the dispatch
      console.log('Driver dispatched for order:', orderId, 'Lalamove Order ID:', lalamoveResponse.orderId)

      return NextResponse.json({
        success: true,
        order: updatedOrder,
        lalamoveResponse: {
          orderId: lalamoveResponse.orderId,
          status: lalamoveResponse.status,
          driver: lalamoveResponse.driver,
          trackingUrl: lalamoveResponse.trackingUrl,
          estimatedPickupTime: lalamoveResponse.estimatedPickupTime,
          estimatedDeliveryTime: lalamoveResponse.estimatedDeliveryTime,
          price: lalamoveResponse.price
        }
      })

    } catch (lalamoveError) {
      console.error('Lalamove dispatch failed:', lalamoveError)

      // Update order status to indicate dispatch failed
      await db.order.update({
        where: { id: orderId },
        data: {
          status: 'CONFIRMED',
        }
      })

      // Send notification to restaurant about dispatch failure
      await notificationService.sendNotification({
        recipient: restaurant.phone,
        message: `
        FALHA AO DESPACHAR MOTORISTA! 🚨
        
        📋 Pedido: ${order.orderNumber}
        ❌ Não foi possível chamar motorista via Lalamove
        📝 Erro: ${lalamoveError.message || 'Erro desconhecido'}
        
        Por favor, contate o suporte técnico!
        
        SALGADO BOX
        `,
        priority: 'high',
        type: 'driver_dispatch_failed'
      })

      return NextResponse.json(
        { 
          error: 'Falha ao despachar motorista',
          details: lalamoveError.message || 'Erro desconhecido'
        },
        { status: 500 }
      )
    }

  } catch (error) {
    console.error('Error in dispatch driver API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
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

    // Get order with Lalamove information
    const order = await db.order.findUnique({
      where: { id: orderId },
      include: {
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

    // If order has Lalamove order ID, get current status
    if (order.lalamoveOrderId) {
      try {
        const lalamoveStatus = await lalamoveService.getOrderStatus(order.lalamoveOrderId)
        
        return NextResponse.json({
          order,
          lalamoveStatus: {
            orderId: lalamoveStatus.orderId,
            status: lalamoveStatus.status,
            driver: lalamoveStatus.driver,
            trackingUrl: lalamoveStatus.trackingUrl,
            estimatedPickupTime: lalamoveStatus.estimatedPickupTime,
            estimatedDeliveryTime: lalamoveStatus.estimatedDeliveryTime,
            price: lalamoveStatus.price
          }
        })
      } catch (error) {
        console.error('Error getting Lalamove status:', error)
        return NextResponse.json({
          order,
          lalamoveStatus: null,
          error: 'Não foi possível obter status do motorista'
        })
      }
    }

    return NextResponse.json({
      order,
      lalamoveStatus: null
    })

  } catch (error) {
    console.error('Error getting driver dispatch status:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}