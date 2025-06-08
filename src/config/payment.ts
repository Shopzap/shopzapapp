
// Payment configuration
export const paymentConfig = {
  razorpay: {
    // Use environment variables in production, fallback to test keys for development
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_9WaeLLTuasdhHX',
    // Secret key should only be used on server-side (in Supabase functions)
    secretKey: import.meta.env.VITE_RAZORPAY_SECRET_KEY || '', // Only for server-side usage
    webhookSecret: import.meta.env.VITE_RAZORPAY_WEBHOOK_SECRET || '',
    endpoints: {
      success: `${window.location.origin}/order-success`,
      failure: `${window.location.origin}/checkout`,
      webhook: `${window.location.origin}/api/webhook/razorpay`
    }
  },
  // Add other payment providers here
  whatsapp: {
    checkoutEnabled: true,
    messageTemplate: 'Thank you for your order! Your order ID is: {orderId}'
  }
};

// Environment variables setup guide
export const envSetupGuide = {
  required: [
    'VITE_RAZORPAY_KEY_ID', // Public key - safe to expose in frontend
    'RAZORPAY_SECRET_KEY', // Secret key - only for server-side (Supabase functions)
    'RAZORPAY_WEBHOOK_SECRET' // Webhook secret - only for server-side
  ],
  development: {
    VITE_RAZORPAY_KEY_ID: 'rzp_test_9WaeLLTuasdhHX', // Test key
    note: 'For development, test keys are used by default'
  },
  production: {
    note: 'Set actual Razorpay keys in production environment variables'
  }
};
