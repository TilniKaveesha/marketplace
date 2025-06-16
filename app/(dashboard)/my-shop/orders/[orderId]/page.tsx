import { updateOrderStatus } from "@/lib/actions";
import { APP_CONFIG } from "@/lib/app-config";
import { createSessionClient } from "@/lib/appwrite";
import { notFound } from "next/navigation";


export default async function OrderManagementPage({
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
        <div className="max-w-2xl mx-auto">
          <h1 className="text-2xl font-bold mb-4">Order #{order.$id}</h1>

          <div className="bg-gray-50 p-6 rounded-lg mb-6">
            <h2 className="text-xl font-semibold mb-2">Order Details</h2>
            <p>Listing: {order.listingTitle}</p>
            <p>Customer: {order.customerName}</p>
            <p>Amount: ${Number(order.price).toFixed(2)}</p>
            <p>Current Status: {order.status}</p>
          </div>

          <div className="space-y-2">
            <h3 className="font-semibold">Update Order Status:</h3>

            <form action={() => updateOrderStatus(order.$id, "processing")}>
              <button type="submit" className="btn btn-sm mr-2">
                Mark as Processing
              </button>
            </form>

            <form action={() => updateOrderStatus(order.$id, "shipped")}>
              <button type="submit" className="btn btn-sm mr-2">
                Mark as Shipped
              </button>
            </form>

            <form action={() => updateOrderStatus(order.$id, "delivered")}>
              <button type="submit" className="btn btn-sm">
                Mark as Delivered
              </button>
            </form>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    notFound();
  }
}
