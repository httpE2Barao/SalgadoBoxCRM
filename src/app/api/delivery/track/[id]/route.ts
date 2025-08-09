import { NextRequest, NextResponse } from 'next/server';
import { deliveryService } from '@/lib/delivery-service';

export async function GET(
  request: NextRequest,
  { params }: { params: { id: string } }
) {
  try {
    const deliveryId = params.id;
    const provider = request.nextUrl.searchParams.get('provider') || 'local';

    // Rastrear entrega
    const trackingInfo = await deliveryService.trackDelivery(deliveryId, provider);

    return NextResponse.json({
      success: true,
      tracking: trackingInfo,
      deliveryId,
      provider
    });

  } catch (error) {
    console.error('Error tracking delivery:', error);
    return NextResponse.json(
      { 
        success: false, 
        error: error instanceof Error ? error.message : 'Failed to track delivery' 
      },
      { status: 500 }
    );
  }
}