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

    const productionRecords = await db.productionRecord.findMany({
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

    return NextResponse.json(productionRecords)
  } catch (error) {
    console.error('Error fetching production records:', error)
    return NextResponse.json(
      { error: 'Failed to fetch production records' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, productId, quantity, unitCost, notes } = body

    if (!restaurantId || !productId || !quantity) {
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

    // Update product stock (add production quantity)
    await db.product.update({
      where: {
        id: productId,
      },
      data: {
        stock: {
          increment: quantity,
        },
      },
    })

    // Create production record
    const productionRecord = await db.productionRecord.create({
      data: {
        restaurantId,
        productId,
        quantity,
        unitCost,
        notes,
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

    return NextResponse.json(productionRecord)
  } catch (error) {
    console.error('Error creating production record:', error)
    return NextResponse.json(
      { error: 'Failed to create production record' },
      { status: 500 }
    )
  }
}