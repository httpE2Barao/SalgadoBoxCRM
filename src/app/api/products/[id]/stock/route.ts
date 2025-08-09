import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { stock } = await request.json()

    if (typeof stock !== 'number' || stock < 0) {
      return NextResponse.json(
        { error: 'Estoque inválido' },
        { status: 400 }
      )
    }

    const product = await db.product.update({
      where: { id: params.id },
      data: { stock },
      include: {
        category: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating stock:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar estoque' },
      { status: 500 }
    )
  }
}