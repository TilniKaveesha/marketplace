// app/payment/cancel/page.tsx
"use client";
import { useSearchParams, useRouter } from 'next/navigation';
import { useEffect } from 'react';
import { toast } from 'sonner';

export default function PaymentCancel() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const orderId = params.get('order_id');
    toast.warning('Payment was cancelled');
    router.push(`/listings/${orderId}`); // Redirect back to product
  }, [params, router]);

  return (
    <div className="text-center p-8">
      <h1 className="text-2xl font-bold mb-2">Payment Cancelled</h1>
      <p>You can try again or choose another payment method.</p>
    </div>
  );
}