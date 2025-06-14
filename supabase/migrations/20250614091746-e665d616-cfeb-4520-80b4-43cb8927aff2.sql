
-- Create ig_feed table for storing Instagram posts
CREATE TABLE public.ig_feed (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  post_id TEXT NOT NULL UNIQUE,
  image_url TEXT NOT NULL,
  caption TEXT,
  permalink TEXT,
  timestamp TIMESTAMP WITH TIME ZONE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create referrals table for tracking referral system
CREATE TABLE public.referrals (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  referrer_store_id UUID NOT NULL,
  referred_user_id UUID NULL,
  session_id TEXT NOT NULL,
  ip_address INET,
  user_agent TEXT,
  order_id UUID NULL,
  status TEXT NOT NULL DEFAULT 'pending',
  converted_at TIMESTAMP WITH TIME ZONE NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(session_id, referrer_store_id)
);

-- Add RLS policies for ig_feed
ALTER TABLE public.ig_feed ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Users can view ig_feed for any store" 
  ON public.ig_feed 
  FOR SELECT 
  USING (true);

CREATE POLICY "Store owners can manage their ig_feed" 
  ON public.ig_feed 
  FOR ALL 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = ig_feed.store_id 
      AND stores.user_id = auth.uid()
    )
  );

-- Add RLS policies for referrals
ALTER TABLE public.referrals ENABLE ROW LEVEL SECURITY;

CREATE POLICY "Referrers can view their referrals" 
  ON public.referrals 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = referrals.referrer_store_id 
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "System can insert referrals" 
  ON public.referrals 
  FOR INSERT 
  WITH CHECK (true);

CREATE POLICY "System can update referrals" 
  ON public.referrals 
  FOR UPDATE 
  USING (true);

-- Add foreign key constraints
ALTER TABLE public.ig_feed 
ADD CONSTRAINT fk_ig_feed_store 
FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.referrals 
ADD CONSTRAINT fk_referrals_store 
FOREIGN KEY (referrer_store_id) REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.referrals 
ADD CONSTRAINT fk_referrals_user 
FOREIGN KEY (referred_user_id) REFERENCES auth.users(id) ON DELETE SET NULL;

ALTER TABLE public.referrals 
ADD CONSTRAINT fk_referrals_order 
FOREIGN KEY (order_id) REFERENCES public.orders(id) ON DELETE SET NULL;

-- Add indexes for performance
CREATE INDEX idx_ig_feed_store_id ON public.ig_feed(store_id);
CREATE INDEX idx_ig_feed_created_at ON public.ig_feed(created_at DESC);
CREATE INDEX idx_referrals_store_id ON public.referrals(referrer_store_id);
CREATE INDEX idx_referrals_session_id ON public.referrals(session_id);
CREATE INDEX idx_referrals_status ON public.referrals(status);
