
import { RazorpayOrderData } from './types.ts';

export const createOrderPayload = (
  amount: number,
  currency: string,
  receipt: string,
  isTestMode: boolean
): RazorpayOrderData => {
  // Ensure amount is in rupees, not already in paise
  // Convert to paise only once and ensure it's an integer
  const amountInPaise = Math.round(amount * 100);
  
  console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Amount conversion: ₹${amount} -> ${amountInPaise} paise`);
  
  return {
    amount: amountInPaise,
    currency: currency.toUpperCase(),
    receipt: `${isTestMode ? 'SHOPZAP_TEST_' : 'SHOPZAP_'}${receipt}`,
    payment_capture: 1, // Auto capture payment
    notes: {
      test_mode: isTestMode ? 'true' : 'false',
      environment: isTestMode ? 'test' : 'production',
      platform: 'ShopZap.io',
      original_amount_rupees: amount.toString()
    }
  };
};

export const createRazorpayOrder = async (
  orderData: RazorpayOrderData,
  razorpayKeyId: string,
  razorpaySecret: string,
  isTestMode: boolean
): Promise<Response> => {
  console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] ShopZap Razorpay order payload:`, orderData);

  // Create Basic Auth header using ShopZap credentials (TRIMMED)
  const credentials = `${razorpayKeyId}:${razorpaySecret}`;
  const encodedCredentials = btoa(credentials);
  
  console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] Making request to Razorpay API with ShopZap credentials...`);

  // Make request to Razorpay Orders API
  const response = await fetch('https://api.razorpay.com/v1/orders', {
    method: 'POST',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Basic ${encodedCredentials}`
    },
    body: JSON.stringify(orderData)
  });

  console.log(`[${isTestMode ? 'TEST' : 'LIVE'}] ShopZap Razorpay API response status: ${response.status}`);
  return response;
};
