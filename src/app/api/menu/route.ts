import { NextRequest, NextResponse } from 'next/server'
import MenuService from '@/lib/menu-service'
import { emitMenuUpdate, broadcastMenuRefresh } from '@/lib/socket'

const menuService = new MenuService()

export async function GET(request: NextRequest) {
  try {
    const { searchParams } = new URL(request.url)
    const category = searchParams.get('category')
    const activeParam = searchParams.get('active')
    const forceRefresh = searchParams.get('refresh') === 'true'

    // Handle the 'all' value for active parameter
    let active = true // default
    if (activeParam === 'false') {
      active = false
    } else if (activeParam === 'all') {
      active = undefined // will fetch both active and inactive
    }

    const menuData = await menuService.getMenu({
      category: category || undefined,
      active,
      forceRefresh
    })

    return NextResponse.json(menuData)

  } catch (error) {
    console.error('Error fetching menu:', error)
    return NextResponse.json(
      { error: 'Failed to fetch menu' },
      { status: 500 }
    )
  }
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { action, data } = body

    switch (action) {
      case 'create_product':
        const product = await menuService.createProduct(data)
        try {
          emitMenuUpdate('product', 'created', product)
        } catch (socketError) {
          console.error('Failed to emit socket event:', socketError)
        }
        return NextResponse.json(product)
      
      case 'update_product':
        try {
          const updatedProduct = await menuService.updateProduct(data.id, data)
          try {
            emitMenuUpdate('product', 'updated', { id: data.id, ...data })
          } catch (socketError) {
            console.error('Failed to emit socket event:', socketError)
          }
          return NextResponse.json({ success: true, data: updatedProduct })
        } catch (error) {
          return NextResponse.json({ success: false, error: error.message }, { status: 400 })
        }
      
      case 'delete_product':
        const deleteSuccess = await menuService.deleteProduct(data.id)
        try {
          emitMenuUpdate('product', 'deleted', { id: data.id })
        } catch (socketError) {
          console.error('Failed to emit socket event:', socketError)
        }
        return NextResponse.json({ success: deleteSuccess })
      
      case 'create_category':
        const category = await menuService.createCategory(data)
        try {
          emitMenuUpdate('category', 'created', category)
        } catch (socketError) {
          console.error('Failed to emit socket event:', socketError)
        }
        return NextResponse.json(category)
      
      case 'update_category':
        const categoryUpdateSuccess = await menuService.updateCategory(data.id, data)
        try {
          emitMenuUpdate('category', 'updated', { id: data.id, ...data })
        } catch (socketError) {
          console.error('Failed to emit socket event:', socketError)
        }
        return NextResponse.json({ success: categoryUpdateSuccess })
      
      case 'delete_category':
        const categoryDeleteSuccess = await menuService.deleteCategory(data.id)
        try {
          emitMenuUpdate('category', 'deleted', { id: data.id })
        } catch (socketError) {
          console.error('Failed to emit socket event:', socketError)
        }
        return NextResponse.json({ success: categoryDeleteSuccess })
      
      case 'toggle_product_status':
        const toggleProductSuccess = await menuService.updateProduct(data.id, { isActive: data.isActive })
        try {
          emitMenuUpdate('product', 'updated', { id: data.id, isActive: data.isActive })
        } catch (socketError) {
          console.error('Failed to emit socket event:', socketError)
        }
        return NextResponse.json({ success: toggleProductSuccess })
      
      case 'toggle_category_status':
        const toggleCategorySuccess = await menuService.updateCategory(data.id, { isActive: data.isActive })
        try {
          emitMenuUpdate('category', 'updated', { id: data.id, isActive: data.isActive })
        } catch (socketError) {
          console.error('Failed to emit socket event:', socketError)
        }
        return NextResponse.json({ success: toggleCategorySuccess })
      
      case 'refresh_cache':
        await menuService.getMenu({ forceRefresh: true })
        try {
          broadcastMenuRefresh()
        } catch (socketError) {
          console.error('Failed to broadcast menu refresh:', socketError)
        }
        return NextResponse.json({ success: true })
      
      default:
        return NextResponse.json(
          { error: 'Invalid action' },
          { status: 400 }
        )
    }
  } catch (error) {
    console.error('Error in menu API:', error)
    return NextResponse.json(
      { error: 'Failed to process request' },
      { status: 500 }
    )
  }
}