
import { useState, useEffect } from 'react';
import { useLocation, useNavigate } from 'react-router-dom';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { paymentConfig } from '@/config/payment';

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
}

export const useCheckout = () => {
  const { toast } = useToast();
  const location = useLocation();
  const navigate = useNavigate();
  
  const [storeData, setStoreData] = useState<{ id: string; name: string } | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<'cod' | 'online'>('cod');
  const [razorpayAvailable, setRazorpayAvailable] = useState(false);
  const [paymentMode, setPaymentMode] = useState<'test' | 'live'>('test');
  const [razorpayKeyId, setRazorpayKeyId] = useState<string>('');

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
          console.log('Razorpay not available, using fallback');
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

  // Fetch store data
  useEffect(() => {
    const fetchStoreData = async () => {
      try {
        setStoreData({ id: 'demo-store-id', name: 'Demo Store' });
      } catch (error) {
        console.error('Failed to fetch store data:', error);
        toast({
          title: "Store Error",
          description: "Failed to load store information. Please try again.",
          variant: "destructive"
        });
      }
    };

    fetchStoreData();
  }, []);

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
    
    setIsLoading(true);
    
    try {
      const orderData = {
        storeId: storeData?.id || 'demo-store-id',
        buyerName: values.fullName,
        buyerEmail: values.email,
        buyerPhone: values.phone,
        buyerAddress: `${values.address}, ${values.city}, ${values.state} ${values.zipCode}`,
        totalPrice: total,
        items: orderItems.map(item => ({
          productId: `product-${item.id}`,
          quantity: item.quantity,
          priceAtPurchase: item.price
        }))
      };

      if (paymentMethod === 'online') {
        // Check if Razorpay is available and key is set
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

          const options = {
            key: razorpayKeyId,
            amount: razorpayOrder.amount,
            currency: razorpayOrder.currency,
            name: storeData?.name || 'ShopZap Store',
            description: 'Secure online payment',
            order_id: razorpayOrder.id,
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

                navigate('/order-success', {
                  state: {
                    orderId: verificationData.orderId,
                    orderItems,
                    total,
                    customerInfo: values,
                    paymentInfo: {
                      paymentId: response.razorpay_payment_id,
                      paymentMethod: 'Razorpay',
                      paymentTime: new Date().toISOString(),
                      paymentStatus: 'Paid'
                    },
                    estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()
                  }
                });
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
              order_id: razorpayOrder.id
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
        try {
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

          // Update referral if exists
          await updateReferralOnOrder(orderResult.orderId);
          
          navigate('/order-success', {
            state: {
              orderId: orderResult.orderId,
              orderItems,
              total,
              customerInfo: values,
              paymentInfo: {
                paymentMethod: 'Cash on Delivery',
                paymentStatus: 'Pending'
              },
              estimatedDelivery: new Date(Date.now() + 5 * 24 * 60 * 60 * 1000).toDateString()
            }
          });
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
    handlePlaceOrder
  };
};
