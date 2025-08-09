import { Order } from '@prisma/client';

export interface DeliveryDriver {
  id: string;
  name: string;
  phone: string;
  vehicle: string;
  licensePlate: string;
  rating: number;
  status: 'available' | 'busy' | 'offline';
  location: {
    lat: number;
    lng: number;
  };
  estimatedArrival: number; // in minutes
}

export interface DeliveryQuote {
  id: string;
  provider: 'lalamove' | 'uber' | 'local';
  price: number;
  currency: string;
  estimatedDuration: number; // in minutes
  distance: number; // in km
  driver?: DeliveryDriver;
}

export interface DeliveryRequest {
  orderId: string;
  pickupAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    lat?: number;
    lng?: number;
  };
  deliveryAddress: {
    street: string;
    number: string;
    neighborhood: string;
    city: string;
    state: string;
    zipCode: string;
    lat?: number;
    lng?: number;
  };
  items: {
    name: string;
    quantity: number;
    size?: string;
  }[];
  specialInstructions?: string;
  priority: 'normal' | 'urgent' | 'scheduled';
  scheduledTime?: Date;
}

export interface DeliveryResponse {
  success: boolean;
  deliveryId?: string;
  trackingUrl?: string;
  driver?: DeliveryDriver;
  estimatedPickup?: Date;
  estimatedDelivery?: Date;
  error?: string;
}

class DeliveryService {
  private providers: Map<string, any> = new Map();

  constructor() {
    this.initializeProviders();
  }

  private initializeProviders() {
    // Inicializar provedores de entrega
    this.providers.set('lalamove', new LalamoveProvider());
    this.providers.set('local', new LocalDriverProvider());
  }

  /**
   * Obter cotação de entrega
   */
  async getQuote(request: DeliveryRequest): Promise<DeliveryQuote[]> {
    const quotes: DeliveryQuote[] = [];

    for (const [providerName, provider] of this.providers) {
      try {
        const quote = await provider.getQuote(request);
        quotes.push(quote);
      } catch (error) {
        console.error(`Error getting quote from ${providerName}:`, error);
      }
    }

    return quotes.sort((a, b) => a.price - b.price);
  }

  /**
   * Solicitar motorista
   */
  async requestDriver(request: DeliveryRequest, provider: string = 'lalamove'): Promise<DeliveryResponse> {
    const deliveryProvider = this.providers.get(provider);
    
    if (!deliveryProvider) {
      return {
        success: false,
        error: `Provider ${provider} not available`
      };
    }

    try {
      return await deliveryProvider.requestDelivery(request);
    } catch (error) {
      console.error(`Error requesting delivery from ${provider}:`, error);
      return {
        success: false,
        error: error instanceof Error ? error.message : 'Unknown error'
      };
    }
  }

  /**
   * Rastrear entrega
   */
  async trackDelivery(deliveryId: string, provider: string = 'lalamove'): Promise<any> {
    const deliveryProvider = this.providers.get(provider);
    
    if (!deliveryProvider) {
      throw new Error(`Provider ${provider} not available`);
    }

    return await deliveryProvider.trackDelivery(deliveryId);
  }

  /**
   * Cancelar entrega
   */
  async cancelDelivery(deliveryId: string, provider: string = 'lalamove', reason?: string): Promise<boolean> {
    const deliveryProvider = this.providers.get(provider);
    
    if (!deliveryProvider) {
      throw new Error(`Provider ${provider} not available`);
    }

    return await deliveryProvider.cancelDelivery(deliveryId, reason);
  }
}

// Provedor Lalamove (simulado)
class LalamoveProvider {
  async getQuote(request: DeliveryRequest): Promise<DeliveryQuote> {
    // Simulação - em produção, integraria com API real do Lalamove
    const basePrice = 15.00;
    const distance = this.calculateDistance(request.pickupAddress, request.deliveryAddress);
    const price = basePrice + (distance * 2.5);
    
    return {
      id: `lalamove_${Date.now()}`,
      provider: 'lalamove',
      price: Math.round(price * 100) / 100,
      currency: 'BRL',
      estimatedDuration: Math.round(15 + distance * 3),
      distance: Math.round(distance * 100) / 100
    };
  }

