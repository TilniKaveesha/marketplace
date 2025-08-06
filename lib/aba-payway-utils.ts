import crypto from "crypto"
import { ABA_PAYWAY_CONFIG } from "./aba-payway-config"

export interface ABAQRRequest {
  req_time: string
  merchant_id: string
  tran_id: string
  first_name?: string
  last_name?: string
  email?: string
  phone?: string
  amount: number
  currency: string
  purchase_type?: string
  payment_option: string
  items?: string
  callback_url?: string
  return_deeplink?: string
  custom_fields?: string
  return_params?: string
  payout?: string
  lifetime: number
  qr_image_template: string
  hash: string
}

export interface ABAQRResponse {
  qrString: string
  qrImage: string
  abapay_deeplink: string
  app_store: string
  play_store: string
  amount: number
  currency: string
  status: {
    code: string
    message: string
    tran_id: string
    trace_id: string
  }
}

export interface ABACallbackData {
  status: string
  tran_id: string
  amount: number
  currency: string
  custom_fields?: string
  hash: string
  [key: string]: any
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 6)
  return `${timestamp}${random}`.substring(0, 20)
}

export function formatRequestTime(): string {
  const now = new Date()
  const year = now.getUTCFullYear()
  const month = String(now.getUTCMonth() + 1).padStart(2, "0")
  const day = String(now.getUTCDate()).padStart(2, "0")
  const hours = String(now.getUTCHours()).padStart(2, "0")
  const minutes = String(now.getUTCMinutes()).padStart(2, "0")
  const seconds = String(now.getUTCSeconds()).padStart(2, "0")

  return `${year}${month}${day}${hours}${minutes}${seconds}`
}

export function encodeBase64(data: string): string {
  return Buffer.from(data, "utf8").toString("base64")
}

export function decodeBase64(data: string): string {
  return Buffer.from(data, "base64").toString("utf8")
}

export function generateHash(data: ABAQRRequest): string {
  // Create the string to hash by concatenating values in the specific order
  // req_time, merchant_id, tran_id, amount, items, first_name, last_name, email, phone,
  // purchase_type, payment_option, callback_url, return_deeplink, currency, custom_fields,
  // return_params, payout, lifetime, qr_image_template

  const hashString = [
    data.req_time || "",
    data.merchant_id || "",
    data.tran_id || "",
    data.amount?.toString() || "",
    data.items || "",
    data.first_name || "",
    data.last_name || "",
    data.email || "",
    data.phone || "",
    data.purchase_type || "",
    data.payment_option || "",
    data.callback_url || "",
    data.return_deeplink || "",
    data.currency || "",
    data.custom_fields || "",
    data.return_params || "",
    data.payout || "",
    data.lifetime?.toString() || "",
    data.qr_image_template || "",
  ].join("")

  console.log("Hash string:", hashString)

  // Generate HMAC SHA-512 hash and encode in Base64
  return crypto.createHmac("sha512", ABA_PAYWAY_CONFIG.API_KEY).update(hashString).digest("base64")
}

export function verifyCallbackHash(data: ABACallbackData): boolean {
  try {
    const { hash, ...callbackData } = data

    // Create hash string from callback data (order may vary based on ABA documentation)
    const hashString = [
      callbackData.status || "",
      callbackData.tran_id || "",
      callbackData.amount?.toString() || "",
      callbackData.currency || "",
      callbackData.custom_fields || "",
    ].join("")

    const expectedHash = crypto.createHmac("sha512", ABA_PAYWAY_CONFIG.API_KEY).update(hashString).digest("base64")

    return hash === expectedHash
  } catch (error) {
    console.error("Hash verification error:", error)
    return false
  }
}

export function validateAmount(amount: number, currency: string): boolean {
  if (currency === "USD") {
    return amount >= ABA_PAYWAY_CONFIG.LIMITS.MIN_AMOUNT_USD && amount <= ABA_PAYWAY_CONFIG.LIMITS.MAX_AMOUNT_USD
  } else if (currency === "KHR") {
    return amount >= ABA_PAYWAY_CONFIG.LIMITS.MIN_AMOUNT_KHR && amount <= ABA_PAYWAY_CONFIG.LIMITS.MAX_AMOUNT_KHR
  }
  return false
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}

export function prepareItems(items: any[]): string {
  const formattedItems = items.map((item) => ({
    name: item.name,
    quantity: item.quantity,
    price: Number(item.price),
  }))

  return encodeBase64(JSON.stringify(formattedItems))
}

export function prepareCustomFields(fields: Record<string, any>): string {
  return encodeBase64(JSON.stringify(fields))
}
