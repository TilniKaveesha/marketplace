
export const PAYWAY_CONFIG = {
  baseUrl: process.env.NODE_ENV === 'production'
    ? 'https://payway.com.kh/api/gateway/v2'
    : 'https://sandbox.payway.com.kh/api/gateway/v2',
  merchantId: process.env.PAYWAY_MERCHANT_ID!,
  apiKey: process.env.PAYWAY_API_KEY!,
};