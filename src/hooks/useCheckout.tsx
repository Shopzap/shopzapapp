import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { useStore } from '@/contexts/StoreContext';

interface FormData {
  fullName: string;
  email: string;
  phone: string;
  address: string;
  city: string;
  state: string;
  zipCode: string;
  specialInstructions?: string;
}

interface OrderItem {
  id: number;
  name: string;
  price: number;
  quantity: number;
  image: string;
  variant?: {
    id: string;
    options: any;
    name: string;
  };
}

export const useCheckout = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  const { storeData: contextStoreData } = useStore();
  
  const [storeData, setStoreData] = useState<{ id: string; name: string; payment_settings?: any } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [razorpayAvailable, setRazorpayAvailable] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'test' | 'live'>('test');
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('');
  const [sellerAllowsCOD, setSellerAllowsCOD] = useState(true);
  const [sellerAllowsOnline, setSellerAllowsOnline] = useState(true);

  const [orderItems, setOrderItems] = useState<OrderItem[]>(location.state?.orderItems || [
    {
      id: 1,
      name: 'Wireless Earbuds',
      price: 1999,
      quantity: 1,
      image: 'https://placehold.co/80x80'
    },
    {
      id: 2,
      name: 'Phone Case',
      price: 499,
      quantity: 2,
      image: 'https://placehold.co/80x80'
    }
  ]);

  const subtotal = orderItems.reduce((total, item) => total + (item.price * item.quantity), 0);
  const shipping = 0;
  const total = subtotal + shipping;

  // Check Razorpay availability and fetch key
  useEffect(() => {
    const checkRazorpayAvailability = async () => {
      try {
        console.log('Checking Razorpay availability...');
        const { data, error } = await supabase.functions.invoke('check-razorpay-keys');
        
        if (!error && data?.available) {
          console.log('Razorpay is available:', data);
          setRazorpayAvailable(true);
          setPaymentMode(data.mode || 'test');
          setRazorpayKeyId(data.keyId || '');
          console.log('Razorpay key ID set:', data.keyId);
        } else {
          console.log('Razorpay not available, error:', error);
          setRazorpayAvailable(false);
          setRazorpayKeyId('');
        }
      } catch (error) {
        console.error('Error checking Razorpay availability:', error);
        setRazorpayAvailable(false);
        setRazorpayKeyId('');
      }
    };

    checkRazorpayAvailability();
  }, []);

  // Fetch store payment settings and set initial payment method
  useEffect(() => {
    const fetchStorePaymentSettings = async () => {
      if (contextStoreData) {
        console.log('Using real store data:', contextStoreData);
        
        // Get payment settings from store theme/settings
        const storeSettings = contextStoreData.theme && typeof contextStoreData.theme === 'object' 
          ? (contextStoreData.theme as any) 
          : {};
        
        // Check what payment methods the seller allows
        const allowsCOD = storeSettings.allow_cod !== false; // Default to true if not set
        const allowsOnline = storeSettings.allow_online !== false; // Default to true if not set
        
        console.log('Store payment settings:', { allowsCOD, allowsOnline, storeSettings });
        
        setSellerAllowsCOD(allowsCOD);
        setSellerAllowsOnline(allowsOnline);
        
        // Set default payment method based on what's available
        if (allowsCOD && !allowsOnline) {
          setPaymentMethod('cod');
        } else if (!allowsCOD && allowsOnline) {
          setPaymentMethod('online');
        } else if (allowsCOD && allowsOnline) {
          setPaymentMethod('cod'); // Default to COD if both are allowed
        } else {
          // Neither is allowed - this shouldn't happen, but default to COD
          setPaymentMethod('cod');
          console.warn('No payment methods are enabled for this store');
        }
        
        setStoreData({
          id: contextStoreData.id,
          name: contextStoreData.name,
          payment_settings: storeSettings
        });
      } else {
        console.log('No store data available in context');
        setStoreData({ id: 'demo-store-id', name: 'Demo Store' });
      }
    };

    fetchStorePaymentSettings();
  }, [contextStoreData]);

  const loadRazorpay = () => {
    return new Promise((resolve) => {
      if (typeof window !== 'undefined' && window.Razorpay) {
        resolve(true);
        return;
      }
      
      const script = document.createElement('script');
      script.src = 'https://checkout.razorpay.com/v1/checkout.js';
      script.onload = () => resolve(true);
      script.onerror = () => resolve(false);
      document.body.appendChild(script);
    });
  };

  const updateReferralOnOrder = async (orderId: string) => {
    try {
      const sessionId = sessionStorage.getItem('referral_session_id');
      if (!sessionId) return;

      await supabase
        .from('referrals')
        .update({ 
          order_id: orderId, 
          status: 'converted',
          converted_at: new Date().toISOString()
        })
        .eq('session_id', sessionId);
    } catch (error) {
      console.error('Error updating referral:', error);
    }
  };

  const handlePlaceOrder = async (values: FormData) => {
    if (orderItems.length === 0) {
      toast({
        title: "Cart is empty",
        description: "Please add items to your cart before checking out.",
        variant: "destructive"
      });
      return;
    }

    if (!storeData?.id) {
      toast({
        title: "Store Error",
        description: "Store information is not available. Please try again.",
        variant: "destructive"
      });
      setIsLoading(false);
      return;
    }
    
    setIsLoading(true);
    
    try {
      const orderData = {
        storeId: storeData.id,
        storeName: storeData.name,
        buyerName: values.fullName,
        buyerEmail: values.email,
        buyerPhone: values.phone,
        buyerAddress: `${values.address}, ${values.city}, ${values.state} ${values.zipCode}`,
        totalPrice: total,
        items: orderItems.map(item => ({
          productId: `product-${item.id}`,
          quantity: item.quantity,
          priceAtPurchase: item.price,
          name: item.name,
          image: item.image,
          variant: item.variant ? {
            id: item.variant.id,
            name: item.variant.name,
            options: item.variant.options
          } : undefined
        }))
      };

      console.log('Order data prepared:', orderData);

      if (paymentMethod === 'online') {
        // Check if seller allows online payment and Razorpay is available
        if (!sellerAllowsOnline) {
          toast({
            title: "Payment Method Not Available",
            description: "This seller does not accept online payments. Please use Cash on Delivery.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        if (!razorpayAvailable || !razorpayKeyId) {
          toast({
            title: "Payment Unavailable",
            description: "Online payment is currently unavailable. Please use Cash on Delivery.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        const razorpay = await loadRazorpay();

        if (!razorpay) {
          toast({
            title: "Payment Error",
            description: "Payment system failed to load. Please try Cash on Delivery or refresh the page.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        console.log('Creating Razorpay order with key:', razorpayKeyId);

        try {
          const { data: razorpayOrder, error: razorpayError } = await supabase.functions.invoke('create-razorpay-order', {
            body: {
              amount: total * 100,
              currency: 'INR',
              receipt: `order_${Date.now()}`
            }
          });

          if (razorpayError) {
            console.error('Razorpay order creation failed:', razorpayError);
            throw new Error('Failed to create payment order. Please try again or use Cash on Delivery.');
          }

          console.log('Razorpay order created:', razorpayOrder);

          const options = {
            key: razorpayKeyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: storeData.name,
            description: 'Secure online payment',
            order_id: razorpayOrder.razorpayOrderId,
            handler: async function (response: any) {
              try {
                console.log('Payment successful, verifying...', response);
                
                const { data: verificationData, error: verificationError } = await supabase.functions.invoke('verify-payment', {
                  body: {
                    razorpay_order_id: response.razorpay_order_id,
                    razorpay_payment_id: response.razorpay_payment_id,
                    razorpay_signature: response.razorpay_signature,
                    orderData
                  }
                });

                if (verificationError) {
                  console.error('Payment verification failed:', verificationError);
                  toast({
                    title: "Payment Verification Failed",
                    description: "Your payment was processed but verification failed. Please contact support with your payment ID: " + response.razorpay_payment_id,
                    variant: "destructive"
                  });
                  setIsLoading(false);
                  return;
                }

                console.log('Payment verified successfully:', verificationData);

                // Update referral if exists
                await updateReferralOnOrder(verificationData.orderId);

                navigate(`/thank-you?order_id=${verificationData.orderId}`);
              } catch (error) {
                console.error('Error in payment handler:', error);
                toast({
                  title: "Payment Processing Error",
                  description: "There was an error processing your payment. Please contact support with payment ID: " + response.razorpay_payment_id,
                  variant: "destructive"
                });
                setIsLoading(false);
              }
            },
            prefill: {
              name: values.fullName,
              email: values.email,
              contact: values.phone
            },
            notes: {
              order_id: razorpayOrder.razorpayOrderId,
              store_name: storeData.name
            },
            theme: {
              color: '#7b3fe4'
            },
            modal: {
              ondismiss: function() {
                console.log('Payment modal dismissed');
                setIsLoading(false);
              }
            }
          };

          console.log('Opening Razorpay with options:', options);
          const rzp1 = new (window as any).Razorpay(options);
          
          rzp1.on('payment.failed', function (response: any) {
            console.error('Razorpay payment failed:', response);
            toast({
              title: "Payment Failed",
              description: response.error?.description || "Your payment failed. Please try again or use Cash on Delivery.",
              variant: "destructive"
            });
            setIsLoading(false);
          });
          
          rzp1.open();
        } catch (createOrderError) {
          console.error('Error creating Razorpay order:', createOrderError);
          toast({
            title: "Payment Setup Failed",
            description: "Unable to set up online payment. Please try Cash on Delivery.",
            variant: "destructive"
          });
          setIsLoading(false);
        }
      } else {
        // COD Order
        if (!sellerAllowsCOD) {
          toast({
            title: "Payment Method Not Available",
            description: "This seller does not accept Cash on Delivery. Please use online payment.",
            variant: "destructive"
          });
          setIsLoading(false);
          return;
        }

        try {
          console.log('Creating COD order...');
          const { data: orderResult, error: orderError } = await supabase.functions.invoke('verify-payment', {
            body: {
              razorpay_order_id: '',
              razorpay_payment_id: '',
              razorpay_signature: '',
              orderData: {
                ...orderData,
                paymentMethod: 'cod'
              }
            }
          });

          if (orderError) {
            console.error('COD order creation failed:', orderError);
            throw new Error('Failed to create Cash on Delivery order. Please try again.');
          }

          console.log('COD order created successfully:', orderResult);

          // Update referral if exists
          await updateReferralOnOrder(orderResult.orderId);
          
          navigate(`/thank-you?order_id=${orderResult.orderId}`);
        } catch (codError) {
          console.error('COD order error:', codError);
          toast({
            title: "Order Failed",
            description: "Failed to create your Cash on Delivery order. Please try again.",
            variant: "destructive"
          });
        }
      }
    } catch (error) {
      console.error('Order creation failed:', error);
      toast({
        title: "Order Failed",
        description: "There was an unexpected error creating your order. Please try again.",
        variant: "destructive"
      });
    } finally {
      setIsLoading(false);
    }
  };

  return {
    storeData,
    isLoading,
    paymentMethod,
    setPaymentMethod,
    razorpayAvailable,
    paymentMode,
    orderItems,
    subtotal,
    shipping,
    total,
    handlePlaceOrder,
    sellerAllowsCOD,
    sellerAllowsOnline
  };
};
