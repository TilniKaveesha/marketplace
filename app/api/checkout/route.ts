import { type NextRequest, NextResponse } from "next/server"
import { createSessionClient } from "@/lib/appwrite"
import { APP_CONFIG } from "@/lib/app-config"
import { ID } from "node-appwrite"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const {
      firstName,
      lastName,
      email,
      phone,
      address,
      city,
      postalCode,
      paymentMethod,
      currency = "USD",
      quantity,
      listingId,
      shopId,
      amount,
      items,
    } = body

    // Get current user session
    const { account, databases } = await createSessionClient()

    let user
    try {
      user = await account.get()
    } catch (error) {
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Create order document
    const orderId = ID.unique()
    const orderData = {
      orderId,
      userId: user.$id,
      listingId,
      shopId,
      status: "pending",
      paymentMethod,
      paymentStatus: paymentMethod === "cash_on_delivery" ? "pending" : "unpaid",
      currency,
      amount,
      quantity,
      items: JSON.stringify(items),
      customer: JSON.stringify({
        firstName,
        lastName,
        email,
        phone,
      }),
      shipping: JSON.stringify({
        address,
        city,
        postalCode,
      }),
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    const order = await databases.createDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      orderId,
      orderData,
    )

    // Create notification for shop owner
    try {
      await databases.createDocument(
        APP_CONFIG.APPWRITE.DATABASE_ID,
        APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID,
        ID.unique(),
        {
          userId: shopId, // Assuming shopId is the shop owner's user ID
          type: "new_order",
          title: "New Order Received",
          message: `You have received a new ${paymentMethod} order for ${items[0]?.name}`,
          data: JSON.stringify({ orderId, listingId }),
          read: false,
          createdAt: new Date().toISOString(),
        },
      )
    } catch (notificationError) {
      console.error("Failed to create notification:", notificationError)
      // Don't fail the order creation if notification fails
    }

    return NextResponse.json({
      success: true,
      orderId,
      order,
      message: "Order created successfully",
    })
  } catch (error: any) {
    console.error("Checkout error:", error)
    return NextResponse.json({ error: error.message || "Failed to create order" }, { status: 500 })
  }
}
