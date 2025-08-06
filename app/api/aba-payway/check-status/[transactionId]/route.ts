import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/appwrite"
import { APP_CONFIG } from "@/lib/app-config"

export async function GET(request: NextRequest, { params }: { params: { transactionId: string } }) {
  try {
    const { transactionId } = params

    if (!transactionId) {
      return NextResponse.json({ error: "Transaction ID is required" }, { status: 400 })
    }

    console.log("🔍 Checking payment status for transaction:", transactionId)

    // Get transaction from database
    const { databases } = await createAdminClient()

    try {
      const transaction = await databases.getDocument(
        APP_CONFIG.APPWRITE.DATABASE_ID,
        APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
        transactionId,
      )

      console.log("📄 Transaction found:", {
        id: transaction.$id,
        status: transaction.status,
        paymentStatus: transaction.paymentStatus,
        amount: transaction.amount,
      })

      return NextResponse.json({
        success: true,
        transaction: {
          id: transaction.$id,
          transactionId: transaction.transactionId || transaction.$id,
          status: transaction.status || "pending",
          paymentStatus: transaction.paymentStatus || "pending",
          amount: Number(transaction.amount) || 0,
          currency: transaction.currency || "USD",
          createdAt: transaction.createdAt,
          updatedAt: transaction.updatedAt,
          paidAt: transaction.paidAt || null,
          listingId: transaction.listingId,
          shopId: transaction.shopId,
          buyerId: transaction.buyerId,
          sellerId: transaction.sellerId,
        },
      })
    } catch (dbError: any) {
      console.error("❌ Transaction not found in database:", dbError)

      if (dbError.code === 404) {
        return NextResponse.json(
          {
            error: "Transaction not found",
            transactionId,
          },
          { status: 404 },
        )
      }

      throw dbError
    }
  } catch (error: any) {
    console.error("💥 Check status error:", error)
    return NextResponse.json(
      {
        error: error.message || "Failed to check payment status",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
