import { type NextRequest, NextResponse } from "next/server"
import { createAdminClient } from "@/lib/appwrite"
import { APP_CONFIG } from "@/lib/app-config"
import {
  generateTransactionId,
  formatRequestTime,
  generateHash,
  validateAmount,
  prepareItems,
  prepareCustomFields,
  encodeBase64,
  type ABAQRRequest,
} from "@/lib/aba-payway-utils"
import { ABA_PAYWAY_CONFIG } from "@/lib/aba-payway-config"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    console.log("🚀 ABA QR Generation Request:", body)

    const { amount, currency = "USD", items = [], customer = {}, shipping = {}, listingId, shopId, displayTitle } = body

    // Validate required fields
    if (!amount || !listingId || !shopId) {
      return NextResponse.json({ error: "Missing required fields: amount, listingId, shopId" }, { status: 400 })
    }

    // Validate amount
    if (!validateAmount(amount, currency)) {
      const minAmount =
        currency === "USD" ? ABA_PAYWAY_CONFIG.LIMITS.MIN_AMOUNT_USD : ABA_PAYWAY_CONFIG.LIMITS.MIN_AMOUNT_KHR
      return NextResponse.json({ error: `Amount must be at least ${minAmount} ${currency}` }, { status: 400 })
    }

    // Generate transaction ID
    const transactionId = generateTransactionId()
    const reqTime = formatRequestTime()

    // Prepare items for ABA
    const itemsBase64 = items.length > 0 ? prepareItems(items) : ""

    // Prepare custom fields with our internal data
    const customFields = prepareCustomFields({
      listingId,
      shopId,
      userId: customer.userId || "",
      source: "marketplace",
    })

    // Prepare callback URL
    const callbackUrl = encodeBase64(`${ABA_PAYWAY_CONFIG.BASE_URL}/api/aba-payway/callback`)

    // Prepare ABA QR request
    const abaRequest: ABAQRRequest = {
      req_time: reqTime,
      merchant_id: ABA_PAYWAY_CONFIG.MERCHANT_ID,
      tran_id: transactionId,
      first_name: customer.firstName || "",
      last_name: customer.lastName || "",
      email: customer.email || "",
      phone: customer.phone || "",
      amount: Number(amount),
      currency: currency.toUpperCase(),
      purchase_type: ABA_PAYWAY_CONFIG.PURCHASE_TYPES.PURCHASE,
      payment_option: ABA_PAYWAY_CONFIG.PAYMENT_OPTIONS.ABA_KHQR,
      items: itemsBase64,
      callback_url: callbackUrl,
      return_deeplink: "",
      custom_fields: customFields,
      return_params: "",
      payout: "",
      lifetime: 30, // 30 minutes
      qr_image_template: ABA_PAYWAY_CONFIG.QR_TEMPLATES.TEMPLATE3_COLOR,
      hash: "", // Will be generated below
    }

    // Generate hash
    abaRequest.hash = generateHash(abaRequest)

    console.log("📤 Sending request to ABA:", {
      ...abaRequest,
      hash: abaRequest.hash.substring(0, 20) + "...", // Log partial hash for security
    })

    // Create order record in database first
    const { databases } = await createAdminClient()

    try {
      await databases.createDocument(
        APP_CONFIG.APPWRITE.DATABASE_ID,
        APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
        transactionId,
        { userId: customer.userId || "",
          transactionId,
          listingId,
          listingTitle: displayTitle || "",
          shopId:shopId,
          price: Number(amount),
          currency,
          paymentMethod: "aba_payway",
          paymentStatus: "pending",
          status: "pending",
          customerInfo: JSON.stringify(customer),
          shippingInfo: JSON.stringify(shipping),
          items: JSON.stringify(items),
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        },
      )
      console.log("✅ Order record created:", transactionId)
    } catch (dbError) {
      console.error("❌ Failed to create order record:", dbError)
      return NextResponse.json({ error: "Failed to create order record" }, { status: 500 })
    }

    // Make request to ABA API
    const abaResponse = await fetch(ABA_PAYWAY_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(abaRequest),
    })

    const abaResult = await abaResponse.json()
    console.log("📥 ABA Response:", {
      status: abaResult.status,
      hasQR: !!abaResult.qrString,
    })

    if (!abaResponse.ok || abaResult.status?.code !== "0") {
      console.error("❌ ABA API Error:", abaResult)

      // Update order status to failed
      try {
        await databases.updateDocument(
          APP_CONFIG.APPWRITE.DATABASE_ID,
          APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
          transactionId,
          {
            paymentStatus: "failed",
            status: "cancelled",
            errorMessage: abaResult.status?.message || "QR generation failed",
            updatedAt: new Date().toISOString(),
          },
        )
      } catch (updateError) {
        console.error("Failed to update order status:", updateError)
      }

      return NextResponse.json(
        {
          error: abaResult.status?.message || "Failed to generate QR code",
          code: abaResult.status?.code,
        },
        { status: 400 },
      )
    }

    // Return successful response
    return NextResponse.json({
      success: true,
      transactionId,
      qrString: abaResult.qrString,
      qrImage: abaResult.qrImage,
      abapayDeeplink: abaResult.abapay_deeplink,
      appStore: abaResult.app_store,
      playStore: abaResult.play_store,
      amount: abaResult.amount,
      currency: abaResult.currency,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes from now
    })
  } catch (error: any) {
    console.error("💥 ABA QR Generation Error:", error)
    return NextResponse.json(
      {
        error: error.message || "Internal server error",
        details: process.env.NODE_ENV === "development" ? error.stack : undefined,
      },
      { status: 500 },
    )
  }
}
