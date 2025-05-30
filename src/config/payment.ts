// Payment configuration
export const paymentConfig = {
  razorpay: {
    keyId: process.env.RAZORPAY_KEY_ID || '',
    webhookSecret: process.env.RAZORPAY_WEBHOOK_SECRET || '',
    endpoints: {
      success: 'https://shopzap.io/payment/success',
      failure: 'https://shopzap.io/payment/failure',
      webhook: 'https://shopzap.io/api/webhook/razorpay'
    }
  },
  // Add other payment providers here
  whatsapp: {
    checkoutEnabled: true,
    messageTemplate: 'Thank you for your order! Your order ID is: {orderId}'
  }
}