import crypto from "crypto"
import { ABA_PAYWAY_CONFIG } from "./aba-payway-config"

export interface ABAPaymentRequest {
  req_time: string
  merchant_id: string
  api_key: string
  amount: string
  currency: string
  payment_option: string
  items: string
  shipping: string
  enable_store_card: string
  tran_id: string
  return_url: string
  cancel_url: string
  callback_url: string
  custom_fields: string
  hash: string
}

export interface ABAPaymentResponse {
  status: string
  message: string
  tran_id: string
  qr_code?: string
  abapay_deeplink?: string
  payment_url?: string
}

export function generateTransactionId(): string {
  const timestamp = Date.now().toString()
  const random = Math.random().toString(36).substring(2, 8)
  return `TXN${timestamp}${random}`.substring(0, 20)
}

export function formatRequestTime(): string {
  return Math.floor(Date.now() / 1000).toString()
}

export function encodeBase64(data: string): string {
  return Buffer.from(data, "utf8").toString("base64")
}

export function decodeBase64(data: string): string {
  return Buffer.from(data, "base64").toString("utf8")
}

export function generateHash(data: Record<string, any>): string {
  // Create the string to hash by concatenating values in alphabetical order of keys
  const sortedKeys = Object.keys(data).sort()
  const dataString = sortedKeys.map((key) => data[key]).join("")

  // Generate HMAC SHA-512 hash
  return crypto.createHmac("sha512", ABA_PAYWAY_CONFIG.API_KEY).update(dataString).digest("base64")
}

export function validateAmount(amount: number): boolean {
  return amount > 0 && amount <= 999999.99
}

export function formatCurrency(amount: number, currency: string): string {
  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency,
  }).format(amount)
}
