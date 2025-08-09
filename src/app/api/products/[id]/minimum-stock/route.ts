import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'

export async function PUT(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const { minimumStock } = await request.json()

    if (typeof minimumStock !== 'number' || minimumStock < 0) {
      return NextResponse.json(
        { error: 'Estoque mínimo inválido' },
        { status: 400 }
      )
    }

    const product = await db.product.update({
      where: { id: params.id },
      data: { minimumStock },
      include: {
        category: true
      }
    })

    return NextResponse.json(product)
  } catch (error) {
    console.error('Error updating minimum stock:', error)
    return NextResponse.json(
      { error: 'Erro ao atualizar estoque mínimo' },
      { status: 500 }
    )
  }
}