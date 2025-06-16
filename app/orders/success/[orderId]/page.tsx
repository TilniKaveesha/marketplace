import { APP_CONFIG } from "@/lib/app-config";
import { createSessionClient } from "@/lib/appwrite";
import Link from "next/link";
import { notFound, redirect } from "next/navigation";
//import { Query } from "node-appwrite";

export default async function OrderSuccessPage({
  params,
}: {
  params: { orderId: string };
}) {
  const { databases } = await createSessionClient();
  
  try {
    const order = await databases.getDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      params.orderId
    );

    return (
      <div className="container mx-auto px-4 py-8">
        <div className="max-w-2xl mx-auto text-center">
          <h1 className="text-3xl font-bold mb-4">Order Confirmed!</h1>
          <p className="text-lg mb-6">
            Thank you for your purchase of <strong>{order.listingTitle}</strong>
          </p>
          
          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Order Details</h2>
            <p>Order ID: {order.$id}</p>
            <p>Amount: ${Number(order?.price || 0).toFixed(2)}</p>
            <p>Status: {order?.status || "Pending"}</p>

          </div>

          <div className="flex justify-center gap-4">
            <Link href="/orders" className="btn btn-primary">
              View All Orders
            </Link>
            <Link href="/search" className="btn btn-outline">
              Continue Shopping
            </Link>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    console.error("Error fetching order:", error);
    notFound();
  }
}