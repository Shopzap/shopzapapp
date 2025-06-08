
// Payment configuration - TEST MODE for pre-launch testing
export const paymentConfig = {
  // Test mode flag - set to false when going live
  isTestMode: true,
  
  razorpay: {
    // Test credentials for development and pre-launch testing
    keyId: import.meta.env.VITE_RAZORPAY_KEY_ID || 'rzp_test_9WaeLLTuasdhHX',
    // Secret key should only be used on server-side (in Supabase functions)
    secretKey: import.meta.env.VITE_RAZORPAY_SECRET_KEY || '', // Only for server-side usage
    webhookSecret: import.meta.env.VITE_RAZORPAY_WEBHOOK_SECRET || '',
    
    // Test API endpoints (same as live)
    apiBaseUrl: 'https://api.razorpay.com/v1',
    
    // Success/failure redirect URLs
    endpoints: {
      success: `${window.location.origin}/order-success`,
      failure: `${window.location.origin}/checkout`,
      webhook: `${window.location.origin}/api/webhook/razorpay`
    },
    
    // Test card details for testing
    testCards: {
      visa: {
        number: '4111 1111 1111 1111',
        expiry: '12/25',
        cvv: '123',
        name: 'Test User'
      },
      mastercard: {
        number: '5555 5555 5555 4444',
        expiry: '12/25',
        cvv: '123',
        name: 'Test User'
      }
    }
  },
  
  // WhatsApp checkout for COD orders
  whatsapp: {
    checkoutEnabled: true,
    messageTemplate: 'Thank you for your order! Your order ID is: {orderId}. In TEST MODE.'
  }
};

// Environment variables setup guide for test mode
export const envSetupGuide = {
  testMode: {
    note: 'Currently running in TEST MODE for pre-launch testing',
    testCredentials: {
      VITE_RAZORPAY_KEY_ID: 'rzp_test_9WaeLLTuasdhHX', // Default test key
      note: 'Use your own test keys from Razorpay dashboard'
    }
  },
  required: [
    'VITE_RAZORPAY_KEY_ID', // Public test key - safe to expose in frontend
    'RAZORPAY_SECRET_KEY', // Secret test key - only for server-side (Supabase functions)
    'RAZORPAY_WEBHOOK_SECRET' // Webhook secret - only for server-side
  ],
  production: {
    note: 'Switch isTestMode to false and update keys when going live'
  }
};
