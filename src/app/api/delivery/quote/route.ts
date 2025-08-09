import { NextRequest, NextResponse } from 'next/server';
import { deliveryService, DeliveryRequest } from '@/lib/delivery-service';

export async function POST(request: NextRequest) {
  try {
    const body = await request.json();
    
    // Validar dados da requisição
    const deliveryRequest: DeliveryRequest = {
      orderId: body.orderId,
      pickupAddress: body.pickupAddress,
      deliveryAddress: body.deliveryAddress,
      items: body.items || [],
      specialInstructions: body.specialInstructions,
      priority: body.priority || 'normal',
      scheduledTime: body.scheduledTime ? new Date(body.scheduledTime) : undefined
    };

    // Obter cotações de diferentes provedores
    const quotes = await deliveryService.getQuote(deliveryRequest);

    return NextResponse.json({
      success: true,
      quotes,
      requestId: `quote_${Date.now()}`
    });

  } catch (error) {
    console.error('Error getting delivery quote:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to get delivery quote' 
      },
      { status: 500 }
    );
  }
}