import { type NextRequest, NextResponse } from "next/server"
import { createAnonymousClient } from "@/lib/appwrite"
import { APP_CONFIG } from "@/lib/app-config"
import { verifyCallbackHash } from "@/lib/aba-payway-utils"
import { ID } from "node-appwrite"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("ABA PayWay callback received:", body)

    const { hash, payment_status, transaction_id, order_id, amount, currency } = body

    // Verify hash
    const dataString = JSON.stringify({
      payment_status,
      transaction_id,
      order_id,
      amount,
      currency,
    })

    if (!verifyCallbackHash(dataString, hash)) {
      console.error("Hash verification failed")
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 })
    }

    console.log("Hash verification successful")

    // Use anonymous client for webhook processing
    const { databases } = createAnonymousClient()

    // Find order by transaction ID
    const orders = await databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID, [
      `transactionId=${transaction_id}`,
    ])

    if (orders.documents.length === 0) {
      console.error("Order not found for transaction:", transaction_id)
      return NextResponse.json({ error: "Order not found" }, { status: 404 })
    }

    const order = orders.documents[0]
    console.log("Found order:", order.$id)

    // Update order status based on payment status
    const updateData: any = {
      paymentStatus: payment_status === "success" ? "paid" : "failed",
      updatedAt: new Date().toISOString(),
    }

    if (payment_status === "success") {
      updateData.status = "confirmed"
      updateData.paidAt = new Date().toISOString()
    }

    const updatedOrder = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      order.$id,
      updateData,
    )

    console.log("Order updated successfully:", updatedOrder.$id)

    // Create notification for buyer
    try {
      await databases.createDocument(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID, ID.unique(), {
        userId: order.buyerId,
        type: payment_status === "success" ? "payment_success" : "payment_failed",
        title: payment_status === "success" ? "Payment Successful" : "Payment Failed",
        message:
          payment_status === "success"
            ? "Your payment has been processed successfully"
            : "Your payment could not be processed. Please try again.",
        orderId: order.$id,
        isRead: false,
        createdAt: new Date().toISOString(),
      })

      // Also notify seller if payment successful
      if (payment_status === "success") {
        await databases.createDocument(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID, ID.unique(), {
          userId: order.sellerId,
          type: "payment_received",
          title: "Payment Received",
          message: "Payment has been received for your order. Please prepare the item for shipping.",
          orderId: order.$id,
          isRead: false,
          createdAt: new Date().toISOString(),
        })
      }
    } catch (notificationError) {
      console.error("Failed to create notifications:", notificationError)
    }

    return NextResponse.json({
      success: true,
      message: "Callback processed successfully",
    })
  } catch (error: any) {
    console.error("Callback processing error:", error)
    return NextResponse.json(
      {
        error: "Failed to process callback",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
