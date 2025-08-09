import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import MenuCache from '@/lib/menu-cache'

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const categoryId = searchParams.get('categoryId')
    const isActive = searchParams.get('isActive')

    const where: any = {}
    
    if (categoryId) {
      where.categoryId = categoryId
    }
    
    if (isActive !== null) {
      where.isActive = isActive === 'true'
    }

    const products = await db.product.findMany({
      where,
      include: {
        category: true,
        productOptions: true
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    return NextResponse.json(products)
  } catch (error) {
    console.error('Error fetching products:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar produtos' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      name,
      description,
      price,
      costPrice,
      image,
      categoryId,
      preparationTime,
      calories,
      tags,
      spicyLevel,
      isVegetarian,
      isVegan,
      isGlutenFree,
      displayOrder,
      stock,
      minimumStock
    } = body

    // Validate required fields
    if (!name || !price) {
      return NextResponse.json(
        { error: 'Nome e preço são obrigatórios' },
        { status: 400 }
      )
    }

    // Get restaurant ID (in a real app, this would come from authentication)
    const restaurant = await db.restaurant.findFirst()
    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      )
    }

    const product = await db.product.create({
      data: {
        name,
        description,
        price: parseFloat(price),
        costPrice: costPrice !== undefined ? parseFloat(costPrice) : null,
        image,
        categoryId,
        preparationTime,
        calories,
        tags,
        spicyLevel,
        isVegetarian,
        isVegan,
        isGlutenFree,
        displayOrder: displayOrder || 0,
        stock: stock || 0,
        minimumStock: minimumStock || 0,
        restaurantId: restaurant.id
      },
      include: {
        category: true,
        productOptions: true
      }
    })

    // Invalidate menu cache to ensure menu shows the new product
    try {
      const cache = MenuCache.getInstance()
      await cache.invalidate()
    } catch (cacheError) {
      console.error('Error invalidating menu cache:', cacheError)
    }

    return NextResponse.json(product, { status: 201 })
  } catch (error) {
    console.error('Error creating product:', error)
    return NextResponse.json(
      { error: 'Erro ao criar produto' },
      { status: 500 }
    )
  }
}