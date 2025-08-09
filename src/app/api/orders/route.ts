import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import { lalamoveService } from '@/lib/services/lalamove'
import { notificationService } from '@/lib/services/notifications'
import { getOrderStatusService } from '@/lib/services/orderStatus'
import { getIO } from '@/lib/socket'

interface OrderItem {
  productId: string
  name: string
  quantity: number
  unitPrice: number
  totalPrice: number
}

interface Customer {
  name: string
  phone: string
  email: string
}

interface Delivery {
  address: string
  number: string
  complement: string
  neighborhood: string
  city: string
  state: string
  zipCode: string
  instructions: string
}

interface Payment {
  method: string
  amount: number
}

interface Totals {
  subtotal: number
  deliveryFee: number
  total: number
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    
    // Check if it's a test order format or regular format
    if (body.orderNumber && body.customerName && body.items) {
      // Test order format
      return await createTestOrder(body)
    } else {
      // Regular order format
      return await createRegularOrder(body)
    }
  } catch (error) {
    console.error('Error creating order:', error)
    return NextResponse.json(
      { error: 'Failed to create order' },
      { status: 500 }
    )
  }
}

async function createTestOrder(orderData: any) {
  const {
    orderNumber,
    status,
    type,
    customerName,
    customerPhone,
    customerEmail,
    deliveryAddress,
    subtotal,
    deliveryFee,
    discount,
    tax,
    total,
    paymentMethod,
    paymentStatus,
    notes,
    estimatedTime,
    preparationTime,
    deliveryTime,
    source,
    items
  } = orderData

  // Check stock availability first
  for (const item of items) {
    const product = await db.product.findUnique({
      where: { id: item.productId }
    })
    
    if (!product) {
      return NextResponse.json(
        { error: `Produto não encontrado` },
        { status: 404 }
      )
    }
    
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Estoque insuficiente para ${product.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}` },
        { status: 400 }
      )
    }
  }

  // Create order in database
  const order = await db.order.create({
    data: {
      orderNumber,
      status,
      type,
      customerName,
      customerPhone,
      customerEmail,
      deliveryAddress: deliveryAddress ? JSON.stringify(deliveryAddress) : null,
      subtotal,
      deliveryFee,
      discount,
      tax,
      total,
      paymentMethod,
      paymentStatus,
      notes,
      estimatedTime,
      preparationTime,
      deliveryTime,
      source,
      restaurantId: 'default', // Using default restaurant
      orderItems: {
        create: items.map((item: any) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.price,
          notes: item.notes
        }))
      }
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  })

  // Deduct stock for each item
  for (const item of items) {
    await db.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity
        }
      }
    })
  }

  // Create order status history
  await db.orderStatusHistory.create({
    data: {
      orderId: order.id,
      status: order.status,
      notes: `Test order created via ${source}`
    }
  })

  // Emit real-time update
  try {
    const io = getIO()
    if (io) {
      const orderStatusService = getOrderStatusService(io)
      await orderStatusService.emitNewOrder(order.id)
    }
  } catch (error) {
    console.log('Socket.io not available, skipping real-time update')
  }

  return NextResponse.json(order)
}

async function createRegularOrder(body: any) {
  const { customer, delivery, items, payment, totals } = body

  // Check stock availability first
  for (const item of items) {
    const product = await db.product.findUnique({
      where: { id: item.productId }
    })
    
    if (!product) {
      return NextResponse.json(
        { error: `Produto ${item.name} não encontrado` },
        { status: 404 }
      )
    }
    
    if (product.stock < item.quantity) {
      return NextResponse.json(
        { error: `Estoque insuficiente para ${item.name}. Disponível: ${product.stock}, Solicitado: ${item.quantity}` },
        { status: 400 }
      )
    }
  }

  // Generate order number
  const orderNumber = `ORD-${Date.now()}-${Math.random().toString(36).substr(2, 9).toUpperCase()}`

  // Create order in database
  const order = await db.order.create({
    data: {
      orderNumber,
      status: 'PENDING',
      customerName: customer.name,
      customerPhone: customer.phone,
      customerEmail: customer.email,
      deliveryAddress: JSON.stringify({
        address: delivery.address,
        number: delivery.number,
        complement: delivery.complement,
        neighborhood: delivery.neighborhood,
        city: delivery.city,
        state: delivery.state,
        zipCode: delivery.zipCode,
        instructions: delivery.instructions
      }),
      paymentMethod: payment.method,
      subtotal: totals.subtotal,
      deliveryFee: totals.deliveryFee,
      total: totals.total,
      restaurantId: 'default',
      orderItems: {
        create: items.map((item: OrderItem) => ({
          productId: item.productId,
          quantity: item.quantity,
          price: item.unitPrice
        }))
      }
    },
    include: {
      orderItems: {
        include: {
          product: true
        }
      }
    }
  })

  // Deduct stock for each item
  for (const item of items) {
    await db.product.update({
      where: { id: item.productId },
      data: {
        stock: {
          decrement: item.quantity
        }
      }
    })
  }

  // Send notification to restaurant owner
  try {
    await notificationService.sendOrderNotification(order, 'new_order')
  } catch (error) {
    console.log('Notification service not available, skipping notification')
  }

  // Emit real-time update
  try {
    const io = getIO()
    if (io) {
      const orderStatusService = getOrderStatusService(io)
      await orderStatusService.emitNewOrder(order.id)
    }
  } catch (error) {
    console.log('Socket.io not available, skipping real-time update')
  }

  // Call Lalamove API for driver dispatch (if payment is confirmed)
  if (payment.method === 'pix' || payment.method === 'cash') {
    // For cash or PIX, we can dispatch immediately
    try {
      await dispatchLalamoveDriver(order)
    } catch (error) {
      console.log('Lalamove service not available, skipping driver dispatch')
    }
  } else {
    // For card payments, we would wait for payment confirmation
    // This is where you'd integrate with a payment gateway
    console.log('Waiting for payment confirmation for order:', order.id)
  }

  return NextResponse.json(order)
}

async function dispatchLalamoveDriver(order: any) {
  try {
    // Use the Lalamove service to dispatch driver
    const lalamoveResponse = await lalamoveService.dispatchDriverForOrder(order)

    // Update order with Lalamove tracking information
    await db.order.update({
      where: { id: order.id },
      data: {
        status: 'driver_dispatched',
        lalamoveOrderId: lalamoveResponse.orderId,
        lalamoveTrackingUrl: lalamoveResponse.trackingUrl,
        lalamoveDriverInfo: lalamoveResponse.driver
      }
    })

    console.log('Lalamove driver dispatched for order:', order.id)

    // Send notification to customer with tracking info
    await notificationService.sendOrderNotification(order, 'driver_dispatched', {
      driver: lalamoveResponse.driver,
      trackingUrl: lalamoveResponse.trackingUrl
    })

  } catch (error) {
    console.error('Error dispatching Lalamove driver:', error)
    // Update order status to indicate driver dispatch failed
    await db.order.update({
      where: { id: order.id },
      data: {
        status: 'driver_dispatch_failed'
      }
    })
  }
}