
-- Create table for Instagram connections
CREATE TABLE public.instagram_connections (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  instagram_page_id TEXT NOT NULL,
  manychat_page_id TEXT NOT NULL,
  page_name TEXT,
  access_token TEXT,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(store_id, instagram_page_id)
);

-- Create table for keyword triggers
CREATE TABLE public.ig_keywords (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  keyword TEXT NOT NULL,
  language TEXT NOT NULL CHECK (language IN ('english', 'hindi', 'hinglish')),
  reply_template TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for reels/post automation
CREATE TABLE public.ig_reels_automation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  post_url TEXT NOT NULL,
  trigger_word TEXT NOT NULL DEFAULT 'link please',
  reply_message TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  is_active BOOLEAN DEFAULT true,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Create table for story reply automation
CREATE TABLE public.ig_story_automation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  reply_message TEXT NOT NULL,
  product_id UUID REFERENCES public.products(id) ON DELETE SET NULL,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(store_id)
);

-- Create table for follower welcome automation
CREATE TABLE public.ig_welcome_automation (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  is_enabled BOOLEAN DEFAULT false,
  welcome_message TEXT NOT NULL DEFAULT 'Namaste! Welcome to our store. Thanks for following us! 🙏',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(store_id)
);

-- Create table for DM analytics (Pro feature)
CREATE TABLE public.ig_dm_analytics (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  date DATE NOT NULL DEFAULT CURRENT_DATE,
  total_dms_sent INTEGER DEFAULT 0,
  keyword_triggers JSONB DEFAULT '{}',
  reel_comment_conversions INTEGER DEFAULT 0,
  link_clicks INTEGER DEFAULT 0,
  dm_to_order_conversions INTEGER DEFAULT 0,
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE DEFAULT now(),
  UNIQUE(store_id, date)
);

-- Create table for DM logs
CREATE TABLE public.ig_dm_logs (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL REFERENCES public.stores(id) ON DELETE CASCADE,
  trigger_type TEXT NOT NULL CHECK (trigger_type IN ('keyword', 'reel_comment', 'story_reply', 'new_follower')),
  trigger_data JSONB,
  message_sent TEXT,
  recipient_id TEXT,
  manychat_message_id TEXT,
  status TEXT DEFAULT 'sent',
  created_at TIMESTAMP WITH TIME ZONE DEFAULT now()
);

-- Enable RLS on all tables
ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_keywords ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_reels_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_story_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_welcome_automation ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_dm_analytics ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.ig_dm_logs ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for store owners only
CREATE POLICY "Store owners can manage their Instagram connections" 
  ON public.instagram_connections 
  FOR ALL 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Store owners can manage their keywords" 
  ON public.ig_keywords 
  FOR ALL 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Store owners can manage their reels automation" 
  ON public.ig_reels_automation 
  FOR ALL 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Store owners can manage their story automation" 
  ON public.ig_story_automation 
  FOR ALL 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Store owners can manage their welcome automation" 
  ON public.ig_welcome_automation 
  FOR ALL 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Store owners can view their DM analytics" 
  ON public.ig_dm_analytics 
  FOR ALL 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

CREATE POLICY "Store owners can view their DM logs" 
  ON public.ig_dm_logs 
  FOR ALL 
  USING (store_id IN (SELECT id FROM public.stores WHERE user_id = auth.uid()));

-- Create indexes for better performance
CREATE INDEX idx_ig_keywords_store_id ON public.ig_keywords(store_id);
CREATE INDEX idx_ig_keywords_keyword ON public.ig_keywords(keyword);
CREATE INDEX idx_ig_reels_automation_store_id ON public.ig_reels_automation(store_id);
CREATE INDEX idx_ig_dm_analytics_store_date ON public.ig_dm_analytics(store_id, date);
CREATE INDEX idx_ig_dm_logs_store_id ON public.ig_dm_logs(store_id);
CREATE INDEX idx_ig_dm_logs_created_at ON public.ig_dm_logs(created_at);
