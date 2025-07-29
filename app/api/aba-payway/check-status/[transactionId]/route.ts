import { type NextRequest, NextResponse } from "next/server"
import { createAnonymousClient } from "@/lib/appwrite"
import { APP_CONFIG } from "@/lib/app-config"

export async function GET(request: NextRequest, { params }: { params: { transactionId: string } }) {
  try {
    const { transactionId } = params
    console.log("Checking status for transaction:", transactionId)

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    // Use anonymous client for status checking
    const { databases } = createAnonymousClient()

    // Find order by transaction ID
    const orders = await databases.listDocuments(APP_CONFIG.APPWRITE.DATABASE_ID, APP_CONFIG.APPWRITE.ORDERS_COLLECTION_ID, [
      `transactionId=${transactionId}`,
    ])

    if (orders.documents.length === 0) {
      return NextResponse.json({ error: "Transaction not found" }, { status: 404 })
    }

    const order = orders.documents[0]
    console.log("Found order:", order.$id, "Status:", order.paymentStatus)

    // Check if transaction has expired
    const expiresAt = new Date(order.expiresAt)
    const now = new Date()
    const isExpired = now > expiresAt

    return NextResponse.json({
      success: true,
      transactionId,
      orderId: order.$id,
      status: order.paymentStatus,
      isExpired,
      expiresAt: order.expiresAt,
      amount: order.amount,
      currency: order.currency,
    })
  } catch (error: any) {
    console.error("Status check error:", error)
    return NextResponse.json(
      {
        error: "Failed to check status",
        details: error.message,
      },
      { status: 500 },
    )
  }
}
