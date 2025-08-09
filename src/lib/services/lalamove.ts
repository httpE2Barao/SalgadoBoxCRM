import ZAI from 'z-ai-web-dev-sdk'

export interface LalamoveQuoteRequest {
  pickup: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
  }
  delivery: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
    contactName: string
    contactPhone: string
  }
  vehicleType: 'MOTORCYCLE' | 'CAR' | 'VAN'
  serviceType: 'INSTANT' | 'SCHEDULED'
  scheduledAt?: string
}

export interface LalamoveQuoteResponse {
  quotaId: string
  priceBreakdown: {
    base: number
    distance: number
    time: number
    total: number
  }
  estimatedDuration: number
  estimatedDistance: number
}

export interface LalamoveOrderRequest {
  quotaId: string
  pickup: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
    contactName: string
    contactPhone: string
    instructions?: string
  }
  delivery: {
    address: string
    coordinates: {
      lat: number
      lng: number
    }
    contactName: string
    contactPhone: string
    instructions?: string
  }
  orderDetails: {
    orderId: string
    totalValue: number
    items: Array<{
      name: string
      quantity: number
      category?: string
    }>
  }
  paymentMethod: 'CASH' | 'CREDIT_CARD'
}

export interface LalamoveOrderResponse {
  orderId: string
  status: 'PENDING' | 'ASSIGNING_DRIVER' | 'ON_GOING' | 'COMPLETED' | 'CANCELLED'
  driver: {
    name: string
    phone: string
    vehiclePlate: string
    vehicleModel: string
    photoUrl?: string
  }
  trackingUrl: string
  estimatedPickupTime: string
  estimatedDeliveryTime: string
  price: {
    total: number
    currency: string
  }
}

class LalamoveService {
  private zai: any = null

  async initialize() {
    if (!this.zai) {
      this.zai = await ZAI.create()
    }
    return this.zai
  }

  async getQuote(request: LalamoveQuoteRequest): Promise<LalamoveQuoteResponse> {
    try {
      const zai = await this.initialize()
      
      const response = await zai.functions.invoke('lalamove_get_quote', {
        pickup: request.pickup,
        delivery: request.delivery,
        vehicleType: request.vehicleType,
        serviceType: request.serviceType,
        scheduledAt: request.scheduledAt
      })

      return {
        quotaId: response.quotaId,
        priceBreakdown: response.priceBreakdown,
        estimatedDuration: response.estimatedDuration,
        estimatedDistance: response.estimatedDistance
      }
    } catch (error) {
      console.error('Error getting Lalamove quote:', error)
      throw new Error('Failed to get delivery quote')
    }
  }

  async createOrder(request: LalamoveOrderRequest): Promise<LalamoveOrderResponse> {
    try {
      const zai = await this.initialize()
      
      const response = await zai.functions.invoke('lalamove_create_order', {
        quotaId: request.quotaId,
        pickup: request.pickup,
        delivery: request.delivery,
        orderDetails: request.orderDetails,
        paymentMethod: request.paymentMethod
      })

      return {
        orderId: response.orderId,
        status: response.status,
        driver: response.driver,
        trackingUrl: response.trackingUrl,
        estimatedPickupTime: response.estimatedPickupTime,
        estimatedDeliveryTime: response.estimatedDeliveryTime,
        price: response.price
      }
    } catch (error) {
      console.error('Error creating Lalamove order:', error)
      throw new Error('Failed to create delivery order')
    }
  }

  async getOrderStatus(lalamoveOrderId: string): Promise<LalamoveOrderResponse> {
    try {
      const zai = await this.initialize()
      
      const response = await zai.functions.invoke('lalamove_get_order_status', {
        orderId: lalamoveOrderId
      })

      return {
        orderId: response.orderId,
        status: response.status,
        driver: response.driver,
        trackingUrl: response.trackingUrl,
        estimatedPickupTime: response.estimatedPickupTime,
        estimatedDeliveryTime: response.estimatedDeliveryTime,
        price: response.price
      }
    } catch (error) {
      console.error('Error getting Lalamove order status:', error)
      throw new Error('Failed to get order status')
    }
  }

