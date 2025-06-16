// app/api/payway/webhook/route.ts
import { NextResponse } from 'next/server';
import { PAYWAY_CONFIG } from '@/lib/payway-config';
import { decryptData } from '@/lib/payway-encrypt';

export async function POST(request: Request) {
  try {
    const payload = await request.json();
    
    // Verify payload (add your logic)
    const isValid = true; // Implement actual verification

    if (isValid) {
      // Update order status in your database
      await fetch(`/api/checkout/${payload.transaction_id}/confirm`, {
        method: 'POST',
        body: JSON.stringify({
          status: 'paid',
          amount: payload.amount
        })
      });
      
      return NextResponse.json({ success: true });
    }
    
    return NextResponse.json({ error: 'Invalid payload' }, { status: 400 });
  } catch (error) {
    return NextResponse.json(
      { error: 'Webhook processing failed' },
      { status: 500 }
    );
  }
}