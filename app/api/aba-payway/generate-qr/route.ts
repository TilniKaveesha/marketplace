import { type NextRequest, NextResponse } from "next/server"
import { createSessionClient } from "@/lib/appwrite"
import { APP_CONFIG } from "@/lib/app-config"
import { ID } from "node-appwrite"
import { ABA_PAYWAY_CONFIG } from "@/lib/aba-payway-config"
import { generateHash, encodeBase64 } from "@/lib/aba-payway-utils"

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { amount, currency = "USD", items, customer, shipping, listingId, shopId } = body

    console.log("🚀 ABA PayWay QR Generation Request:", {
      amount,
      currency,
      itemsCount: items?.length,
      customer: customer?.email,
      listingId,
      shopId,
    })

    // Get current user session
    const { account, databases } = await createSessionClient()

    let user
    try {
      user = await account.get()
    } catch (error) {
      console.error("❌ Authentication failed:", error)
      return NextResponse.json({ error: "Authentication required" }, { status: 401 })
    }

    // Generate unique transaction ID (max 20 characters for ABA PayWay)
    const transactionId = `TXN${Date.now()}${Math.random().toString(36).substring(2, 8)}`.substring(0, 20)

    console.log("📝 Generated Transaction ID:", transactionId)

    // Prepare items for ABA PayWay (Base64 encoded)
    const abaItems = items.map((item: any) => ({
      name: item.name,
      quantity: item.quantity,
      price: Number.parseFloat(item.price.toString()),
    }))

    const itemsEncoded = encodeBase64(JSON.stringify(abaItems))
    console.log("📦 Items encoded for ABA:", itemsEncoded.substring(0, 100) + "...")

    // Prepare callback URLs
    const baseUrl = process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000"
    const returnUrl = `${baseUrl}/payment/success`
    const cancelUrl = `${baseUrl}/payment/cancel`
    const callbackUrl = `${baseUrl}/api/aba-payway/callback`

    console.log("🔗 Callback URLs:", { returnUrl, cancelUrl, callbackUrl })

    // Prepare custom fields (Base64 encoded)
    const customFields = {
      transactionId,
      userId: user.$id,
      listingId,
      shopId,
      customer,
      shipping,
    }
    const customFieldsEncoded = encodeBase64(JSON.stringify(customFields))

    // Prepare payment request data
    const paymentData = {
      req_time: Math.floor(Date.now() / 1000).toString(),
      merchant_id: ABA_PAYWAY_CONFIG.MERCHANT_ID,
      api_key: ABA_PAYWAY_CONFIG.API_KEY,
      amount: amount.toString(),
      currency,
      payment_option: "abapay_deeplink",
      items: itemsEncoded,
      shipping: encodeBase64(
        JSON.stringify({
          first_name: customer.firstName,
          last_name: customer.lastName,
          email: customer.email,
          phone: customer.phone,
          address: shipping.address,
          city: shipping.city,
          postal_code: shipping.postalCode,
        }),
      ),
      enable_store_card: "0",
      tran_id: transactionId,
      return_url: encodeBase64(returnUrl),
      cancel_url: encodeBase64(cancelUrl),
      callback_url: encodeBase64(callbackUrl),
      custom_fields: customFieldsEncoded,
    }

    console.log("💳 Payment data prepared:", {
      ...paymentData,
      items: "encoded",
      shipping: "encoded",
      custom_fields: "encoded",
    })

    // Generate hash
    const hash = generateHash(paymentData)
    console.log("🔐 Generated hash:", hash.substring(0, 20) + "...")

    // Add hash to payment data
    const finalPaymentData = {
      ...paymentData,
      hash,
    }

    // Make request to ABA PayWay API
    console.log("🌐 Making request to ABA PayWay API:", ABA_PAYWAY_CONFIG.API_URL)

    const abaResponse = await fetch(ABA_PAYWAY_CONFIG.API_URL, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Accept: "application/json",
      },
      body: JSON.stringify(finalPaymentData),
    })

    const abaResult = await abaResponse.json()
    console.log("📨 ABA PayWay API Response:", {
      status: abaResponse.status,
      success: abaResult.status === "000",
      message: abaResult.message,
      transactionId: abaResult.tran_id,
    })

    if (!abaResponse.ok || abaResult.status !== "000") {
      console.error("❌ ABA PayWay API Error:", abaResult)
      throw new Error(abaResult.message || "ABA PayWay API request failed")
    }

    // Store transaction in database
    const orderData = {
      orderId: transactionId,
      userId: user.$id,
      listingId,
      shopId,
      status: "pending",
      paymentMethod: "aba_payway",
      paymentStatus: "pending",
      currency,
      amount,
      quantity: items.reduce((sum: number, item: any) => sum + item.quantity, 0),
      items: JSON.stringify(items),
      customer: JSON.stringify(customer),
      shipping: JSON.stringify(shipping),
      abaTransactionId: abaResult.tran_id,
      abaQrCode: abaResult.qr_code,
      abaDeeplink: abaResult.abapay_deeplink,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    }

    console.log("💾 Storing order in database:", {
      orderId: transactionId,
      userId: user.$id,
      paymentStatus: "pending",
    })

    const order = await databases.createDocument(
      APP_CONFIG.APPWRITE.DATABASE_ID,
      APP_CONFIG.APPWRITE.ODERS_COLLECTION_ID,
      transactionId,
      orderData,
    )

    console.log("✅ Order stored successfully:", order.$id)

    // Create notification for shop owner
    try {
      await databases.createDocument(
        APP_CONFIG.APPWRITE.DATABASE_ID,
        APP_CONFIG.APPWRITE.NOTIFICATIONS_COLLECTION_ID,
        ID.unique(),
        {
          userId: shopId,
          type: "new_order",
          title: "New QR Payment Order",
          message: `You have received a new ABA PayWay order for ${items[0]?.name}`,
          data: JSON.stringify({ orderId: transactionId, listingId }),
          read: false,
          createdAt: new Date().toISOString(),
        },
      )
      console.log("🔔 Notification created for shop owner")
    } catch (notificationError) {
      console.error("⚠️ Failed to create notification:", notificationError)
    }

    console.log("🎉 QR Generation completed successfully")

    return NextResponse.json({
      success: true,
      transactionId,
      qrCode: abaResult.qr_code,
      deeplink: abaResult.abapay_deeplink,
      amount,
      currency,
      expiresAt: new Date(Date.now() + 30 * 60 * 1000).toISOString(), // 30 minutes
      message: "QR code generated successfully",
    })
  } catch (error: any) {
    console.error("💥 ABA PayWay QR Generation Error:", error)
    return NextResponse.json({ error: error.message || "Failed to generate QR code" }, { status: 500 })
  }
}