  async cancelOrder(lalamoveOrderId: string, reason?: string): Promise<boolean> {
    try {
      const zai = await this.initialize()
      
      await zai.functions.invoke('lalamove_cancel_order', {
        orderId: lalamoveOrderId,
        reason: reason
      })

      return true
    } catch (error) {
      console.error('Error cancelling Lalamove order:', error)
      throw new Error('Failed to cancel order')
    }
  }

  // Helper method to geocode address (convert address to coordinates)
  async geocodeAddress(address: string): Promise<{ lat: number; lng: number }> {
    try {
      const zai = await this.initialize()
      
      const response = await zai.functions.invoke('geocode_address', {
        address: address
      })

      return {
        lat: response.lat,
        lng: response.lng
      }
    } catch (error) {
      console.error('Error geocoding address:', error)
      // Return default coordinates for São Paulo as fallback
      return {
        lat: -23.5505,
        lng: -46.6333
      }
    }
  }

  // Helper method to calculate delivery quote based on order details
  async calculateDeliveryQuote(
    pickupAddress: string,
    deliveryAddress: string,
    orderValue: number
  ): Promise<LalamoveQuoteResponse> {
    try {
      // Geocode both addresses
      const pickupCoords = await this.geocodeAddress(pickupAddress)
      const deliveryCoords = await this.geocodeAddress(deliveryAddress)

      // Determine vehicle type based on order size
      const vehicleType: 'MOTORCYCLE' | 'CAR' | 'VAN' = this.determineVehicleType(orderValue)

      const quoteRequest: LalamoveQuoteRequest = {
        pickup: {
          address: pickupAddress,
          coordinates: pickupCoords
        },
        delivery: {
          address: deliveryAddress,
          coordinates: deliveryCoords
        },
        vehicleType,
        serviceType: 'INSTANT'
      }

      return await this.getQuote(quoteRequest)
    } catch (error) {
      console.error('Error calculating delivery quote:', error)
      throw new Error('Failed to calculate delivery quote')
    }
  }

  private determineVehicleType(orderValue: number): 'MOTORCYCLE' | 'CAR' | 'VAN' {
    // Simple logic to determine vehicle type based on order value
    // In a real implementation, this would consider order size, weight, and items
    if (orderValue < 50) {
      return 'MOTORCYCLE'
    } else if (orderValue < 200) {
      return 'CAR'
    } else {
      return 'VAN'
    }
  }

  // Method to dispatch driver for an order
  async dispatchDriverForOrder(order: any): Promise<LalamoveOrderResponse> {
    try {
      // Restaurant address (this should come from restaurant settings)
      const restaurantAddress = "Av. Paulista, 1000, Bela Vista, São Paulo - SP"
      const restaurantCoords = await this.geocodeAddress(restaurantAddress)

      // Delivery address
      const deliveryAddress = `${order.deliveryAddress}, ${order.deliveryNeighborhood}, ${order.deliveryCity} - ${order.deliveryState}`
      const deliveryCoords = await this.geocodeAddress(deliveryAddress)

      // Get delivery quote first
      const quote = await this.calculateDeliveryQuote(restaurantAddress, deliveryAddress, order.total)

      // Create the order
      const orderRequest: LalamoveOrderRequest = {
        quotaId: quote.quotaId,
        pickup: {
          address: restaurantAddress,
          coordinates: restaurantCoords,
          contactName: "SALGADO BOX",
          contactPhone: "+5511999999999", // Restaurant phone
          instructions: "Pedido de comida. Verificar pedido com cliente."
        },
        delivery: {
          address: deliveryAddress,
          coordinates: deliveryCoords,
          contactName: order.customerName,
          contactPhone: order.customerPhone,
          instructions: order.deliveryInstructions || "Entregar na portaria"
        },
        orderDetails: {
          orderId: order.orderNumber,
          totalValue: order.total,
          items: order.orderItems.map((item: any) => ({
            name: item.name,
            quantity: item.quantity,
            category: 'food'
          }))
        },
        paymentMethod: 'CASH' // Most food deliveries use cash on delivery
      }

      return await this.createOrder(orderRequest)
    } catch (error) {
      console.error('Error dispatching driver for order:', error)
      throw new Error('Failed to dispatch driver')
    }
  }
}

export const lalamoveService = new LalamoveService()