import { NextRequest, NextResponse } from 'next/server';
import { deliveryService } from '@/lib/delivery-service';
import { db } from '@/lib/db';

export async function POST(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryId = params.id;
    const body = await request.json();
    const provider = body.provider || 'local';
    const reason = body.reason;

    // Cancelar entrega
    const cancelled = await deliveryService.cancelDelivery(deliveryId, provider, reason);

    if (cancelled) {
      // Atualizar pedido
      await db.order.updateMany({
        where: { 
          OR: [
            { lalamoveOrderId: deliveryId },
            { id: deliveryId }
          ]
        },
        data: {
          status: 'CANCELLED',
          cancellationReason: reason || 'Delivery cancelled'
        }
      });

      // Criar registro de status
      const orders = await db.order.findMany({
        where: { 
          OR: [
            { lalamoveOrderId: deliveryId },
            { id: deliveryId }
          ]
        }
      });

      for (const order of orders) {
        await db.orderStatusHistory.create({
          data: {
            orderId: order.id,
            status: 'CANCELLED',
            notes: `Delivery cancelled. Reason: ${reason || 'Not specified'}`
          }
        });
      }
    }

    return NextResponse.json({
      success: cancelled,
      deliveryId,
      provider,
      message: cancelled ? 'Delivery cancelled successfully' : 'Failed to cancel delivery'
    });

  } catch (error) {
    console.error('Error cancelling delivery:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to cancel delivery' 
      },
      { status: 500 }
    );
  }
}