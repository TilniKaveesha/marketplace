import { APP_CONFIG } from "@/lib/app-config";
import { createSessionClient } from "@/lib/appwrite";
import Link from "next/link";
import { Query } from "node-appwrite";

export default async function SellerOrdersPage() {
  const { account, databases } = await createSessionClient();
  const user = await account.get();
  
  // First get the seller's shop
  const shops = await databases.listDocuments(
    APP_CONFIG.APPWRITE.DATABASE_ID,
    APP_CONFIG.APPWRITE.SHOP_ID,
    [Query.equal("userId", user.$id)]
  );
  
  if (shops.documents.length === 0) {
    return (
      <div className="container mx-auto px-4 py-8">
        <p>You don't have any shop yet.</p>
      </div>
    );
  }

  // Then get orders for this shop
  const orders = await databases.listDocuments(
    APP_CONFIG.APPWRITE.DATABASE_ID,
    APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
    [Query.equal("shopId", shops.documents[0].$id)]
  );

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-2xl font-bold mb-6">Your Shop Orders</h1>
      
      {orders.documents.length === 0 ? (
        <p>No orders yet.</p>
      ) : (
        <div className="space-y-4">
          {orders.documents.map((order) => (
            <div key={order.$id} className="border rounded-lg p-4">
              <div className="flex justify-between items-start">
                <div>
                  <h3 className="font-semibold">{order.listingTitle}</h3>
                  <p className="text-sm text-gray-500">
                    Ordered on {new Date(order.$createdAt).toLocaleDateString()}
                  </p>
                  <p className="text-sm">Customer: {order.customerName}</p>
                </div>
                <span className="badge">
                  {order.status}
                </span>
              </div>
              
              <div className="mt-4 flex justify-between items-center">
                <p className="font-bold">${order.price.toFixed(2)}</p>
                <Link href={`/seller/orders/${order.$id}`} className="btn btn-sm">
                  Manage Order
                </Link>
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}