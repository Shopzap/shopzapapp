
// Payment configuration with proper test mode handling
export const paymentConfig = {
  isTestMode: true, // Set to false for production
  razorpay: {
    keyId: process.env.NODE_ENV === 'production' 
      ? 'rzp_live_YOUR_LIVE_KEY_ID' 
      : 'rzp_test_YOUR_TEST_KEY_ID', // Replace with actual test key
    keySecret: process.env.NODE_ENV === 'production'
      ? 'rzp_live_YOUR_LIVE_KEY_SECRET'
      : 'rzp_test_YOUR_TEST_KEY_SECRET' // Replace with actual test secret
  },
  testCards: {
    success: '4111111111111111',
    failure: '4000000000000002'
  }
};

// Validation function for payment config
export const validatePaymentConfig = () => {
  const config = paymentConfig;
  
  if (!config.razorpay.keyId || config.razorpay.keyId.includes('YOUR_')) {
    console.error('Razorpay Key ID not configured properly');
    return false;
  }
  
  if (!config.razorpay.keySecret || config.razorpay.keySecret.includes('YOUR_')) {
    console.error('Razorpay Key Secret not configured properly');
    return false;
  }
  
  return true;
};
