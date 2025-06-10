
-- Add manychat_api_key column to instagram_connections table
ALTER TABLE public.instagram_connections 
ADD COLUMN manychat_api_key TEXT;
