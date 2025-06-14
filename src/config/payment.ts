
// Payment configuration
export const paymentConfig = {
  // Dynamic test mode based on available keys
  isTestMode: true,
  razorpay: {
    // Key ID will be fetched dynamically from the edge function
    keyId: 'rzp_test_UGces6yKSJViJa', // Fallback test key - will be updated dynamically
    webhookSecret: '', // Will be populated from Supabase secrets
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

// Helper function to check if Razorpay is available
export const isRazorpayAvailable = () => {
  // This will be checked dynamically in components
  return true; // Will be updated based on key availability
};
