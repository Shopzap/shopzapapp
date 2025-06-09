
import { ErrorResponse } from './types.ts';

export const handleRazorpayError = async (
  response: Response,
  isTestMode: boolean,
  razorpayKeyId: string
): Promise<ErrorResponse> => {
  const errorText = await response.text();
  console.error(`[${isTestMode ? 'TEST' : 'LIVE'}] ShopZap Razorpay API error response:`, {
    status: response.status,
    statusText: response.statusText,
    body: errorText
  });
  
  let errorMessage = 'Payment initialization failed';
  let userFriendlyMessage = `Unable to process payment${isTestMode ? ' (TEST MODE)' : ''} with ShopZap.io account. Please try again or contact support.`;
  
  try {
    const errorData = JSON.parse(errorText);
    if (errorData.error) {
      errorMessage = errorData.error.description || errorData.error.code || errorMessage;
      
      // Provide user-friendly messages for common errors
      if (errorData.error.code === 'BAD_REQUEST_ERROR') {
        if (errorMessage.includes('Authentication failed')) {
          userFriendlyMessage = `Payment gateway authentication failed with ShopZap.io credentials${isTestMode ? ' (TEST MODE)' : ''}. Please contact support.`;
        } else if (errorMessage.includes('amount')) {
          userFriendlyMessage = 'Invalid payment amount. Please try again.';
        }
      } else if (response.status === 401) {
        userFriendlyMessage = `Payment gateway authentication failed with ShopZap.io credentials${isTestMode ? ' (TEST MODE)' : ''}. Please contact support.`;
      }
    }
  } catch (parseError) {
    console.error('Failed to parse ShopZap Razorpay error response:', parseError);
  }
  
  return {
    success: false,
    error: userFriendlyMessage,
    details: errorMessage,
    code: response.status,
    testMode: isTestMode,
    razorpayKeyId: razorpayKeyId ? `${razorpayKeyId.substring(0, 15)}...` : 'NOT SET'
  };
};

export const handleGenericError = (error: any): ErrorResponse => {
  console.error("Error in ShopZap create-razorpay-order function:", error);
  console.error("Error stack:", error.stack);
  
  return {
    success: false,
    error: 'Payment service temporarily unavailable with ShopZap.io credentials. Please try again.',
    details: error.message || 'Internal server error',
    testMode: true, // Default to test mode for errors
    platform: 'ShopZap.io'
  };
};
