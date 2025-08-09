import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const restaurantId = searchParams.get('restaurantId')
    const productId = searchParams.get('productId')

    if (!restaurantId || !productId) {
      return NextResponse.json(
        { error: 'Restaurant ID and Product ID are required' },
        { status: 400 }
      )
    }

    const movements = await db.stockMovement.findMany({
      where: {
        restaurantId,
        productId,
      },
      include: {
        product: true,
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(movements)
  } catch (error) {
    console.error('Error fetching stock movements:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock movements' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, productId, type, quantity, notes, reference } = body

    if (!restaurantId || !productId || !type || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Get current product stock
    const product = await db.product.findUnique({
      where: {
        id: productId,
        restaurantId,
      },
    })

    if (!product) {
      return NextResponse.json(
        { error: 'Product not found' },
        { status: 404 }
      )
    }

    // Calculate new stock based on movement type
    let newStock = product.stock
    if (type === 'ENTRY') {
      newStock += quantity
    } else if (type === 'EXIT') {
      if (product.stock < quantity) {
        return NextResponse.json(
          { error: 'Insufficient stock for this movement' },
          { status: 400 }
        )
      }
      newStock -= quantity
    } else if (type === 'ADJUSTMENT') {
      newStock = quantity
    }

    // Update product stock
    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: newStock,
      },
    })

    // Create stock movement record
    const movement = await db.stockMovement.create({
      data: {
        restaurantId,
        productId,
        type,
        quantity,
        notes,
        reference,
      },
      include: {
        product: true,
        staff: {
          select: {
            id: true,
            name: true,
          },
        },
      },
    })

    return NextResponse.json(movement)
  } catch (error) {
    console.error('Error creating stock movement:', error)
    return NextResponse.json(
      { error: 'Failed to create stock movement' },
      { status: 500 }
    )
  }
}