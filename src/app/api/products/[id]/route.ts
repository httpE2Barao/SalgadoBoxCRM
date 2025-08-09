import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
import MenuCache from '@/lib/menu-cache'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
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
      isActive,
      isAvailable,
      isFeatured,
      stock,
      minimumStock
    } = body

    const product = await db.product.update({
      where: { id: params.id },
      data: {
        ...(name !== undefined && { name }),
        ...(description !== undefined && { description }),
        ...(price !== undefined && { price: parseFloat(price) }),
        ...(costPrice !== undefined && { costPrice: parseFloat(costPrice) }),
        ...(image !== undefined && { image: image || null }),
        ...(categoryId !== undefined && { categoryId: categoryId || null }),
        ...(preparationTime !== undefined && { preparationTime: preparationTime || null }),
        ...(calories !== undefined && { calories: calories || null }),
        ...(tags !== undefined && { tags: tags || null }),
        ...(spicyLevel !== undefined && { spicyLevel: spicyLevel || null }),
        ...(isVegetarian !== undefined && { isVegetarian }),
        ...(isVegan !== undefined && { isVegan }),
        ...(isGlutenFree !== undefined && { isGlutenFree }),
        ...(displayOrder !== undefined && { displayOrder: displayOrder || 0 }),
        ...(isActive !== undefined && { isActive }),
        ...(isAvailable !== undefined && { isAvailable }),
        ...(isFeatured !== undefined && { isFeatured }),
        ...(stock !== undefined && { stock: stock || 0 }),
        ...(minimumStock !== undefined && { minimumStock: minimumStock || 0 })
      },
      include: {
        category: true,
        productOptions: true
      }
    })

    // Invalidate cache to ensure menu updates
    try {
      const cache = MenuCache.getInstance()
      await cache.invalidate()
    } catch (cacheError) {
      console.error('Failed to invalidate cache:', cacheError)
    }

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating product:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar produto' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.product.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Produto excluído com sucesso' })
  } catch (error) {
    console.error('Error deleting product:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir produto' },
      { status: 500 }
    )
  }
}