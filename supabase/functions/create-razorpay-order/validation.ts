
export const validateCredentials = (
  razorpayKeyId: string | undefined,
  razorpaySecret: string | undefined,
  isTestMode: boolean
): { isValid: boolean; error?: any } => {
  console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Key ID available: ${razorpayKeyId ? 'YES' : 'NO'}`);
  console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Secret available: ${razorpaySecret ? 'YES' : 'NO'}`);
  
  if (razorpayKeyId) {
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Key ID prefix: ${razorpayKeyId.substring(0, 15)}...`);
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Key ID length: ${razorpayKeyId.length}`);
  }
  
  if (razorpaySecret) {
    console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Secret length: ${razorpaySecret.length}`);
  }
  
  // Validate that we're using the correct ShopZap test keys
  if (isTestMode && razorpayKeyId && !razorpayKeyId.startsWith('rzp_test_UGces6wIHu4wqX')) {
    console.warn('WARNING: Expected ShopZap.io test key (rzp_test_UGces6wIHu4wqX) but found different key');
  }
  
  if (!razorpayKeyId || !razorpaySecret) {
    console.error('Missing ShopZap.io Razorpay credentials');
    return {
      isValid: false,
      error: {
        success: false,
        error: 'Payment gateway not configured with ShopZap.io credentials. Please contact support.',
        details: 'Missing API credentials',
        testMode: isTestMode,
        keyIdSet: !!razorpayKeyId,
        secretSet: !!razorpaySecret
      }
    };
  }

  return { isValid: true };
};

export const validateAmount = (amount: number, isTestMode: boolean): { isValid: boolean; error?: any } => {
  if (!amount || amount <= 0) {
    console.error('Invalid amount:', amount);
    return {
      isValid: false,
      error: {
        success: false,
        error: 'Invalid payment amount',
        details: 'Amount must be greater than 0',
        testMode: isTestMode
      }
    };
  }
  return { isValid: true };
};
