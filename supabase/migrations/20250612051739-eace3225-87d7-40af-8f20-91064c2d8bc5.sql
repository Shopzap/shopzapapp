
-- Drop existing ManyChat related tables and create new SendPulse tables
DROP TABLE IF EXISTS ig_keywords CASCADE;
DROP TABLE IF EXISTS ig_reels_automation CASCADE;
DROP TABLE IF EXISTS ig_welcome_automation CASCADE;
DROP TABLE IF EXISTS ig_story_automation CASCADE;

-- Update instagram_connections table for SendPulse
ALTER TABLE instagram_connections 
DROP COLUMN IF EXISTS manychat_page_id,
DROP COLUMN IF EXISTS manychat_api_key,
ADD COLUMN IF NOT EXISTS ig_username TEXT,
ADD COLUMN IF NOT EXISTS sendpulse_page_id TEXT,
ADD COLUMN IF NOT EXISTS connected_at TIMESTAMP WITH TIME ZONE DEFAULT now();

-- Create new ig_automations table
CREATE TABLE IF NOT EXISTS public.ig_automations (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  store_id UUID NOT NULL,
  product_id UUID,
  trigger_keywords TEXT[] NOT NULL DEFAULT '{}',
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on new table
ALTER TABLE public.ig_automations ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for ig_automations
CREATE POLICY "Users can view their store automations" 
  ON public.ig_automations 
  FOR SELECT 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = ig_automations.store_id 
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can create automations for their stores" 
  ON public.ig_automations 
  FOR INSERT 
  WITH CHECK (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = ig_automations.store_id 
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can update their store automations" 
  ON public.ig_automations 
  FOR UPDATE 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = ig_automations.store_id 
      AND stores.user_id = auth.uid()
    )
  );

CREATE POLICY "Users can delete their store automations" 
  ON public.ig_automations 
  FOR DELETE 
  USING (
    EXISTS (
      SELECT 1 FROM public.stores 
      WHERE stores.id = ig_automations.store_id 
      AND stores.user_id = auth.uid()
    )
  );

-- Add foreign key constraints
ALTER TABLE public.ig_automations
ADD CONSTRAINT fk_ig_automations_store_id 
FOREIGN KEY (store_id) REFERENCES public.stores(id) ON DELETE CASCADE;

ALTER TABLE public.ig_automations
ADD CONSTRAINT fk_ig_automations_product_id 
FOREIGN KEY (product_id) REFERENCES public.products(id) ON DELETE SET NULL;
