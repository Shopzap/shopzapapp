
-- Ensure the instagram_connections table has all required fields
ALTER TABLE public.instagram_connections 
ADD COLUMN IF NOT EXISTS user_id uuid REFERENCES auth.users(id);

-- Add email column if it doesn't exist
ALTER TABLE public.instagram_connections 
ADD COLUMN IF NOT EXISTS email text;

-- Add connected column if it doesn't exist (renamed from is_active for clarity)
ALTER TABLE public.instagram_connections 
ADD COLUMN IF NOT EXISTS connected boolean DEFAULT true;

-- Create index for better performance
CREATE INDEX IF NOT EXISTS idx_instagram_connections_user_id ON public.instagram_connections(user_id);
CREATE INDEX IF NOT EXISTS idx_instagram_connections_store_id ON public.instagram_connections(store_id);

-- Enable RLS policies for security
ALTER TABLE public.instagram_connections ENABLE ROW LEVEL SECURITY;

-- Drop existing policies if they exist and recreate them
DROP POLICY IF EXISTS "Users can view their own Instagram connections" ON public.instagram_connections;
DROP POLICY IF EXISTS "Users can create their own Instagram connections" ON public.instagram_connections;
DROP POLICY IF EXISTS "Users can update their own Instagram connections" ON public.instagram_connections;
DROP POLICY IF EXISTS "Users can delete their own Instagram connections" ON public.instagram_connections;

-- Create policy for users to access their own connections
CREATE POLICY "Users can view their own Instagram connections" 
  ON public.instagram_connections 
  FOR SELECT 
  USING (
    user_id = auth.uid() OR 
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

-- Create policy for users to insert their own connections
CREATE POLICY "Users can create their own Instagram connections" 
  ON public.instagram_connections 
  FOR INSERT 
  WITH CHECK (
    user_id = auth.uid() OR 
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

-- Create policy for users to update their own connections
CREATE POLICY "Users can update their own Instagram connections" 
  ON public.instagram_connections 
  FOR UPDATE 
  USING (
    user_id = auth.uid() OR 
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );

-- Create policy for users to delete their own connections
CREATE POLICY "Users can delete their own Instagram connections" 
  ON public.instagram_connections 
  FOR DELETE 
  USING (
    user_id = auth.uid() OR 
    store_id IN (SELECT id FROM stores WHERE user_id = auth.uid())
  );
