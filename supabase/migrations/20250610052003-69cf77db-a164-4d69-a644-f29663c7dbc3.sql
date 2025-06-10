
-- Add is_admin field to profiles table (since we can't modify auth.users directly)
ALTER TABLE public.profiles ADD COLUMN is_admin BOOLEAN DEFAULT false;

-- Set admin access for the developer account
UPDATE public.profiles 
SET is_admin = true 
WHERE id = (
  SELECT id FROM auth.users WHERE email = 'mdsadique1334@gmail.com'
);

-- Also update the store plan to pro for this user
UPDATE public.stores 
SET plan = 'pro' 
WHERE user_id = (
  SELECT id FROM auth.users WHERE email = 'mdsadique1334@gmail.com'
);
