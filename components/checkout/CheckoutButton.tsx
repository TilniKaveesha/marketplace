"use client";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { toast } from "@/hooks/use-toast";

export function CheckoutButton({ listingId, price, sellerId }: { listingId: string | undefined; price: number; sellerId: string | undefined }) {
  const router = useRouter();
  const [isLoading, setIsLoading] = useState(false);

  const handleCheckout = async () => {
    setIsLoading(true);
    try {
      const res = await fetch("/api/current-user");
      const { user } = await res.json();

      if (!user) {
        router.push(`/login?redirect=/listings/${listingId}`);
        return;
      }

      const checkoutRes = await fetch("/api/checkout", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          userId: user.$id,
          listingId,
          price,
          status: 'pending',
          sellerId,
        }),
      });

      if (!checkoutRes.ok) throw new Error("Checkout failed");

      const { order, message } = await checkoutRes.json();

      const paywayRes = await fetch('/api/payway/create-session', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          orderId: order.$id,
          amount: price,
          //callbackUrl: `${window.location.origin}/payment/return?order_id=${order.$id}`,
        }),
      });

      const { paymentUrl } = await paywayRes.json();

      toast({ title: "Success", description: "Order placed successfully!" });

      // Redirect to Payway payment URL or to success page
      router.push(paymentUrl); // or `/orders/success/${order.$id}`
    } catch (error) {
      toast({ title: "Error", description: "Failed to place order", variant: "destructive" });
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <Button 
      onClick={handleCheckout} 
      disabled={isLoading}
      className="w-full mt-4"
    >
      {isLoading ? "Processing..." : `Buy Now ($${price.toFixed(2)})`}
    </Button>
  );
}
