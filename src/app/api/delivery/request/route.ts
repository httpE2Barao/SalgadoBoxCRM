import { NextRequest, NextResponse } from 'next/server';
import { deliveryService, DeliveryRequest } from '@/lib/delivery-service';
import { db } from '@/lib/db';

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

    const provider = body.provider || 'local';

    // Solicitar motorista
    const deliveryResponse = await deliveryService.requestDriver(deliveryRequest, provider);

    if (deliveryResponse.success) {
      // Atualizar pedido com informações de entrega
      await db.order.update({
        where: { id: body.orderId },
        data: {
          lalamoveOrderId: deliveryResponse.deliveryId,
          lalamoveTrackingUrl: deliveryResponse.trackingUrl,
          lalamoveDriverInfo: deliveryResponse.driver
        }
      });

      // Criar registro de status da entrega
      await db.orderStatusHistory.create({
        data: {
          orderId: body.orderId,
          status: 'CONFIRMED',
          notes: `Delivery requested via ${provider}. Driver: ${deliveryResponse.driver?.name}`
        }
      });
    }

    return NextResponse.json({
      success: deliveryResponse.success,
      delivery: deliveryResponse,
      provider
    });

  } catch (error) {
    console.error('Error requesting delivery:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to request delivery' 
      },
      { status: 500 }
    );
  }
}