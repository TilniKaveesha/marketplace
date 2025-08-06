export const ABA_PAYWAY_CONFIG = {
  // API Configuration
  API_URL: "https://checkout-sandbox.payway.com.kh/api/payment-gateway/v1/payments/generate-qr",
  MERCHANT_ID: process.env.ABA_MERCHANT_ID || "",
  API_KEY: process.env.ABA_API_KEY || "",
  BASE_URL: process.env.NEXT_PUBLIC_BASE_URL || "http://localhost:3000",

  // Current API URL (can be switched between sandbox and production)
  get CURRENT_API_URL() {
    return process.env.NODE_ENV === "production" 
      ? "https://checkout.payway.com.kh/api/payment-gateway/v1/payments/generate-qr"
      : this.API_URL
  },

  // Payment Options
  PAYMENT_OPTIONS: {
    ABA_KHQR: "abapay_khqr",
    WECHAT: "wechat",
    ALIPAY: "alipay",
  } as const,

  // Purchase Types
  PURCHASE_TYPES: {
    PURCHASE: "purchase",
    PRE_AUTH: "pre-auth",
  } as const,

  // QR Templates
  QR_TEMPLATES: {
    TEMPLATE1_COLOR: "template1_color",
    TEMPLATE2_COLOR: "template2_color", 
    TEMPLATE3_COLOR: "template3_color",
    TEMPLATE1_BW: "template1_bw",
    TEMPLATE2_BW: "template2_bw",
    TEMPLATE3_BW: "template3_bw",
  } as const,

  // Amount Limits
  LIMITS: {
    MIN_AMOUNT_USD: 0.01,
    MAX_AMOUNT_USD: 10000,
    MIN_AMOUNT_KHR: 100,
    MAX_AMOUNT_KHR: 40000000,
  },

  // Default Values
  DEFAULTS: {
    LIFETIME_MINUTES: 30,
    PURCHASE_TYPE: "purchase" as const,
    QR_TEMPLATE: "template3_color" as const,
    CURRENCY: "USD" as const,
  },

  // Supported Currencies
  CURRENCIES: {
    USD: "USD",
    KHR: "KHR",
  } as const,
}

export function validateABAConfig(): void {
  if (!ABA_PAYWAY_CONFIG.MERCHANT_ID) {
    throw new Error("ABA_MERCHANT_ID environment variable is required")
  }
  
  if (!ABA_PAYWAY_CONFIG.API_KEY) {
    throw new Error("ABA_API_KEY environment variable is required")
  }

  if (!ABA_PAYWAY_CONFIG.BASE_URL) {
    throw new Error("NEXT_PUBLIC_BASE_URL environment variable is required")
  }
}

export type PaymentOption = typeof ABA_PAYWAY_CONFIG.PAYMENT_OPTIONS[keyof typeof ABA_PAYWAY_CONFIG.PAYMENT_OPTIONS]
export type PurchaseType = typeof ABA_PAYWAY_CONFIG.PURCHASE_TYPES[keyof typeof ABA_PAYWAY_CONFIG.PURCHASE_TYPES]
export type QRTemplate = typeof ABA_PAYWAY_CONFIG.QR_TEMPLATES[keyof typeof ABA_PAYWAY_CONFIG.QR_TEMPLATES]
export type Currency = typeof ABA_PAYWAY_CONFIG.CURRENCIES[keyof typeof ABA_PAYWAY_CONFIG.CURRENCIES]
