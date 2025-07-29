export const ABA_PAYWAY_CONFIG = {
  // Environment URLs
  SANDBOX_URL: "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/purchase",
  PRODUCTION_URL: "https://checkout.payway.com.kh/api/payment-gateway/v1/payments/purchase",

  // Get API URL based on environment
  API_URL:
    process.env.NODE_ENV === "production"
      ? "https://api.payway.com.kh/api/payment-gateway/v1/payments/purchase"
      : "https://sandbox-api.payway.com.kh/api/payment-gateway/v1/payments/purchase",

  // Merchant credentials from environment variables
  MERCHANT_ID: process.env.PAYWAY_MERCHANT_ID!,
  API_KEY: process.env.PAYWAY_API_KEY!,
  PUBLIC_KEY: process.env.PAYWAY_PUBLIC_KEY!,
  PRIVATE_KEY: process.env.PAYWAY_PRIVATE_KEY!,

  // Payment options
  PAYMENT_OPTIONS: {
    ABAPAY_DEEPLINK: "abapay_deeplink",
    CARDS: "cards",
    ABAPAY: "abapay",
  },

  // Supported currencies
  CURRENCIES: {
    USD: "USD",
    KHR: "KHR",
  },

  // Transaction limits
  LIMITS: {
    MIN_AMOUNT_USD: 0.5,
    MAX_AMOUNT_USD: 10000,
    MIN_AMOUNT_KHR: 2000,
    MAX_AMOUNT_KHR: 40000000,
  },

  // Timeout settings
  TIMEOUTS: {
    PAYMENT_EXPIRY_MINUTES: 30,
    API_TIMEOUT_MS: 30000,
  },

  // Base URL based on environment
  BASE_URL: process.env.NODE_ENV === "production" ? "https://payway.com.kh" : "https://sandbox.payway.com.kh",
}

// Validation function
export function validatePayWayConfig() {
  const requiredEnvVars = ["PAYWAY_MERCHANT_ID", "PAYWAY_API_KEY", "PAYWAY_PUBLIC_KEY", "PAYWAY_PRIVATE_KEY"]

  const missing = requiredEnvVars.filter((envVar) => !process.env[envVar])

  if (missing.length > 0) {
    throw new Error(`Missing required PayWay environment variables: ${missing.join(", ")}`)
  }

  return true
}
