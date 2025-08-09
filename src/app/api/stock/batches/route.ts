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

    const batches = await db.stockBatch.findMany({
      where: {
        restaurantId,
        productId,
      },
      include: {
        product: true,
      },
      orderBy: {
        createdAt: 'desc',
      },
    })

    return NextResponse.json(batches)
  } catch (error) {
    console.error('Error fetching stock batches:', error)
    return NextResponse.json(
      { error: 'Failed to fetch stock batches' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { restaurantId, productId, batchNumber, quantity, unitCost, expirationDate, notes } = body

    if (!restaurantId || !productId || !batchNumber || !quantity) {
      return NextResponse.json(
        { error: 'Missing required fields' },
        { status: 400 }
      )
    }

    // Check if batch number already exists for this product
    const existingBatch = await db.stockBatch.findFirst({
      where: {
        restaurantId,
        productId,
        batchNumber,
      },
    })

    if (existingBatch) {
      return NextResponse.json(
        { error: 'Batch number already exists for this product' },
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

    // Update product stock (add batch quantity)
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

    // Create stock batch record
    const batch = await db.stockBatch.create({
      data: {
        restaurantId,
        productId,
        batchNumber,
        quantity,
        unitCost,
        expirationDate,
        notes,
      },
      include: {
        product: true,
      },
    })

    return NextResponse.json(batch)
  } catch (error) {
    console.error('Error creating stock batch:', error)
    return NextResponse.json(
      { error: 'Failed to create stock batch' },
      { status: 500 }
    )
  }
}