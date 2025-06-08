
// Payment configuration
export const paymentConfig = {
  // Force test mode until live approval
  isTestMode: true,
  razorpay: {
    // Use test key ID - this will be returned from the edge function
    keyId: 'rzp_test_8iFSU0EtVOddrf',
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
};
