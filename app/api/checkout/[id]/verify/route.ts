import { APP_CONFIG } from "@/lib/app-config"
import { createSessionClient } from "@/lib/appwrite"
import { type NextRequest, NextResponse } from "next/server"

export const dynamic = "force-dynamic"

export const POST = async (req: NextRequest, { params }: { params: { id: string } }) => {
  try {
    const { databases } = await createSessionClient()
    const { transactionId } = await req.json()
    const orderId = params.id

    // Update order status to paid
    const updatedOrder = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      orderId,
      {
        status: "paid",
        transactionId,
        paidAt: new Date().toISOString(),
      },
    )

    // Get order details for notification
    const order = await databases.getDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      orderId,
    )

    // Create notification for buyer
    await databases.createDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID,
      "unique()",
      {
        userId: order.userId,
        type: "payment",
        message: `Payment confirmed for ${order.listingTitle}`,
        read: "false",
        link: `/orders/success/${orderId}`,
        relatedId: orderId,
        timestamp: new Date().toISOString(),
      },
    )

    return NextResponse.json({
      message: "Payment verified successfully",
      order: updatedOrder,
    })
  } catch (error: any) {
    console.log("Payment verification error:", error)
    return NextResponse.json(
      {
        message: error.message || "Failed to verify payment",
      },
      {
        status: 500,
      },
    )
  }
}
