
export interface CreateOrderRequest {
  amount: number;
  currency: string;
  receipt: string;
  isTestMode?: boolean;
}

export interface RazorpayOrderData {
  amount: number;
  currency: string;
  receipt: string;
  payment_capture: number;
  notes: {
    test_mode: string;
    environment: string;
    platform: string;
  };
}

export interface ErrorResponse {
  success: false;
  error: string;
  details: string;
  code?: number;
  testMode: boolean;
  razorpayKeyId?: string;
  keyIdSet?: boolean;
  secretSet?: boolean;
}

export interface SuccessResponse {
  success: true;
  razorpayOrderId: string;
  amount: number;
  currency: string;
  receipt: string;
  testMode: boolean;
  testMessage?: string;
  keyId: string;
  platform: string;
}