  async requestDelivery(request: DeliveryRequest): Promise<DeliveryResponse> {
    // Simulação de chamada à API do Lalamove
    await new Promise(resolve => setTimeout(resolve, 2000)); // Simular delay da API

    const mockDriver: DeliveryDriver = {
      id: 'driver_' + Math.random().toString(36).substr(2, 9),
      name: 'João Silva',
      phone: '+5511999999999',
      vehicle: 'Moto Honda CG',
      licensePlate: 'ABC1234',
      rating: 4.8,
      status: 'available',
      location: {
        lat: -23.5505,
        lng: -46.6333
      },
      estimatedArrival: 15
    };

    return {
      success: true,
      deliveryId: 'lalamove_order_' + Math.random().toString(36).substr(2, 9),
      trackingUrl: `https://track.lalamove.com/order/${request.orderId}`,
      driver: mockDriver,
      estimatedPickup: new Date(Date.now() + 15 * 60000),
      estimatedDelivery: new Date(Date.now() + 45 * 60000)
    };
  }

  async trackDelivery(deliveryId: string): Promise<any> {
    // Simulação de rastreamento
    return {
      status: 'on_the_way',
      driverLocation: {
        lat: -23.5505,
        lng: -46.6333
      },
      estimatedArrival: 15,
      progress: 65
    };
  }

  async cancelDelivery(deliveryId: string, reason?: string): Promise<boolean> {
    // Simulação de cancelamento
    console.log(`Canceling Lalamove delivery ${deliveryId}. Reason: ${reason}`);
    return true;
  }

  private calculateDistance(pickup: any, delivery: any): number {
    // Simulação de cálculo de distância
    return Math.random() * 10 + 2; // 2-12 km
  }
}

// Provedor de motoristas locais (para testes e desenvolvimento)
class LocalDriverProvider {
  private availableDrivers: DeliveryDriver[] = [
    {
      id: 'local_driver_1',
      name: 'Carlos Santos',
      phone: '+5511988888888',
      vehicle: 'Carro Fiat Uno',
      licensePlate: 'XYZ5678',
      rating: 4.9,
      status: 'available',
      location: { lat: -23.5505, lng: -46.6333 },
      estimatedArrival: 20
    },
    {
      id: 'local_driver_2',
      name: 'Ana Oliveira',
      phone: '+5511977777777',
      vehicle: 'Moto Yamaha Factor',
      licensePlate: 'DEF9012',
      rating: 4.7,
      status: 'available',
      location: { lat: -23.5515, lng: -46.6343 },
      estimatedArrival: 12
    }
  ];

  async getQuote(request: DeliveryRequest): Promise<DeliveryQuote> {
    const basePrice = 12.00;
    const distance = this.calculateDistance(request.pickupAddress, request.deliveryAddress);
    const price = basePrice + (distance * 2.0);
    
    const availableDriver = this.availableDrivers.find(d => d.status === 'available');
    
    return {
      id: `local_${Date.now()}`,
      provider: 'local',
      price: Math.round(price * 100) / 100,
      currency: 'BRL',
      estimatedDuration: Math.round(20 + distance * 2),
      distance: Math.round(distance * 100) / 100,
      driver: availableDriver
    };
  }

  async requestDelivery(request: DeliveryRequest): Promise<DeliveryResponse> {
    const availableDriver = this.availableDrivers.find(d => d.status === 'available');
    
    if (!availableDriver) {
      return {
        success: false,
        error: 'No drivers available'
      };
    }

    // Simular aceitação do motorista
    await new Promise(resolve => setTimeout(resolve, 3000));

    // Atualizar status do motorista
    availableDriver.status = 'busy';

    return {
      success: true,
      deliveryId: 'local_order_' + Math.random().toString(36).substr(2, 9),
      trackingUrl: `http://localhost:3000/tracking/${request.orderId}`,
      driver: availableDriver,
      estimatedPickup: new Date(Date.now() + 20 * 60000),
      estimatedDelivery: new Date(Date.now() + 50 * 60000)
    };
  }

  async trackDelivery(deliveryId: string): Promise<any> {
    return {
      status: 'preparing',
      driverLocation: {
        lat: -23.5505,
        lng: -46.6333
      },
      estimatedArrival: 20,
      progress: 30
    };
  }

  async cancelDelivery(deliveryId: string, reason?: string): Promise<boolean> {
    // Liberar motorista
    const driver = this.availableDrivers.find(d => d.status === 'busy');
    if (driver) {
      driver.status = 'available';
    }
    
    console.log(`Canceling local delivery ${deliveryId}. Reason: ${reason}`);
    return true;
  }

  private calculateDistance(pickup: any, delivery: any): number {
    return Math.random() * 8 + 1; // 1-9 km
  }
}

export const deliveryService = new DeliveryService();