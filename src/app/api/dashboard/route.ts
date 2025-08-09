import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId') || 'default'
    
    // Check if restaurant exists, if not create a default one
    let restaurant = await db.restaurant.findUnique({
      where: { id: restaurantId }
    })

    if (!restaurant) {
      // Create default restaurant
      restaurant = await db.restaurant.create({
        data: {
          id: restaurantId,
          name: 'Salgado Box',
          description: 'Restaurante especializado em salgados',
          phone: '(11) 9999-9999',
          email: 'contato@salgadobox.com.br',
          address: 'Rua Principal, 123',
          neighborhood: 'Centro',
          city: 'São Paulo',
          state: 'SP',
          zipCode: '01234-567',
          currency: 'BRL',
          status: 'ACTIVE',
          deliveryEnabled: true,
          takeawayEnabled: true,
          dineInEnabled: true,
          deliveryFee: 5.00,
          minimumOrder: 20.00,
          openingHours: [
            { day: 'Monday', open: '08:00', close: '22:00' },
            { day: 'Tuesday', open: '08:00', close: '22:00' },
            { day: 'Wednesday', open: '08:00', close: '22:00' },
            { day: 'Thursday', open: '08:00', close: '22:00' },
            { day: 'Friday', open: '08:00', close: '22:00' },
            { day: 'Saturday', open: '08:00', close: '23:00' },
            { day: 'Sunday', open: '08:00', close: '21:00' }
          ],
          paymentMethods: ['cash', 'pix', 'credit_card', 'debit_card'],
          ownerId: 'default-owner'
        }
      })
    }
    
    // Get today's date range
    const today = new Date()
    const startOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate())
    const endOfDay = new Date(today.getFullYear(), today.getMonth(), today.getDate() + 1)

    // Get today's orders
    const todayOrders = await db.order.findMany({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      },
      include: {
        orderItems: {
          include: {
            product: true
          }
        },
        customer: true
      }
    })

    // Calculate today's revenue
    const todayRevenue = todayOrders.reduce((sum, order) => sum + order.total, 0)

    // Get order counts by status
    const pendingOrders = todayOrders.filter(order => order.status === 'PENDING').length
    const preparingOrders = todayOrders.filter(order => order.status === 'PREPARING').length
    const readyOrders = todayOrders.filter(order => order.status === 'READY').length
    const deliveredOrders = todayOrders.filter(order => order.status === 'DELIVERED').length

    // Calculate average ticket
    const avgTicket = todayOrders.length > 0 ? todayRevenue / todayOrders.length : 0

    // Get active customers (customers who ordered in the last 30 days)
    const thirtyDaysAgo = new Date(today.getTime() - 30 * 24 * 60 * 60 * 1000)
    const activeCustomers = await db.customer.count({
      where: {
        restaurantId: restaurant.id,
        orders: {
          some: {
            createdAt: {
              gte: thirtyDaysAgo
            }
          }
        }
      }
    })

    // Get recent orders (last 10 orders)
    const recentOrders = await db.order.findMany({
      where: {
        restaurantId: restaurant.id
      },
      include: {
        customer: true
      },
      orderBy: {
        createdAt: 'desc'
      },
      take: 10
    })

    // Get popular products (by quantity sold today)
    const productSales = new Map<string, { name: string; sold: number; revenue: number }>()
    
    todayOrders.forEach(order => {
      order.orderItems.forEach(item => {
        if (item.product) {
          const key = item.product.id
          const current = productSales.get(key) || { name: item.product.name, sold: 0, revenue: 0 }
          productSales.set(key, {
            name: current.name,
            sold: current.sold + item.quantity,
            revenue: current.revenue + (item.price * item.quantity)
          })
        }
      })
    })

    const popularProducts = Array.from(productSales.entries())
      .map(([id, data]) => ({
        id,
        name: data.name,
        sold: data.sold,
        revenue: data.revenue
      }))
      .sort((a, b) => b.sold - a.sold)
      .slice(0, 10)

    // Get yesterday's data for comparison
    const yesterday = new Date(today)
    yesterday.setDate(yesterday.getDate() - 1)
    const startOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate())
    const endOfYesterday = new Date(yesterday.getFullYear(), yesterday.getMonth(), yesterday.getDate() + 1)

    const yesterdayOrders = await db.order.findMany({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: startOfYesterday,
          lt: endOfYesterday
        }
      }
    })

    const yesterdayRevenue = yesterdayOrders.reduce((sum, order) => sum + order.total, 0)
    const revenueChange = yesterdayRevenue > 0 ? ((todayRevenue - yesterdayRevenue) / yesterdayRevenue) * 100 : 0
    const ordersChange = yesterdayOrders.length > 0 ? ((todayOrders.length - yesterdayOrders.length) / yesterdayOrders.length) * 100 : 0

    // Get new customers today
    const newCustomersToday = await db.customer.count({
      where: {
        restaurantId: restaurant.id,
        createdAt: {
          gte: startOfDay,
          lt: endOfDay
        }
      }
    })

    const dashboardData = {
      stats: {
        todayRevenue,
        todayOrders: todayOrders.length,
        avgTicket,
        activeCustomers,
        pendingOrders,
        preparingOrders,
        readyOrders,
        deliveredOrders,
        revenueChange,
        ordersChange,
        newCustomersToday
      },
      recentOrders: recentOrders.map(order => ({
        id: order.id,
        orderNumber: order.orderNumber,
        customerName: order.customerName,
        status: order.status,
        total: order.total,
        type: order.type,
        createdAt: order.createdAt.toLocaleTimeString('pt-BR', { hour: '2-digit', minute: '2-digit' })
      })),
      popularProducts
    }

    return NextResponse.json(dashboardData)

  } catch (error) {
    console.error('Error fetching dashboard data:', error)
    return NextResponse.json(
      { error: 'Failed to fetch dashboard data' },
      { status: 500 }
    )
  }
}