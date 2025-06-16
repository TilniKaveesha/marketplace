// app/payment/success/page.tsx
"use client";
import { useEffect } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { toast } from 'sonner';

export default function PaymentSuccess() {
  const params = useSearchParams();
  const router = useRouter();

  useEffect(() => {
    const verifyPayment = async () => {
      const orderId = params.get('order_id');
      try {
        const res = await fetch(`/api/checkout/${orderId}/verify`, {
          method: 'POST'
        });
        
        if (res.ok) {
          toast.success('Payment verified!');
          router.push(`/orders/sucess/${orderId}`);
        } else {
          throw new Error('Verification failed');
        }
      } catch (error) {
        toast.error('Payment verification failed');
        router.push('/checkout');
      }
    };

    verifyPayment();
  }, [params, router]);

  return <div className="p-8 text-center">Verifying payment...</div>;
}