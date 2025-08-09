import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function GET(request: NextRequest) {
  try {
    const categories = await db.category.findMany({
      include: {
        products: true,
        _count: {
          select: { products: true }
        }
      },
      orderBy: [
        { displayOrder: 'asc' },
        { name: 'asc' }
      ]
    })

    // Transform to include productCount
    const categoriesWithCount = categories.map(cat => ({
      ...cat,
      productCount: cat._count.products
    }))

    return NextResponse.json(categoriesWithCount)
  } catch (error) {
    console.error('Error fetching categories:', error)
    return NextResponse.json(
      { error: 'Erro ao buscar categorias' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { name, description, icon, color, displayOrder } = body

    // Validate required fields
    if (!name) {
      return NextResponse.json(
        { error: 'Nome é obrigatório' },
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

    const category = await db.category.create({
      data: {
        name,
        description,
        icon,
        color,
        displayOrder: displayOrder || 0,
        restaurantId: restaurant.id
      },
      include: {
        _count: {
          select: { products: true }
        }
      }
    })

    // Transform to include productCount
    const categoryWithCount = {
      ...category,
      productCount: category._count.products
    }

    return NextResponse.json(categoryWithCount, { status: 201 })
  } catch (error) {
    console.error('Error creating category:', error)
    return NextResponse.json(
      { error: 'Erro ao criar categoria' },
      { status: 500 }
    )
  }
}