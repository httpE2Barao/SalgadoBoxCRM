import { NextRequest, NextResponse } from 'next/server'
import { db } from '@/lib/db'
// import { getServerSession } from 'next-auth'
// import { authOptions } from '@/lib/auth'

// GET /api/combos - Get all combos
export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const active = searchParams.get('active')
    
    const whereClause = active === 'true' ? { isActive: true } : {}
    
    const combos = await db.combo.findMany({
      where: {
        ...whereClause,
        restaurant: {
          id: 'default' // TODO: Get from session
        }
      },
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
      },
      orderBy: {
        displayOrder: 'asc'
      }
    })
    
    return NextResponse.json(combos)
  } catch (error) {
    console.error('Error fetching combos:', error)
    return NextResponse.json(
      { error: 'Failed to fetch combos' },
      { status: 500 }
    )
  }
}

// POST /api/combos - Create new combo
export async function POST(request: NextRequest) {
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
    
    // Create combo with items
    const combo = await db.combo.create({
      data: {
        name,
        description,
        price,
        originalPrice,
        isActive: isActive ?? true,
        isAvailable: isAvailable ?? true,
        isFeatured: isFeatured ?? false,
        preparationTime,
        displayOrder: displayOrder ?? 0,
        restaurantId: 'default', // TODO: Get from session
        comboItems: {
          create: comboItems?.map((item: any) => ({
            productId: item.productId,
            quantity: item.quantity,
            isOptional: item.isOptional ?? false,
            displayOrder: item.displayOrder ?? 0
          })) || []
        }
      },
      include: {
        comboItems: {
          include: {
            product: true
          }
        }
      }
    })
    
    return NextResponse.json(combo, { status: 201 })
  } catch (error) {
    console.error('Error creating combo:', error)
    return NextResponse.json(
      { error: 'Failed to create combo' },
      { status: 500 }
    )
  }
}