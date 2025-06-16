
import { NextResponse } from 'next/server';
import { PAYWAY_CONFIG } from '@/lib/payway-config';
import { decryptData } from '@/lib/payway-encrypt';

export async function POST(request: Request) {
  try {
    // Decrypt data
    const encryptedData = request.headers.get('X-Encrypted-Data')!;
    const { orderId, amount } = JSON.parse(decryptData(encryptedData));

    // Generate transaction ID
    const transactionId = `${PAYWAY_CONFIG.merchantId}${new Date()
      .toISOString()
      .replace(/[-:T.]/g, '')
      .slice(0, 14)}${Math.floor(1000 + Math.random() * 9000)}`;

    // Prepare payload
    const payload = {
      merchant_id: PAYWAY_CONFIG.merchantId,
      transaction_id: transactionId,
      amount: amount.toFixed(2),
      currency: 'USD',
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order_id=${orderId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel?order_id=${orderId}`,
    };

    // Call PayWay API
    const response = await fetch(`${PAYWAY_CONFIG.baseUrl}/payment`, {
      method: 'POST',
      headers: {
        'Content-Type': 'application/json',
        'Authorization': `Bearer ${PAYWAY_CONFIG.apiKey}`
      },
      body: JSON.stringify(payload)
    });

    return NextResponse.json(await response.json());
  } catch (error) {
    return NextResponse.json(
      { error: 'Failed to create payment session' },
      { status: 500 }
    );
  }
}