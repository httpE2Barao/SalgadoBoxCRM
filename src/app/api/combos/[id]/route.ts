import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

interface RouteParams {
  params: {
    id: string
  }
}

// GET /api/combos/[id] - Get single combo
export async function GET(request: NextRequest, { params }: RouteParams) {
  try {
    const combo = await db.combo.findUnique({
      where: { id: params.id },
      include: {
        comboItems: {
          include: {
            product: true
          },
          orderBy: {
            displayOrder: 'asc'
          }
        },
        restaurant: {
          select: {
            id: true,
            name: true
          }
        }
      }
    })
    
    if (!combo) {
      return NextResponse.json(
        { error: 'Combo not found' },
        { status: 404 }
      )
    }
    
    return NextResponse.json(combo)
  } catch (error) {
    console.error('Error fetching combo:', error)
    return NextResponse.json(
      { error: 'Failed to fetch combo' },
      { status: 500 }
    )
  }
}

// PUT /api/combos/[id] - Update combo
export async function PUT(request: NextRequest, { params }: RouteParams) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    const body = await request.json()
    const {
      name,
      description,
      price,
      originalPrice,
      isActive,
      isAvailable,
      isFeatured,
      preparationTime,
      displayOrder,
      comboItems
    } = body
    
    // Update combo
    const updatedCombo = await db.combo.update({
      where: { id: params.id },
      data: {
        name,
        description,
        price,
        originalPrice,
        isActive,
        isAvailable,
        isFeatured,
        preparationTime,
        displayOrder
      },
      include: {
        comboItems: {
          include: {
            product: true
          }
        }
      }
    })
    
    // Update combo items if provided
    if (comboItems) {
      // Delete existing combo items
      await db.comboItem.deleteMany({
        where: { comboId: params.id }
      })
      
      // Create new combo items
      await db.comboItem.createMany({
        data: comboItems.map((item: any) => ({
          comboId: params.id,
          productId: item.productId,
          quantity: item.quantity,
          isOptional: item.isOptional ?? false,
          displayOrder: item.displayOrder ?? 0
        }))
      })
      
      // Fetch updated combo with items
      const finalCombo = await db.combo.findUnique({
        where: { id: params.id },
        include: {
          comboItems: {
            include: {
              product: true
            },
            orderBy: {
              displayOrder: 'asc'
            }
          }
        }
      })
      
      return NextResponse.json(finalCombo)
    }
    
    return NextResponse.json(updatedCombo)
  } catch (error) {
    console.error('Error updating combo:', error)
    return NextResponse.json(
      { error: 'Failed to update combo' },
      { status: 500 }
    )
  }
}

// DELETE /api/combos/[id] - Delete combo
export async function DELETE(request: NextRequest, { params }: RouteParams) {
  try {
    // const session = await getServerSession(authOptions)
    // if (!session) {
    //   return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
    // }
    
    // Delete combo items first
    await db.comboItem.deleteMany({
      where: { comboId: params.id }
    })
    
    // Delete combo
    await db.combo.delete({
      where: { id: params.id }
    })
    
    return NextResponse.json({ message: 'Combo deleted successfully' })
  } catch (error) {
    console.error('Error deleting combo:', error)
    return NextResponse.json(
      { error: 'Failed to delete combo' },
      { status: 500 }
    )
  }
}