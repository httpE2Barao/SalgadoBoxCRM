import { NextRequest, NextResponse } from 'next/server'
import { lalamoveService } from '@/lib/services/lalamove'
import { db } from '@/lib/db'

interface DeliveryQuoteRequest {
  pickupAddress?: string
  deliveryAddress: string
  orderValue: number
  vehicleType?: 'MOTORCYCLE' | 'CAR' | 'VAN'
  serviceType?: 'INSTANT' | 'SCHEDULED'
  scheduledAt?: string
}

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      pickupAddress,
      deliveryAddress,
      orderValue,
      vehicleType,
      serviceType,
      scheduledAt
    } = body as DeliveryQuoteRequest

    // Validate required fields
    if (!deliveryAddress || !orderValue) {
      return NextResponse.json(
        { error: 'Endereço de entrega e valor do pedido são obrigatórios' },
        { status: 400 }
      )
    }

    // Get restaurant address if not provided
    let finalPickupAddress = pickupAddress
    if (!finalPickupAddress) {
      const restaurant = await db.restaurant.findFirst({
        where: { id: 'default' } // Using default restaurant
      })
      
      if (!restaurant) {
        return NextResponse.json(
          { error: 'Restaurante não encontrado' },
          { status: 404 }
        )
      }
      
      finalPickupAddress = `${restaurant.address}, ${restaurant.neighborhood}, ${restaurant.city} - ${restaurant.state}`
    }

    try {
      // Get delivery quote from Lalamove
      const quote = await lalamoveService.calculateDeliveryQuote(
        finalPickupAddress,
        deliveryAddress,
        orderValue
      )

      // Return detailed quote information
      return NextResponse.json({
        success: true,
        quote: {
          quotaId: quote.quotaId,
          priceBreakdown: quote.priceBreakdown,
          estimatedDuration: quote.estimatedDuration,
          estimatedDistance: quote.estimatedDistance,
          totalFare: quote.priceBreakdown.total,
          currency: 'BRL',
          estimatedPickupTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(), // 10 minutes from now
          estimatedDeliveryTime: new Date(Date.now() + (quote.estimatedDuration * 60 * 1000)).toISOString()
        },
        pickupAddress: finalPickupAddress,
        deliveryAddress: deliveryAddress,
        orderValue: orderValue,
        timestamp: new Date().toISOString()
      })

    } catch (error) {
      console.error('Error getting delivery quote:', error)
      
      // Return a fallback quote for development/testing
      const fallbackQuote = {
        quotaId: `fallback-${Date.now()}`,
        priceBreakdown: {
          base: 5.00,
          distance: 2.50,
          time: 3.00,
          total: 10.50
        },
        estimatedDuration: 25,
        estimatedDistance: 3.2,
        totalFare: 10.50,
        currency: 'BRL',
        estimatedPickupTime: new Date(Date.now() + 10 * 60 * 1000).toISOString(),
        estimatedDeliveryTime: new Date(Date.now() + 35 * 60 * 1000).toISOString()
      }

      return NextResponse.json({
        success: true,
        quote: fallbackQuote,
        isFallback: true,
        message: 'Usando cotação fallback (serviço de entrega indisponível)',
        pickupAddress: finalPickupAddress,
        deliveryAddress: deliveryAddress,
        orderValue: orderValue,
        timestamp: new Date().toISOString()
      })
    }

  } catch (error) {
    console.error('Error in delivery quote API:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}

// Helper function to get delivery zones and pricing
export async function GET(request: NextRequest) {
  try {
    // Get restaurant delivery zones
    const restaurant = await db.restaurant.findFirst({
      where: { id: 'default' }
    })

    if (!restaurant) {
      return NextResponse.json(
        { error: 'Restaurante não encontrado' },
        { status: 404 }
      )
    }

    // Return delivery zones and pricing information
    return NextResponse.json({
      deliveryZones: [
        {
          name: 'Zona Central',
          radius: restaurant.deliveryRadius || 10,
          baseFee: restaurant.deliveryFee || 5.00,
          minimumOrder: restaurant.minimumOrder || 20.00,
          estimatedTime: '25-35 minutos'
        },
        {
          name: 'Zona Estendida',
          radius: 15,
          baseFee: 8.00,
          minimumOrder: 30.00,
          estimatedTime: '35-45 minutos'
        }
      ],
      vehicleTypes: [
        {
          type: 'MOTORCYCLE',
          name: 'Moto',
          description: 'Ideal para pedidos pequenos e rápidos',
          maxWeight: '5kg',
          maxDimensions: '30x20x20cm'
        },
        {
          type: 'CAR',
          name: 'Carro',
          description: 'Para pedidos médios e múltiplos itens',
          maxWeight: '20kg',
          maxDimensions: '50x40x30cm'
        },
        {
          type: 'VAN',
          name: 'Van',
          description: 'Para pedidos grandes e eventos',
          maxWeight: '50kg',
          maxDimensions: '100x80x60cm'
        }
      ],
      serviceTypes: [
        {
          type: 'INSTANT',
          name: 'Entrega Imediata',
          description: 'Motorista despachado imediatamente',
          availability: '24/7'
        },
        {
          type: 'SCHEDULED',
          name: 'Entrega Agendada',
          description: 'Agende a entrega para um horário específico',
          availability: 'Com até 24h de antecedência'
        }
      ],
      restaurantInfo: {
        name: restaurant.name,
        address: `${restaurant.address}, ${restaurant.neighborhood}, ${restaurant.city} - ${restaurant.state}`,
        phone: restaurant.phone,
        deliveryEnabled: restaurant.deliveryEnabled,
        minimumOrder: restaurant.minimumOrder,
        deliveryFee: restaurant.deliveryFee
      }
    })

  } catch (error) {
    console.error('Error getting delivery zones:', error)
    return NextResponse.json(
      { error: 'Erro interno do servidor' },
      { status: 500 }
    )
  }
}