import { type NextRequest, NextResponse } from "next/server"
import { PAYWAY_CONFIG } from "@/lib/payway-config"

export async function POST(request: NextRequest) {
  try {
    // Get encrypted data from header
    const encryptedData = request.headers.get("X-Encrypted-Data")
    if (!encryptedData) {
      return NextResponse.json({ error: "Missing encrypted data" }, { status: 400 })
    }

    // Decrypt data
    const decryptedData = atob(encryptedData)
    const { orderId, amount } = JSON.parse(decryptedData)

    // Generate unique transaction ID
    const transactionId = `${PAYWAY_CONFIG.merchantId}${new Date()
      .toISOString()
      .replace(/[-:T.]/g, "")
      .slice(0, 14)}${Math.floor(1000 + Math.random() * 9000)}`

    // Prepare PayWay payload
    const payload = {
      merchant_id: PAYWAY_CONFIG.merchantId,
      transaction_id: transactionId,
      amount: amount.toFixed(2),
      currency: "USD",
      description: `Order #${orderId}`,
      return_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/success?order_id=${orderId}&transaction_id=${transactionId}`,
      cancel_url: `${process.env.NEXT_PUBLIC_BASE_URL}/payment/cancel?order_id=${orderId}`,
      callback_url: `${process.env.NEXT_PUBLIC_BASE_URL}/api/payway/webhook`,
      customer_name: "Customer",
      customer_email: "customer@example.com",
      payment_methods: ["card", "wallet"],
    }

    // Call PayWay API to create payment session
    const response = await fetch(`${PAYWAY_CONFIG.baseUrl}/payment/create`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${PAYWAY_CONFIG.apiKey}`,
        Accept: "application/json",
      },
      body: JSON.stringify(payload),
    })

    const responseData = await response.json()

    if (!response.ok) {
      console.error("PayWay API Error:", responseData)
      return NextResponse.json(
        { error: "Failed to create payment session", details: responseData },
        { status: response.status },
      )
    }

    // Return payment URL for redirect
    return NextResponse.json({
      paymentUrl: responseData.payment_url || responseData.redirect_url,
      transactionId,
      sessionId: responseData.session_id,
    })
  } catch (error) {
    console.error("PayWay Create Session Error:", error)
    return NextResponse.json({ error: "Failed to create payment session", details: error }, { status: 500 })
  }
}
