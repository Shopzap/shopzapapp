
-- Create bank_details table for storing seller payout information
CREATE TABLE public.bank_details (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  user_id UUID NOT NULL REFERENCES auth.users(id) ON DELETE CASCADE,
  account_holder_name TEXT NOT NULL,
  bank_name TEXT NOT NULL,
  account_number TEXT NOT NULL,
  ifsc_code TEXT NOT NULL,
  upi_id TEXT,
  pan_number TEXT,
  gst_number TEXT,
  payout_method TEXT NOT NULL DEFAULT 'bank_transfer' CHECK (payout_method IN ('bank_transfer', 'upi')),
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  UNIQUE(user_id)
);

-- Enable Row Level Security
ALTER TABLE public.bank_details ENABLE ROW LEVEL SECURITY;

-- Policy: Users can view their own bank details
CREATE POLICY "Users can view their own bank details" 
  ON public.bank_details 
  FOR SELECT 
  USING (auth.uid() = user_id);

-- Policy: Users can insert their own bank details
CREATE POLICY "Users can insert their own bank details" 
  ON public.bank_details 
  FOR INSERT 
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can update their own bank details
CREATE POLICY "Users can update their own bank details" 
  ON public.bank_details 
  FOR UPDATE 
  USING (auth.uid() = user_id)
  WITH CHECK (auth.uid() = user_id);

-- Policy: Users can delete their own bank details
CREATE POLICY "Users can delete their own bank details" 
  ON public.bank_details 
  FOR DELETE 
  USING (auth.uid() = user_id);

-- Create function to auto-update the updated_at timestamp
CREATE OR REPLACE FUNCTION public.handle_updated_at()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to automatically update updated_at
CREATE TRIGGER handle_bank_details_updated_at
  BEFORE UPDATE ON public.bank_details
  FOR EACH ROW
  EXECUTE FUNCTION public.handle_updated_at();
