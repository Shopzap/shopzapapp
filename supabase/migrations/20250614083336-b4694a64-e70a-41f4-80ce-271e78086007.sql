
-- Create product_reviews table for buyer reviews with image upload
CREATE TABLE public.product_reviews (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  product_id UUID NOT NULL REFERENCES public.products(id) ON DELETE CASCADE,
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  buyer_name TEXT NOT NULL,
  buyer_email TEXT,
  rating INTEGER NOT NULL CHECK (rating >= 1 AND rating <= 5),
  review_text TEXT,
  review_image_url TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  is_verified BOOLEAN DEFAULT false
);

-- Create analytics_logs table for tracking store metrics
CREATE TABLE public.analytics_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  event_type TEXT NOT NULL, -- 'view', 'click', 'cart_add', 'order'
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  session_id TEXT,
  ip_address INET,
  user_agent TEXT,
  referrer TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referral_logs table for tracking referrals
CREATE TABLE public.referral_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  referred_user_id UUID REFERENCES auth.users(id) ON DELETE SET NULL,
  session_id TEXT NOT NULL,
  ip_address INET,
  event_type TEXT NOT NULL, -- 'visit', 'signup', 'order'
  order_id UUID REFERENCES public.orders(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create wallet_transactions table for referral bonuses
CREATE TABLE public.wallet_transactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  transaction_type TEXT NOT NULL, -- 'credit', 'debit', 'withdrawal_request'
  amount DECIMAL(10,2) NOT NULL,
  description TEXT,
  referral_log_id UUID REFERENCES public.referral_logs(id) ON DELETE SET NULL,
  status TEXT NOT NULL DEFAULT 'completed', -- 'completed', 'pending', 'cancelled'
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Add indexes for better performance
CREATE INDEX idx_product_reviews_product_id ON public.product_reviews(product_id);
CREATE INDEX idx_product_reviews_order_id ON public.product_reviews(order_id);
CREATE INDEX idx_analytics_logs_store_id ON public.analytics_logs(store_id);
CREATE INDEX idx_analytics_logs_created_at ON public.analytics_logs(created_at);
CREATE INDEX idx_referral_logs_referrer_store_id ON public.referral_logs(referrer_store_id);
CREATE INDEX idx_referral_logs_session_id ON public.referral_logs(session_id);
CREATE INDEX idx_wallet_transactions_store_id ON public.wallet_transactions(store_id);

-- Enable RLS on all new tables
ALTER TABLE public.product_reviews ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.analytics_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.referral_logs ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.wallet_transactions ENABLE ROW LEVEL SECURITY;

-- RLS policies for product_reviews (public read, store owners can manage)
CREATE POLICY "Anyone can view product reviews" 
  ON public.product_reviews 
  FOR SELECT 
  USING (true);

CREATE POLICY "Store owners can manage reviews for their products" 
  ON public.product_reviews 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.products p 
      JOIN public.stores s ON p.store_id = s.id 
      WHERE p.id = product_reviews.product_id 
      AND s.user_id = auth.uid()
    )
  );

-- RLS policies for analytics_logs (store owners only)
CREATE POLICY "Store owners can view their analytics" 
  ON public.analytics_logs 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s 
      WHERE s.id = analytics_logs.store_id 
      AND s.user_id = auth.uid()
    )
  );

CREATE POLICY "Store owners can insert analytics for their store" 
  ON public.analytics_logs 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores s 
      WHERE s.id = analytics_logs.store_id 
      AND s.user_id = auth.uid()
    )
  );

-- RLS policies for referral_logs (store owners only)
CREATE POLICY "Store owners can view their referrals" 
  ON public.referral_logs 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s 
      WHERE s.id = referral_logs.referrer_store_id 
      AND s.user_id = auth.uid()
    )
  );

-- RLS policies for wallet_transactions (store owners only)
CREATE POLICY "Store owners can view their wallet transactions" 
  ON public.wallet_transactions 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores s 
      WHERE s.id = wallet_transactions.store_id 
      AND s.user_id = auth.uid()
    )
  );

-- Create storage bucket for review images
INSERT INTO storage.buckets (id, name, public) 
VALUES ('review-images', 'review-images', true)
ON CONFLICT (id) DO NOTHING;

-- Storage policies for review images
CREATE POLICY "Anyone can view review images" 
  ON storage.objects 
  FOR SELECT 
  USING (bucket_id = 'review-images');

CREATE POLICY "Anyone can upload review images" 
  ON storage.objects 
  FOR INSERT 
  WITH CHECK (bucket_id = 'review-images' AND (storage.foldername(name))[1] != '');
