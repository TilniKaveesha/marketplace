import { NextRequest, NextResponse } from "next/server";
import { createSessionClient } from "@/lib/appwrite";
import { ID } from "appwrite";
import { APP_CONFIG } from "@/lib/app-config";

export async function POST(req: NextRequest) {
  try {
    const { orderId, buyerId, itemId, sellerId } = await req.json();

    if (!orderId || !buyerId || !itemId || !sellerId) {
      return NextResponse.json(
        { error: "Missing required fields (orderId, buyerId, itemId, sellerId)" },
        { status: 400 }
      );
    }

    const { databases } = await createSessionClient();
    const DB_ID = APP_CONFIG.APPWRITE.DATABASE_ID;
    const ORDERS_COLLECTION = APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID;
    const NOTIFICATIONS_COLLECTION =APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID;

    // Get order and verify it exists
    const order = await databases.getDocument(DB_ID, ORDERS_COLLECTION, orderId);
    if (!order) {
      return NextResponse.json({ error: "Order not found" }, { status: 404 });
    }

    // Update order status to "paid"
    await databases.updateDocument(DB_ID, ORDERS_COLLECTION, orderId, {
      status: "paid",
    });

    // Create a notification for the seller
    await databases.createDocument(DB_ID, NOTIFICATIONS_COLLECTION, ID.unique(), {
      userId: sellerId,
      type: "order_paid",
      message: `Your item (ID: ${itemId}) has been purchased by user ${buyerId}.`,
      orderId,
      itemId,
      buyerId,
      read: "false",
    });

    return NextResponse.json({ success: true });
  } catch (error: any) {
    console.error("Payment confirm error:", error.message || error);
    return NextResponse.json({ error: "Internal error" }, { status: 500 });
  }
}
