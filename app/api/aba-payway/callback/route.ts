import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/appwrite"
import { APP_CONFIG } from "@/lib/app-config"
import { ID } from "node-appwrite"
import { verifyCallbackHash, decodeBase64, type ABACallbackData } from "@/lib/aba-payway-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🔔 ABA Callback received:", body)

    const callbackData: ABACallbackData = body

    // Verify the callback hash for security
    if (!verifyCallbackHash(callbackData)) {
      console.error("❌ Invalid callback hash")
      return NextResponse.json({ error: "Invalid hash" }, { status: 400 })
    }

    const { databases } = await createAdminClient()

    // Extract transaction ID
    const transactionId = callbackData.tran_id

    if (!transactionId) {
      console.error("❌ No transaction ID in callback")
      return NextResponse.json({ error: "Missing transaction ID" }, { status: 400 })
    }

    // Get the transaction from database
    let transaction
    try {
      transaction = await databases.getDocument(
        APP_CONFIG.APPWRITE.DATABASE_ID,
        APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
        transactionId,
      )
    } catch (error: any) {
      console.error("❌ Transaction not found:", transactionId)
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    // Determine payment status based on ABA callback
    let paymentStatus = "pending"
    let orderStatus = "pending"

    if (callbackData.status === "0" || callbackData.status === "success") {
      paymentStatus = "completed"
      orderStatus = "confirmed"
    } else {
      paymentStatus = "failed"
      orderStatus = "cancelled"
    }

    console.log("💳 Updating payment status:", {
      transactionId,
      paymentStatus,
      orderStatus,
      amount: callbackData.amount,
    })

    // Update transaction in database
    const updatedTransaction = await databases.updateDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      transactionId,
      {
        paymentStatus,
        status: orderStatus,
        paidAt: paymentStatus === "completed" ? new Date().toISOString() : null,
        updatedAt: new Date().toISOString(),
        abaCallbackData: JSON.stringify(callbackData),
      },
    )

    console.log("✅ Transaction updated successfully")

    // Create notifications
    try {
      // Notify buyer
      if (transaction.buyerId) {
        await databases.createDocument(
          APP_CONFIG.APPWRITE.DATABASE_ID,
          APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID,
          ID.unique(),
          {
            userId: transaction.buyerId,
            type: paymentStatus === "completed" ? "payment_success" : "payment_failed",
            title: paymentStatus === "completed" ? "Payment Successful" : "Payment Failed",
            message:
              paymentStatus === "completed"
                ? `Your payment of $${callbackData.amount} has been processed successfully.`
                : `Your payment of $${callbackData.amount} could not be processed.`,
            data: JSON.stringify({ transactionId, amount: callbackData.amount }),
            read: false,
            createdAt: new Date().toISOString(),
          },
        )
      }

      // Notify seller if payment successful
      if (paymentStatus === "completed" && transaction.sellerId) {
        await databases.createDocument(
          APP_CONFIG.APPWRITE.DATABASE_ID,
          APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID,
          ID.unique(),
          {
            userId: transaction.sellerId,
            type: "order_paid",
            title: "Order Payment Received",
            message: `You have received a payment of $${callbackData.amount} for your order.`,
            data: JSON.stringify({ transactionId, amount: callbackData.amount }),
            read: false,
            createdAt: new Date().toISOString(),
          },
        )
      }

      console.log("🔔 Notifications created")
    } catch (notificationError) {
      console.error("⚠️ Failed to create notifications:", notificationError)
    }

    // Return success response to ABA
    return NextResponse.json({
      success: true,
      message: "Callback processed successfully",
      transactionId,
      status: paymentStatus,
    })
  } catch (error: any) {
    console.error("💥 Callback processing error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to process callback",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
