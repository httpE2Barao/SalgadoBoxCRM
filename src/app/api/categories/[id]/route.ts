import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const body = await request.json()
    const { name, description, icon, color, displayOrder, isActive } = body

    const category = await db.category.update({
      where: { id: params.id },
      data: {
        name,
        description,
        icon,
        color,
        displayOrder,
        isActive
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

    return NextResponse.json(categoryWithCount)
  } catch (error) {
    console.error('Error updating category:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar categoria' },
      { status: 500 }
    )
  }
}

export async function DELETE(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    await db.category.delete({
      where: { id: params.id }
    })

    return NextResponse.json({ message: 'Categoria excluída com sucesso' })
  } catch (error) {
    console.error('Error deleting category:', error)
    return NextResponse.json(
      { error: 'Erro ao excluir categoria' },
      { status: 500 }
    )
  }
}